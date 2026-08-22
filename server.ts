import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { OPPORTUNITY_CATALOG, DEFAULT_LIFE_PARTICIPATION_GRAPH } from './src/data/opportunities';
import { runRecommendationPipeline, getPurposeFraming } from './src/services/recommendationEngine';
import { TEST_SCENARIOS } from './src/data/scenarios';
import { LifeParticipationGraph, Opportunity } from './src/types';

export const GEMINI_CHAT_MODEL = 'gemini-3.7-flash';
export const GEMINI_CHAT_FALLBACK_MODEL = 'gemini-3.6-flash';
export const GEMINI_LIVE_MODEL = 'gemini-3.1-flash-live-preview';

// Lazy Gemini client initialization
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

function isRetryableGeminiError(error: any): boolean {
  const status = error?.status || error?.code;
  const message = String(error?.message || '');
  return status === 503 || status === 429 || /UNAVAILABLE|high demand|try again later/i.test(message);
}

async function generateChatContent(ai: GoogleGenAI, prompt: string) {
  const models = [GEMINI_CHAT_MODEL, GEMINI_CHAT_FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
        if (model !== GEMINI_CHAT_MODEL) {
          console.warn(`[Gemini chat] served by fallback model ${model}`);
        }
        return response;
      } catch (error: any) {
        lastError = error;
        if (!isRetryableGeminiError(error)) {
          throw error;
        }
        console.warn(`[Gemini chat] ${model} attempt ${attempt + 1} failed (${error.status || error.message})`);
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }
  }

  throw lastError;
}

const SYSTEM_PROMPT = `
You are "Kaki", an AI-powered conversational life-participation companion for older adults (60-75) in Singapore.
Your mission: "Kaki does not optimise screen time. It optimises life outside the screen."

VOICE & TONE GUIDELINES:
1. Speak as a respectful, normal Singapore-based adult with another adult.
2. Natural Singaporean conversational vernacular: naturally blend English and Mandarin Chinese, or match the user's language without forcing translations.
3. Examples of natural user speech:
   - "Actually 我退休以后也没有什么东西做。"
   - "以前我们会去 dancing one."
   - "这个可以 lah."
   - "I don't want to go alone，很 sian."
   - "为什么推荐这个？"
4. Keep spoken responses short and punchy: 1 to 3 short sentences maximum, asking at most 1 gentle question at a time.
5. NEVER sound clinical, corporate, robotic, childish, or therapeutic. Avoid long LLM monologues.
6. HIGH-STAKES BOUNDARY (CRITICAL):
   - You MUST NEVER give financial, legal, medical, estate planning, or CPF advice.
   - High stakes is a forced safety boundary refusal, NOT a forced activity recommendation and NEVER an understanding quiz.
   - If the user asks what to do about CPF, retirement investments, stocks, insurance, medical symptoms, or LPA:
     * Acknowledge and refuse personal advice clearly ("I cannot give you personal financial or investment advice").
     * If appropriate, mention the potential recommendation: "Interested in understanding relevant information for retirement planning (potential)" through official, non-commercial public education workshops (e.g. CPF Board / C3A).
     * Do not force an understanding questionnaire on the user for high-stakes safety boundaries.
7. INTENT & BARRIER REASONING:
   - Never confuse physical or social barriers with disinterest in an activity.
   - Example: "I loved ballroom dancing, but my knees hurt" -> Interest = Dancing; Barrier = Needs gentle low-impact/seated options.
   - Example: "I don't want to go alone" -> Barrier = Needs doorway welcome buddy / small group.
   - Example: "I'm retiring next year and don't understand CPF" -> Context = Approaching retirement (do NOT add CPF as a hobby/interest!).
8. TOOL & ACTION CALLING:
   - When the user shares interests, barriers, or life stage signals, call "update_life_participation_graph".
   - When enough context exists or the user is open to seeing activities, call "request_opportunity_recommendation".
   - When an activity is shown and the user says "这个可以" / "Sounds good" / "Okay lah", call "accept_current_opportunity".
   - When the user says "不要这个" / "太远了", call "reject_current_opportunity" (and record distance/transport barrier).
   - When the user asks "为什么推荐这个？", call "explain_current_recommendation".
   - For meaningful long-term preferences, call "request_memory_consent" (e.g. "Would you like me to remember that?").
`;

const LIVE_FUNCTION_DECLARATIONS = [
  {
    name: 'update_life_participation_graph',
    description: 'Update the user\'s Life Participation Graph with new interests, participation barriers, accessibility preferences, purpose drivers, or life stage signals extracted from conversation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        interests: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'New activity or lifestyle interests the user enjoys or wants to explore (e.g. dancing, brisk walking, gardening, singing, chess, herbal cooking).',
        },
        participationBarriers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Obstacles or hesitations (e.g. does not want to go alone, distance/transport, knee pain, stairs, unfamiliar environment). NOTE: Never confuse barriers with disinterest.',
        },
        accessibilityPreferences: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Physical adaptations needed (e.g. seated options, gentle pacing, air-conditioned, elevator access, sheltered walkway).',
        },
        purposeDrivers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Deeper motivators (e.g. mentoring youth, sharing professional experience, staying mentally active, staying independent).',
        },
        contextualSignals: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Life-stage signals (e.g. approaching retirement, recently retired, bereavement, spouse passed away, children moved out).',
        },
      },
    },
  },
  {
    name: 'request_opportunity_recommendation',
    description: 'Trigger the deterministic recommendation engine to fetch the best verified local activities/sessions based on the current Life Participation Graph.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'Why you are asking for recommendations now (e.g., user is open to seeing options).',
        },
        contextKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key themes to focus on (e.g., gentle movement, dancing, retirement education).',
        },
      },
    },
  },
  {
    name: 'accept_current_opportunity',
    description: 'Call when user expresses positive confirmation or acceptance of the current opportunity (e.g. "这个可以", "Sounds good", "Okay lah", "我想参加").',
    parameters: {
      type: Type.OBJECT,
      properties: {
        opportunityId: {
          type: Type.STRING,
          description: 'The ID of the accepted activity if known.',
        },
        userComment: {
          type: Type.STRING,
          description: 'User\'s verbal remark or note.',
        },
      },
    },
  },
  {
    name: 'reject_current_opportunity',
    description: 'Call when user declines or asks to see another opportunity (e.g. "不要这个", "这个太远了", "有没有别的").',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'Why user declined (e.g., too far, timing mismatch, not right fit).',
        },
        barrierIdentified: {
          type: Type.STRING,
          description: 'If user mentioned a practical constraint (e.g. distance, stairs, time), note it here so we record it as a barrier, NOT a dislike.',
        },
      },
    },
  },
  {
    name: 'explain_current_recommendation',
    description: 'Explain why the current opportunity is recommended using verified facts (location, doorway buddy, gentle pacing, small group size) without citing internal weights.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        opportunityId: {
          type: Type.STRING,
          description: 'Opportunity ID to explain.',
        },
      },
    },
  },
  {
    name: 'request_memory_consent',
    description: 'Ask user if they would like Kaki to remember a significant preference or goal long-term.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemEn: {
          type: Type.STRING,
          description: 'Memory item description in English (e.g., "Prefers small group sessions with doorway companions")',
        },
        itemZh: {
          type: Type.STRING,
          description: 'Memory item description in Mandarin (e.g., "偏好有迎宾伙伴的小组活动")',
        },
        category: {
          type: Type.STRING,
          description: 'interest | barrier | goal | preference',
        },
      },
      required: ['itemEn', 'itemZh'],
    },
  },
  {
    name: 'navigate_to_screen',
    description: 'Navigate the application to a specific screen.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        screen: {
          type: Type.STRING,
          description: 'Screen to navigate to: "home" | "conversation" | "understanding" | "recommendation" | "my-world"',
        },
      },
      required: ['screen'],
    },
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Create HTTP server to attach both Express and WebSockets
  const server = http.createServer(app);

  // -----------------------------------------------------------------
  // WebSocket Server for Gemini Live Real-time Audio
  // -----------------------------------------------------------------
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Gemini Live WS] Client connected to live session');

    let currentGraph: LifeParticipationGraph = { ...DEFAULT_LIFE_PARTICIPATION_GRAPH };
    let currentOpportunityId: string | null = null;
    let liveSession: any = null;
    let isSessionReady = false;

    // Helper to run pipeline and return recommendations
    const getRecommendationsForGraph = (graph: LifeParticipationGraph, context?: string) => {
      const recResult = runRecommendationPipeline(graph, OPPORTUNITY_CATALOG, context);
      return recResult.topOpportunities;
    };

    // Initialize Gemini Live Session
    const ai = getGeminiClient();
    if (!ai) {
      console.warn('[Gemini Live WS] GEMINI_API_KEY not configured, notifying client to use fallback');
      clientWs.send(
        JSON.stringify({
          type: 'status',
          status: 'live_unavailable',
          message: 'Gemini Live requires GEMINI_API_KEY. Fallback demo mode available.',
        })
      );
    } else {
      try {
        liveSession = await ai.live.connect({
          model: GEMINI_LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' },
              },
            },
            systemInstruction: SYSTEM_PROMPT,
            tools: [
              {
                functionDeclarations: LIVE_FUNCTION_DECLARATIONS as any,
              },
            ],
          },
          callbacks: {
            onmessage: async (message: LiveServerMessage) => {
              try {
                // 1. Audio stream chunk from model (24kHz PCM)
                const parts = message.serverContent?.modelTurn?.parts;
                if (parts && parts.length > 0) {
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      clientWs.send(
                        JSON.stringify({
                          type: 'audio',
                          data: part.inlineData.data,
                        })
                      );
                    }
                    if (part.text) {
                      clientWs.send(
                        JSON.stringify({
                          type: 'transcript',
                          role: 'model',
                          text: part.text,
                        })
                      );
                    }
                  }
                }

                // 2. Transcription streams
                const sc = message.serverContent as any;
                if (sc?.outputAudioTranscription?.text || sc?.outputTranscription?.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'transcript',
                      role: 'model',
                      text: sc.outputAudioTranscription?.text || sc.outputTranscription?.text,
                    })
                  );
                }

                if (sc?.inputAudioTranscription?.text || sc?.inputTranscription?.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'transcript',
                      role: 'user',
                      text: sc.inputAudioTranscription?.text || sc.inputTranscription?.text,
                    })
                  );
                }

                // 3. User Interruption / Barge-in
                if (sc?.interrupted) {
                  console.log('[Gemini Live WS] Model output interrupted by user');
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }

                // 4. Turn Complete
                if (sc?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: 'turn_complete' }));
                }

                // 5. Function Calling
                if (message.toolCall?.functionCalls) {
                  const functionCalls = message.toolCall.functionCalls;
                  const responses = [];

                  for (const call of functionCalls) {
                    const { name, id } = call;
                    const args = (call.args || {}) as Record<string, any>;
                    console.log(`[Gemini Live WS] Tool call received: ${name}`, args);

                    let result: any = { success: true };

                    if (name === 'update_life_participation_graph') {
                      const newInterests: string[] = Array.isArray(args.interests) ? args.interests : [];
                      const newBarriers: string[] = Array.isArray(args.participationBarriers) ? args.participationBarriers : [];
                      const newAccess: string[] = Array.isArray(args.accessibilityPreferences) ? args.accessibilityPreferences : [];
                      const newPurpose: string[] = Array.isArray(args.purposeDrivers) ? args.purposeDrivers : [];
                      const newSignals: string[] = Array.isArray(args.contextualSignals) ? args.contextualSignals : [];

                      currentGraph = {
                        ...currentGraph,
                        interests: Array.from(new Set([...currentGraph.interests, ...newInterests])),
                        participationBarriers: Array.from(
                          new Set([...currentGraph.participationBarriers, ...newBarriers])
                        ),
                        accessibilityPreferences: Array.from(
                          new Set([...currentGraph.accessibilityPreferences, ...newAccess])
                        ),
                        purposeDrivers: Array.from(
                          new Set([...currentGraph.purposeDrivers, ...newPurpose])
                        ),
                        contextualSignals: Array.from(
                          new Set([...currentGraph.contextualSignals, ...newSignals])
                        ),
                      };

                      const recs = getRecommendationsForGraph(currentGraph);
                      clientWs.send(
                        JSON.stringify({
                          type: 'graph_updated',
                          graph: currentGraph,
                          recommendations: recs,
                        })
                      );

                      result = {
                        success: true,
                        updatedGraph: currentGraph,
                        activeTopRecommendationsCount: recs.length,
                        firstTopRecommendation: recs[0] ? recs[0].titleEn : null,
                      };
                    } else if (name === 'request_opportunity_recommendation') {
                      const reasonStr = typeof args.reason === 'string' ? args.reason : undefined;
                      const recs = getRecommendationsForGraph(currentGraph, reasonStr);
                      if (recs[0]) {
                        currentOpportunityId = recs[0].id;
                      }

                      clientWs.send(
                        JSON.stringify({
                          type: 'show_recommendations',
                          recommendations: recs,
                          triggerReason: args.reason,
                        })
                      );

                      result = {
                        topOpportunities: recs.slice(0, 3).map((r) => ({
                          id: r.id,
                          titleEn: r.titleEn,
                          titleZh: r.titleZh,
                          location: r.location,
                          timing: r.timing,
                          groupSize: r.groupSize,
                          whyChosenEn: r.whyChosenEn,
                          whyChosenZh: r.whyChosenZh,
                          hostName: r.hostName,
                        })),
                      };
                    } else if (name === 'accept_current_opportunity') {
                      const acceptedId = args.opportunityId || currentOpportunityId;
                      const matched = OPPORTUNITY_CATALOG.find((o) => o.id === acceptedId) || OPPORTUNITY_CATALOG[0];

                      currentGraph = {
                        ...currentGraph,
                        completedOpportunityIds: [
                          ...(currentGraph.completedOpportunityIds || []),
                          matched.id,
                        ],
                        completedTopicKeys: matched.repeatTopicKey
                          ? [...(currentGraph.completedTopicKeys || []), matched.repeatTopicKey]
                          : currentGraph.completedTopicKeys,
                      };

                      clientWs.send(
                        JSON.stringify({
                          type: 'opportunity_accepted',
                          opportunity: matched,
                          updatedGraph: currentGraph,
                        })
                      );

                      result = {
                        success: true,
                        acceptedActivity: matched.titleEn,
                        message: 'Confirmed and recorded in Life Participation Graph.',
                      };
                    } else if (name === 'reject_current_opportunity') {
                      if (typeof args.barrierIdentified === 'string' && args.barrierIdentified.trim()) {
                        currentGraph = {
                          ...currentGraph,
                          participationBarriers: Array.from(
                            new Set([...currentGraph.participationBarriers, args.barrierIdentified.trim()])
                          ),
                        };
                      }

                      const recs = getRecommendationsForGraph(currentGraph);
                      clientWs.send(
                        JSON.stringify({
                          type: 'opportunity_rejected',
                          reason: args.reason,
                          barrierIdentified: args.barrierIdentified,
                          updatedGraph: currentGraph,
                          recommendations: recs,
                        })
                      );

                      result = {
                        success: true,
                        nextOptionsCount: recs.length,
                        nextRecommendation: recs[1] ? recs[1].titleEn : recs[0]?.titleEn,
                      };
                    } else if (name === 'explain_current_recommendation') {
                      const opp = OPPORTUNITY_CATALOG.find((o) => o.id === (args.opportunityId || currentOpportunityId)) || OPPORTUNITY_CATALOG[0];
                      clientWs.send(
                        JSON.stringify({
                          type: 'explain_recommendation',
                          opportunity: opp,
                        })
                      );

                      result = {
                        title: opp.titleEn,
                        whyChosenEn: opp.whyChosenEn,
                        whyChosenZh: opp.whyChosenZh,
                        detailedPoints: opp.detailedWhyPoints,
                      };
                    } else if (name === 'request_memory_consent') {
                      clientWs.send(
                        JSON.stringify({
                          type: 'memory_consent_requested',
                          itemEn: args.itemEn,
                          itemZh: args.itemZh,
                          category: args.category || 'preference',
                        })
                      );

                      result = {
                        success: true,
                        promptedUser: true,
                      };
                    } else if (name === 'navigate_to_screen') {
                      clientWs.send(
                        JSON.stringify({
                          type: 'navigate_screen',
                          screen: args.screen,
                        })
                      );

                      result = { success: true, navigatedTo: args.screen };
                    }

                    responses.push({
                      name,
                      id,
                      response: { output: result },
                    });
                  }

                  // Return tool responses back to Gemini Live
                  await liveSession.sendToolResponse({
                    functionResponses: responses,
                  });
                }
              } catch (err) {
                console.error('[Gemini Live WS] Error handling live message:', err);
              }
            },
          },
        });

        isSessionReady = true;
        console.log('[Gemini Live WS] Live session connected successfully');
        clientWs.send(
          JSON.stringify({
            type: 'status',
            status: 'connected',
            message: 'Connected to Gemini Live',
          })
        );
      } catch (err: any) {
        console.error('[Gemini Live WS] Error connecting to Gemini Live:', err);
        clientWs.send(
          JSON.stringify({
            type: 'status',
            status: 'error',
            message: err.message || 'Failed to start Gemini Live session',
          })
        );
      }
    }

    // Handle incoming messages from the frontend client
    clientWs.on('message', async (data: any) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'init') {
          if (msg.graph) {
            currentGraph = msg.graph;
          }
          if (msg.opportunityId) {
            currentOpportunityId = msg.opportunityId;
          }
        } else if (msg.type === 'audio') {
          // 16kHz PCM audio chunk from microphone
          if (liveSession && isSessionReady) {
            await liveSession.sendRealtimeInput({
              audio: {
                data: msg.data,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          }
        } else if (msg.type === 'text') {
          // Spoken text transcription or fallback text message
          if (liveSession && isSessionReady) {
            await liveSession.sendRealtimeInput({
              text: msg.text,
            });
          }
        } else if (msg.type === 'update_graph') {
          currentGraph = msg.graph;
          const recs = getRecommendationsForGraph(currentGraph);
          clientWs.send(
            JSON.stringify({
              type: 'graph_updated',
              graph: currentGraph,
              recommendations: recs,
            })
          );
        } else if (msg.type === 'set_active_opportunity') {
          currentOpportunityId = msg.opportunityId;
        }
      } catch (err) {
        console.error('[Gemini Live WS] Error processing client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Gemini Live WS] Client disconnected');
      if (liveSession) {
        try {
          liveSession.close();
        } catch (e) {
          // ignore
        }
      }
    });

    clientWs.on('error', (err) => {
      console.error('[Gemini Live WS] WebSocket error:', err);
    });
  });

  // -----------------------------------------------------------------
  // REST API Routes (Preserved from Phase 2)
  // -----------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      chatModel: GEMINI_CHAT_MODEL,
      chatFallbackModel: GEMINI_CHAT_FALLBACK_MODEL,
      liveModel: GEMINI_LIVE_MODEL,
    });
  });

  // Get test scenarios
  app.get('/api/kaki/scenarios', (req, res) => {
    res.json({
      scenarios: TEST_SCENARIOS,
    });
  });

  // Recommendation engine endpoint
  app.post('/api/kaki/recommend', (req, res) => {
    try {
      const { graph, contextPrompt } = req.body as {
        graph?: LifeParticipationGraph;
        contextPrompt?: string;
      };

      const userGraph = graph || DEFAULT_LIFE_PARTICIPATION_GRAPH;
      const result = runRecommendationPipeline(userGraph, OPPORTUNITY_CATALOG, contextPrompt);

      res.json({
        topOpportunities: result.topOpportunities,
        evaluatedCatalog: result.evaluatedCatalog,
        rejectedCount: result.rejectedCount,
        debugReport: result.debugReport,
      });
    } catch (error: any) {
      console.error('Error in /api/kaki/recommend:', error);
      res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
    }
  });

  // Conversational turn & intent extraction endpoint (REST fallback)
  app.post('/api/kaki/chat', async (req, res) => {
    try {
      const { userUtterance, currentGraph, languageMode } = req.body as {
        userUtterance: string;
        currentGraph?: LifeParticipationGraph;
        languageMode?: 'mixed' | 'en' | 'zh';
      };

      const graph = currentGraph || DEFAULT_LIFE_PARTICIPATION_GRAPH;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback with rich deterministic reasoning if GEMINI_API_KEY is not set
        const matchedScenario = TEST_SCENARIOS.find((s) =>
          userUtterance.toLowerCase().includes(s.prompt.slice(0, 15).toLowerCase()) ||
          userUtterance.toLowerCase().includes(s.transcriptZh.slice(1, 10))
        );

        if (matchedScenario) {
          const recResult = runRecommendationPipeline(
            { ...graph, ...matchedScenario.graphOverride },
            OPPORTUNITY_CATALOG,
            userUtterance
          );
          return res.json({
            spokenResponse: {
              en: matchedScenario.kakiResponseEn,
              zh: matchedScenario.kakiResponseZh,
            },
            understandingItems: matchedScenario.understandingItems,
            updatedGraph: { ...graph, ...matchedScenario.graphOverride },
            topRecommendations: recResult.topOpportunities,
          });
        }

        const recResult = runRecommendationPipeline(graph, OPPORTUNITY_CATALOG, userUtterance);
        return res.json({
          spokenResponse: {
            en: 'I understand what you mean. Let me connect this with comfortable local sessions nearby.',
            zh: '我明白你的意思了。让我为你找找大巴窑附近舒适又适合的活动。',
          },
          understandingItems: [
            {
              id: 'u-gen-1',
              en: 'You prefer comfortable, familiar paces',
              zh: '喜欢舒适、熟悉且无负担的节奏',
              detailEn: 'Low impact with rest-friendly seating',
              detailZh: '低负荷并备有舒适靠椅',
              iconName: 'heart-handshake',
              confirmed: true,
              category: 'barrier',
            },
            {
              id: 'u-gen-2',
              en: 'Nearby in your neighbourhood',
              zh: '大巴窑社区内，交通便利',
              detailEn: 'Sheltered walking distance',
              detailZh: '有盖走廊步行即达',
              iconName: 'map-pin',
              confirmed: true,
              category: 'interest',
            },
          ],
          updatedGraph: graph,
          topRecommendations: recResult.topOpportunities,
        });
      }

      // Gemini 3.7 Flash execution for REST
      const prompt = `
User speech: "${userUtterance}"
Current Life Participation Graph:
${JSON.stringify(graph, null, 2)}

Task:
1. Generate Kaki's natural spoken response in both English and Mandarin (1-2 sentences, warm, zero jargon, respecting high-stakes boundary).
2. Extract 4 structured understanding points (what Kaki understood about interests, barriers, purpose, or life stage).
3. Identify graph updates (new interests, barriers, or signals).

Return strictly JSON matching this structure:
{
  "spokenResponse": {
    "en": "string",
    "zh": "string"
  },
  "understandingItems": [
    {
      "id": "string",
      "en": "string",
      "zh": "string",
      "detailEn": "string",
      "detailZh": "string",
      "iconName": "music | users | heart-handshake | map-pin | book-open | award | sparkles | shield",
      "category": "interest | barrier | life_stage | purpose | capability"
    }
  ],
  "graphUpdates": {
    "interests": ["string"],
    "participationBarriers": ["string"],
    "purposeDrivers": ["string"],
    "contextualSignals": ["string"]
  }
}
`;

      const response = await generateChatContent(ai, prompt);

      const rawText = response.text || '{}';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse Gemini JSON output:', rawText);
      }

      const updatedGraph: LifeParticipationGraph = {
        ...graph,
        interests: Array.from(new Set([...graph.interests, ...(parsedData.graphUpdates?.interests || [])])),
        participationBarriers: Array.from(
          new Set([...graph.participationBarriers, ...(parsedData.graphUpdates?.participationBarriers || [])])
        ),
        purposeDrivers: Array.from(
          new Set([...graph.purposeDrivers, ...(parsedData.graphUpdates?.purposeDrivers || [])])
        ),
        contextualSignals: Array.from(
          new Set([...graph.contextualSignals, ...(parsedData.graphUpdates?.contextualSignals || [])])
        ),
      };

      const recResult = runRecommendationPipeline(updatedGraph, OPPORTUNITY_CATALOG, userUtterance);

      res.json({
        spokenResponse: parsedData.spokenResponse || {
          en: 'So that is what you enjoy. If there is a comfortable companion, would you feel open to going?',
          zh: '原来你还是很喜欢这类活动。如果有伴同行，你会愿意一起去看看吗？',
        },
        understandingItems:
          parsedData.understandingItems?.map((u: any, idx: number) => ({
            ...u,
            id: u.id || `u-${idx + 1}`,
            confirmed: true,
          })) || [],
        updatedGraph,
        topRecommendations: recResult.topOpportunities,
      });
    } catch (error: any) {
      console.error('Error in /api/kaki/chat:', error);
      res.status(500).json({ error: error.message || 'Failed to process conversation' });
    }
  });

  // -----------------------------------------------------------------
  // Vite Middleware (Dev) or Static Assets (Prod)
  // -----------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    const geminiReady = Boolean(process.env.GEMINI_API_KEY?.trim());
    console.log(`Kaki Server + Gemini Live WebSocket running on http://localhost:${PORT}`);
    console.log(
      geminiReady
        ? `Gemini configured: yes (${GEMINI_CHAT_MODEL} chat, fallback ${GEMINI_CHAT_FALLBACK_MODEL}, ${GEMINI_LIVE_MODEL} live)`
        : 'Gemini configured: no — set GEMINI_API_KEY in .env or the process environment'
    );
  });
}

startServer();
