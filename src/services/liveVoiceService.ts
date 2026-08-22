import { downsampleTo16k, floatTo16BitPCM, pcmToBase64, base64ToAudioBuffer } from './audioUtils';
import { LifeParticipationGraph, Opportunity, MemoryConsentPrompt, ConversationState, LiveConnectionStatus } from '../types';

export interface LiveVoiceCallbacks {
  onStateChange: (state: ConversationState) => void;
  onUserTranscript: (text: string) => void;
  onModelTranscript: (text: string) => void;
  onVolumeChange?: (volume: number) => void;
  onGraphUpdated?: (graph: LifeParticipationGraph, recommendations?: Opportunity[]) => void;
  onRecommendationsRequested?: (recommendations: Opportunity[], triggerReason?: string) => void;
  onOpportunityAccepted?: (opportunity: Opportunity, updatedGraph: LifeParticipationGraph) => void;
  onOpportunityRejected?: (reason: string, barrier?: string, updatedGraph?: LifeParticipationGraph, recommendations?: Opportunity[]) => void;
  onExplainRequested?: (opportunity: Opportunity) => void;
  onMemoryConsentRequested?: (consent: MemoryConsentPrompt) => void;
  onNavigateScreen?: (screen: string) => void;
  onConnectionStatusChange?: (status: LiveConnectionStatus, message?: string) => void;
  onError?: (error: string) => void;
}

export class LiveVoiceService {
  private ws: WebSocket | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaSource: MediaStreamAudioSourceNode | null = null;
  private silentGain: GainNode | null = null;

  private activeAudioSources: AudioBufferSourceNode[] = [];
  private nextScheduledPlayTime: number = 0;
  private isAudioPlaying: boolean = false;
  private isRecording: boolean = false;
  private playbackHoldoffUntil: number = 0;
  private listeningReturnTimer: number | null = null;

  private callbacks: LiveVoiceCallbacks;
  private currentGraph: LifeParticipationGraph | null = null;
  private activeOpportunityId: string | null = null;
  private connectionStatus: LiveConnectionStatus = 'disconnected';

  // User & model live text accumulators
  private currentUserText: string = '';
  private currentModelText: string = '';

  constructor(callbacks: LiveVoiceCallbacks) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: Partial<LiveVoiceCallbacks>) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setGraph(graph: LifeParticipationGraph) {
    this.currentGraph = graph;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'update_graph', graph }));
    }
  }

  public setActiveOpportunityId(opportunityId: string) {
    this.activeOpportunityId = opportunityId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'set_active_opportunity', opportunityId }));
    }
  }

  public getConnectionStatus(): LiveConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Connects to the backend WebSocket for Gemini Live
   */
  public async connect(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return true;
    }

    this.connectionStatus = 'connecting';
    this.callbacks.onConnectionStatusChange?.('connecting', 'Connecting to Gemini Live…');

    return new Promise((resolve) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[LiveVoiceService] WebSocket connected');
          this.connectionStatus = 'connected';
          this.callbacks.onConnectionStatusChange?.('connected', 'Live connected');

          // Send initial initialization payload
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(
              JSON.stringify({
                type: 'init',
                graph: this.currentGraph,
                opportunityId: this.activeOpportunityId,
              })
            );
          }
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };

        this.ws.onerror = (err) => {
          console.warn('[LiveVoiceService] WebSocket error:', err);
          this.connectionStatus = 'error';
          this.callbacks.onConnectionStatusChange?.('error', 'Connection error');
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[LiveVoiceService] WebSocket closed');
          this.connectionStatus = 'disconnected';
          this.callbacks.onConnectionStatusChange?.('disconnected', 'Disconnected');
        };
      } catch (err: any) {
        console.error('[LiveVoiceService] Failed to create WebSocket:', err);
        this.connectionStatus = 'error';
        this.callbacks.onConnectionStatusChange?.('error', err.message || 'Connection failed');
        resolve(false);
      }
    });
  }

  /**
   * Disconnects the WebSocket and cleans up audio resources
   */
  public disconnect() {
    this.stopRecording();
    this.stopAudioPlayback();

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
    this.callbacks.onConnectionStatusChange?.('disconnected', 'Disconnected');
  }

  /**
   * Starts capturing microphone audio and streaming 16kHz PCM to Gemini Live
   */
  public async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;

    try {
      // Connect WS first if not connected
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        await this.connect();
      }

      // Initialize Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.inputAudioContext) {
        this.inputAudioContext = new AudioCtx({ sampleRate: 16000 });
      }
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }

      if (!this.outputAudioContext) {
        this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      }
      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }

      // Request microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      // Buffer size 2048 or 4096 provides low latency without overloading the event loop
      this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      // Keep the processor in the graph so onaudioprocess fires, but mute it so
      // the microphone is not played out of the speakers (which causes a Live echo loop).
      this.silentGain = this.inputAudioContext.createGain();
      this.silentGain.gain.value = 0;

      this.mediaSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.silentGain);
      this.silentGain.connect(this.inputAudioContext.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isRecording) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Compute volume for visual orb wave animations
        let sumSquares = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sumSquares += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sumSquares / inputChannelData.length);
        const volume = Math.min(1, rms * 5);
        this.callbacks.onVolumeChange?.(volume);

        // Do not stream microphone audio while Kaki is speaking, or just after.
        // Otherwise Gemini hears its own voice, interrupts, and the UI loops
        // listening ↔ speaking (Done appearing and disappearing).
        if (this.isAudioPlaying || Date.now() < this.playbackHoldoffUntil) {
          return;
        }

        const resampledData = downsampleTo16k(inputChannelData, e.inputBuffer.sampleRate);
        const pcm16 = floatTo16BitPCM(resampledData);
        const base64Data = pcmToBase64(pcm16);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'audio',
              data: base64Data,
            })
          );
        }
      };

      this.isRecording = true;
      this.callbacks.onStateChange('listening');
      return true;
    } catch (err: any) {
      console.error('[LiveVoiceService] Microphone access error:', err);
      this.callbacks.onError?.(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access or use Demo Fallback.'
          : 'Could not access microphone: ' + (err.message || err.name)
      );
      return false;
    }
  }

  /**
   * Stops microphone capture
   */
  public stopRecording() {
    this.isRecording = false;
    this.clearListeningReturnTimer();

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {
        // ignore
      }
      this.scriptProcessor = null;
    }

    if (this.silentGain) {
      try {
        this.silentGain.disconnect();
      } catch (e) {
        // ignore
      }
      this.silentGain = null;
    }

    if (this.mediaSource) {
      try {
        this.mediaSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.mediaSource = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Sends text input to Gemini Live
   */
  public sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text', text }));
      this.currentUserText = text;
      this.callbacks.onUserTranscript(text);
      this.callbacks.onStateChange('thinking');
    }
  }

  /**
   * Handles incoming WebSocket messages from the server
   */
  private handleIncomingMessage(rawMessage: string) {
    try {
      const msg = JSON.parse(rawMessage);

      switch (msg.type) {
        case 'status':
          if (msg.status === 'live_unavailable' || msg.status === 'error') {
            this.connectionStatus = 'error';
            this.callbacks.onConnectionStatusChange?.('error', msg.message);
          } else if (msg.status === 'connected') {
            this.connectionStatus = 'connected';
            this.callbacks.onConnectionStatusChange?.('connected', 'Live connected');
          }
          break;

        case 'audio':
          // 24kHz PCM audio chunk from Gemini Live
          this.queueAudioChunk(msg.data);
          break;

        case 'transcript':
          if (msg.role === 'user') {
            this.currentUserText = (this.currentUserText + ' ' + msg.text).trim();
            this.callbacks.onUserTranscript(this.currentUserText);
          } else if (msg.role === 'model') {
            this.currentModelText = (this.currentModelText + ' ' + msg.text).trim();
            this.callbacks.onModelTranscript(this.currentModelText);
          }
          break;

        case 'interrupted':
          // Ignore echo-driven barge-in while we are still playing Kaki audio.
          if (this.isAudioPlaying) {
            break;
          }
          console.log('[LiveVoiceService] Barge-in interrupted model speech');
          this.stopAudioPlayback();
          this.currentModelText = '';
          this.callbacks.onStateChange('listening');
          break;

        case 'turn_complete':
          console.log('[LiveVoiceService] Turn complete');
          // Keep the finished turn visible in React state, but start the next
          // transcript accumulation from a clean buffer.
          this.currentUserText = '';
          this.currentModelText = '';
          break;

        case 'graph_updated':
          if (msg.graph) {
            this.currentGraph = msg.graph;
            this.callbacks.onGraphUpdated?.(msg.graph, msg.recommendations);
          }
          break;

        case 'show_recommendations':
          if (msg.recommendations) {
            this.callbacks.onRecommendationsRequested?.(msg.recommendations, msg.triggerReason);
          }
          break;

        case 'opportunity_accepted':
          if (msg.opportunity) {
            this.callbacks.onOpportunityAccepted?.(msg.opportunity, msg.updatedGraph);
          }
          break;

        case 'opportunity_rejected':
          this.callbacks.onOpportunityRejected?.(
            msg.reason,
            msg.barrierIdentified,
            msg.updatedGraph,
            msg.recommendations
          );
          break;

        case 'explain_recommendation':
          if (msg.opportunity) {
            this.callbacks.onExplainRequested?.(msg.opportunity);
          }
          break;

        case 'memory_consent_requested':
          this.callbacks.onMemoryConsentRequested?.({
            id: 'mem-' + Date.now(),
            itemEn: msg.itemEn,
            itemZh: msg.itemZh,
            category: msg.category || 'preference',
          });
          break;

        case 'navigate_screen':
          if (msg.screen) {
            this.callbacks.onNavigateScreen?.(msg.screen);
          }
          break;

        default:
          break;
      }
    } catch (e) {
      console.error('[LiveVoiceService] Error handling WS message:', e);
    }
  }

  private clearListeningReturnTimer() {
    if (this.listeningReturnTimer !== null) {
      window.clearTimeout(this.listeningReturnTimer);
      this.listeningReturnTimer = null;
    }
  }

  private scheduleReturnToListening() {
    this.clearListeningReturnTimer();
    this.listeningReturnTimer = window.setTimeout(() => {
      this.listeningReturnTimer = null;
      if (this.activeAudioSources.length === 0 && this.isRecording && !this.isAudioPlaying) {
        this.callbacks.onStateChange('listening');
      }
    }, 500);
  }

  /**
   * Decodes base64 24kHz PCM chunk and schedules gapless playback
   */
  private queueAudioChunk(base64Data: string) {
    try {
      if (!this.outputAudioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      }

      if (this.outputAudioContext.state === 'suspended') {
        this.outputAudioContext.resume();
      }

      const audioBuffer = base64ToAudioBuffer(base64Data, this.outputAudioContext, 24000);
      if (audioBuffer.duration < 0.02) {
        return;
      }

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      const currentTime = this.outputAudioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextScheduledPlayTime);

      source.start(startTime);
      this.nextScheduledPlayTime = startTime + audioBuffer.duration;

      this.activeAudioSources.push(source);
      this.clearListeningReturnTimer();

      if (!this.isAudioPlaying) {
        this.isAudioPlaying = true;
        this.callbacks.onStateChange('speaking');
      }

      source.onended = () => {
        const index = this.activeAudioSources.indexOf(source);
        if (index > -1) {
          this.activeAudioSources.splice(index, 1);
        }
        if (this.activeAudioSources.length === 0) {
          this.isAudioPlaying = false;
          this.playbackHoldoffUntil = Date.now() + 600;
          if (this.isRecording) {
            this.scheduleReturnToListening();
          }
        }
      };
    } catch (err) {
      console.error('[LiveVoiceService] Error playing audio chunk:', err);
    }
  }

  /**
   * Stops all active audio source nodes immediately
   */
  public stopAudioPlayback() {
    this.clearListeningReturnTimer();
    this.activeAudioSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeAudioSources = [];

    if (this.outputAudioContext) {
      this.nextScheduledPlayTime = this.outputAudioContext.currentTime;
    }
    this.isAudioPlaying = false;
    this.playbackHoldoffUntil = Date.now() + 600;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Resets all conversation and transcript buffers
   */
  public resetConversation() {
    this.stopAudioPlayback();
    this.currentUserText = '';
    this.currentModelText = '';
    this.callbacks.onUserTranscript('');
    this.callbacks.onModelTranscript('');
  }
}
