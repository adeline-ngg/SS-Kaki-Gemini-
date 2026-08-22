import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/screens/HomeScreen';
import { ConversationScreen } from './components/screens/ConversationScreen';
import { UnderstandingScreen } from './components/screens/UnderstandingScreen';
import { RecommendationScreen } from './components/screens/RecommendationScreen';
import { MyWorldScreen } from './components/screens/MyWorldScreen';
import { GraphVisualizerScreen } from './components/screens/GraphVisualizerScreen';
import { DemoInsightsModal } from './components/modals/DemoInsightsModal';
import { EditUnderstandingModal } from './components/modals/EditUnderstandingModal';
import { WhyThisModal } from './components/modals/WhyThisModal';
import {
  ScreenType,
  ConversationState,
  LanguageMode,
  TextScale,
  UnderstandingItem,
  ActivityRecommendation,
  MyWorldStats,
  LifeParticipationGraph,
  Opportunity,
  LiveVoiceMode,
  LiveConnectionStatus,
  MemoryConsentPrompt,
} from './types';
import {
  DEMO_PERSONA,
  INITIAL_UNDERSTANDING_ITEMS,
  RECOMMENDATIONS,
  INITIAL_MY_WORLD_STATS,
  MY_WORLD_CATEGORIES,
} from './data/mockData';
import { DEFAULT_LIFE_PARTICIPATION_GRAPH, OPPORTUNITY_CATALOG, createFreshGraph } from './data/opportunities';
import { runRecommendationPipeline } from './services/recommendationEngine';
import { TestScenario } from './data/scenarios';
import { LiveVoiceService } from './services/liveVoiceService';

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [conversationState, setConversationState] = useState<ConversationState>('listening');

  // Accessibility & Preferences
  const [languageMode, setLanguageMode] = useState<LanguageMode>('mixed');
  const [textScale, setTextScale] = useState<TextScale>('normal');

  // Gemini Live Voice State
  const [liveVoiceMode, setLiveVoiceMode] = useState<LiveVoiceMode>('live');
  const [liveConnectionStatus, setLiveConnectionStatus] = useState<LiveConnectionStatus>('disconnected');
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [liveErrorMessage, setLiveErrorMessage] = useState<string | null>(null);
  const [memoryConsentPrompt, setMemoryConsentPrompt] = useState<MemoryConsentPrompt | null>(null);

  // Core Life Participation Graph
  const [lifeGraph, setLifeGraph] = useState<LifeParticipationGraph>(DEFAULT_LIFE_PARTICIPATION_GRAPH);

  // Conversational utterances
  const [userUtteranceZh, setUserUtteranceZh] = useState('“以前我跟我老公很喜欢去跳舞。Ballroom 那种。现在比较少去了。”');
  const [userUtteranceEn, setUserUtteranceEn] = useState('"My late husband and I used to love ballroom dancing. We rarely go these days."');
  const [kakiResponseZh, setKakiResponseZh] = useState('“原来你还是很喜欢跳舞。现在如果有人陪你一起去，你会比较愿意吗？”');
  const [kakiResponseEn, setKakiResponseEn] = useState('"So dancing is still something you love. If someone could accompany you, would you feel more open to going?"');

  // Data States
  const [understandingItems, setUnderstandingItems] = useState<UnderstandingItem[]>(INITIAL_UNDERSTANDING_ITEMS);
  const [recommendationsList, setRecommendationsList] = useState<Opportunity[]>(RECOMMENDATIONS);
  const [currentRecIndex, setCurrentRecIndex] = useState(0);
  const [confirmedActivity, setConfirmedActivity] = useState<ActivityRecommendation | null>(null);
  const [myWorldStats, setMyWorldStats] = useState<MyWorldStats>(INITIAL_MY_WORLD_STATS);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Modals & Diagnostics
  const [isDemoInsightsOpen, setIsDemoInsightsOpen] = useState(false);
  const [initialDemoTab, setInitialDemoTab] = useState<'scenarios' | 'gemini' | 'graph' | 'insights' | 'persona' | 'jumper'>('scenarios');
  const [isEditUnderstandingOpen, setIsEditUnderstandingOpen] = useState(false);
  const [isWhyThisOpen, setIsWhyThisOpen] = useState(false);
  const [isVoiceAudioEnabled, setIsVoiceAudioEnabled] = useState(false);

  // Reference to LiveVoiceService instance
  const liveVoiceServiceRef = useRef<LiveVoiceService | null>(null);

  // Helper to sync recommendations from the pipeline
  const syncPipeline = useCallback((graph: LifeParticipationGraph, context?: string) => {
    const res = runRecommendationPipeline(graph, OPPORTUNITY_CATALOG, context);
    if (res.topOpportunities.length > 0) {
      setRecommendationsList(res.topOpportunities);
      setCurrentRecIndex(0);
    }
  }, []);

  // Initialize LiveVoiceService once
  useEffect(() => {
    const service = new LiveVoiceService({
      onStateChange: (state) => {
        setConversationState(state);
      },
      onUserTranscript: (text) => {
        setUserUtteranceZh(`“${text}”`);
        setUserUtteranceEn(`"${text}"`);
      },
      onModelTranscript: (text) => {
        setKakiResponseZh(`“${text}”`);
        setKakiResponseEn(`"${text}"`);
      },
      onVolumeChange: (vol) => {
        setLiveVolume(vol);
      },
      onConnectionStatusChange: (status, msg) => {
        setLiveConnectionStatus(status);
        if (status === 'error') {
          setLiveErrorMessage(msg || 'Live voice connection error');
        } else if (status === 'connected') {
          setLiveErrorMessage(null);
        }
      },
      onGraphUpdated: (updatedGraph, recs) => {
        setLifeGraph(updatedGraph);
        if (recs && recs.length > 0) {
          setRecommendationsList(recs);
          setCurrentRecIndex(0);
        } else {
          syncPipeline(updatedGraph);
        }
      },
      onRecommendationsRequested: (recs) => {
        if (recs && recs.length > 0) {
          setRecommendationsList(recs);
          setCurrentRecIndex(0);
        }
      },
      onOpportunityAccepted: (opp, updatedGraph) => {
        setConfirmedActivity(opp);
        if (updatedGraph) setLifeGraph(updatedGraph);
        setMyWorldStats((prev) => ({
          ...prev,
          outingsThisMonth: prev.outingsThisMonth + 1,
          peopleConnected: prev.peopleConnected + 1,
          newExperiences: prev.newExperiences + 1,
        }));
        setCurrentScreen('my-world');
      },
      onOpportunityRejected: (reason, barrier, updatedGraph, recs) => {
        if (updatedGraph) setLifeGraph(updatedGraph);
        if (recs && recs.length > 0) {
          setRecommendationsList(recs);
          setCurrentRecIndex((prev) => (prev + 1) % recs.length);
        } else {
          handleShowNextRecommendation();
        }
      },
      onExplainRequested: (opp) => {
        setIsWhyThisOpen(true);
      },
      onMemoryConsentRequested: (prompt) => {
        setMemoryConsentPrompt(prompt);
      },
      onNavigateScreen: (screen) => {
        if (['home', 'conversation', 'understanding', 'recommendation', 'my-world'].includes(screen)) {
          setCurrentScreen(screen as ScreenType);
        }
      },
      onError: (err) => {
        setLiveErrorMessage(err);
      },
    });

    liveVoiceServiceRef.current = service;
    service.setGraph(DEFAULT_LIFE_PARTICIPATION_GRAPH);

    // Initial recommendation sync
    syncPipeline(DEFAULT_LIFE_PARTICIPATION_GRAPH);

    return () => {
      service.disconnect();
    };
  }, [syncPipeline]);

  // Keep live voice service updated with graph and current recommendation
  const currentRecommendation = recommendationsList[currentRecIndex] || RECOMMENDATIONS[0];

  useEffect(() => {
    if (liveVoiceServiceRef.current) {
      liveVoiceServiceRef.current.setGraph(lifeGraph);
      if (currentRecommendation) {
        liveVoiceServiceRef.current.setActiveOpportunityId(currentRecommendation.id);
      }
    }
  }, [lifeGraph, currentRecommendation]);

  // Process Utterance via REST Chat API (Fallback or touch input)
  const handleProcessUtterance = async (utterance: string) => {
    setIsLoadingBackend(true);
    setConversationState('thinking');
    setUserUtteranceZh(`“${utterance}”`);
    setUserUtteranceEn(`"${utterance}"`);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('/api/kaki/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userUtterance: utterance,
          currentGraph: lifeGraph,
          languageMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.spokenResponse) {
          setKakiResponseZh(`“${data.spokenResponse.zh}”`);
          setKakiResponseEn(`"${data.spokenResponse.en}"`);
        }
        if (data.updatedGraph) {
          setLifeGraph(data.updatedGraph);
        }
        if (data.understandingItems && data.understandingItems.length > 0) {
          setUnderstandingItems(data.understandingItems);
        }
        if (data.topRecommendations && data.topRecommendations.length > 0) {
          setRecommendationsList(data.topRecommendations);
          setCurrentRecIndex(0);
        }
      } else {
        setKakiResponseEn('"Give me a moment — the connection was slow just now. Could you say that again?"');
        setKakiResponseZh('"等我一下，刚才连线有点慢。可以再说一次吗？"');
      }
    } catch (e) {
      console.warn('Backend API unavailable, using local pipeline synthesis:', e);
      setKakiResponseEn('"Give me a moment — the connection was slow just now. Could you say that again?"');
      setKakiResponseZh('"等我一下，刚才连线有点慢。可以再说一次吗？"');
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoadingBackend(false);
      setConversationState('speaking');
      // Play audio response via TTS fallback only if audio is enabled
      if (isVoiceAudioEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = languageMode === 'en' ? kakiResponseEn : kakiResponseZh;
        const cleanText = textToSpeak.replace(/[“"”]/g, '');
        const utt = new SpeechSynthesisUtterance(cleanText);
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }
    }
  };

  // Run a scenario from the Test Lab (Scenarios A through K)
  const handleApplyScenario = (scenario: TestScenario) => {
    // Completely isolated clean baseline graph merge
    const updated: LifeParticipationGraph = createFreshGraph(scenario.graphOverride);
    setLifeGraph(updated);
    setUserUtteranceZh(scenario.transcriptZh);
    setUserUtteranceEn(scenario.transcriptEn);
    setKakiResponseZh(scenario.kakiResponseZh);
    setKakiResponseEn(scenario.kakiResponseEn);

    // Explicitly set understanding items (or clear to [] if not provided)
    setUnderstandingItems(scenario.understandingItems || []);

    // Run deterministic pipeline on clean graph
    const pipelineRes = runRecommendationPipeline(updated, OPPORTUNITY_CATALOG, scenario.prompt);
    if (pipelineRes.topOpportunities.length > 0) {
      setRecommendationsList(pipelineRes.topOpportunities);
      setCurrentRecIndex(0);
    }

    // Pass prompt to Live service if connected
    if (liveVoiceServiceRef.current && liveConnectionStatus === 'connected') {
      liveVoiceServiceRef.current.setGraph(updated);
      liveVoiceServiceRef.current.sendText(scenario.prompt);
    }

    // Routing decision: High-stakes boundary protection pushes directly to recommendation
    if (scenario.directRouteToRecommendation) {
      setCurrentScreen('recommendation');
    } else {
      setConversationState('speaking');
      setCurrentScreen('conversation');
    }

    // Synthesize audio only if voice audio is enabled by user
    if (isVoiceAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = scenario.kakiResponseZh.replace(/[“"”]/g, '');
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  };

  // Reset Demo to fresh clean state
  const handleResetDemo = () => {
    const cleanBaseline = createFreshGraph();
    setLifeGraph(cleanBaseline);
    setUnderstandingItems(INITIAL_UNDERSTANDING_ITEMS);
    setRecommendationsList(RECOMMENDATIONS);
    setCurrentRecIndex(0);
    setConfirmedActivity(null);
    setMyWorldStats(INITIAL_MY_WORLD_STATS);
    setUserUtteranceZh('“以前我跟我老公很喜欢去跳舞。Ballroom 那种。现在比较少去了。”');
    setUserUtteranceEn('"My husband and I used to really enjoy ballroom dancing. We don\'t go much anymore."');
    setKakiResponseZh('“原来你还是很喜欢跳舞。大巴窑联络所有温和的茶舞与音乐聚会，环境很轻松，你想不想去看看？”');
    setKakiResponseEn('"So dancing is still something you love. Toa Payoh CC has a relaxed tea dance and evergreen music gathering. Would you like to check it out?"');
    setMemoryConsentPrompt(null);
    setLiveErrorMessage(null);
    if (liveVoiceServiceRef.current) {
      liveVoiceServiceRef.current.resetConversation();
      liveVoiceServiceRef.current.setGraph(cleanBaseline);
    }
    setCurrentScreen('home');
  };

  // Start Voice Session
  const handleStartVoice = async () => {
    setCurrentScreen('conversation');
    setConversationState('listening');
    setLiveErrorMessage(null);

    if (liveVoiceMode === 'live' && liveVoiceServiceRef.current) {
      const success = await liveVoiceServiceRef.current.startRecording();
      if (!success) {
        setLiveErrorMessage('Microphone not active. You can speak or use tap actions.');
      }
    }
  };

  const handleGoHome = () => {
    if (liveVoiceServiceRef.current) {
      liveVoiceServiceRef.current.stopRecording();
      liveVoiceServiceRef.current.stopAudioPlayback();
    }
    setCurrentScreen('home');
  };

  const handleProceedToUnderstanding = () => {
    if (liveVoiceServiceRef.current) {
      liveVoiceServiceRef.current.stopAudioPlayback();
    }
    setCurrentScreen('understanding');
  };

  const handleDirectToRetirementRecommendation = () => {
    if (liveVoiceServiceRef.current) {
      liveVoiceServiceRef.current.stopAudioPlayback();
    }
    // Explicitly select the retirement planning workshop
    const cpfIndex = recommendationsList.findIndex(
      (r) => r.id === 'opp-cpf-foundations' || r.purposeType === 'life_stage_learning'
    );
    if (cpfIndex >= 0) {
      setCurrentRecIndex(cpfIndex);
    } else {
      const cpfOpp = OPPORTUNITY_CATALOG.find((r) => r.id === 'opp-cpf-foundations');
      if (cpfOpp) {
        setRecommendationsList([cpfOpp, ...recommendationsList]);
        setCurrentRecIndex(0);
      }
    }
    setCurrentScreen('recommendation');
  };

  const handleConfirmUnderstanding = () => {
    setCurrentScreen('recommendation');
  };

  const handleAcceptRecommendation = () => {
    setConfirmedActivity(currentRecommendation);
    setLifeGraph((prev) => ({
      ...prev,
      completedOpportunityIds: [...(prev.completedOpportunityIds || []), currentRecommendation.id],
      completedTopicKeys: currentRecommendation.repeatTopicKey
        ? [...(prev.completedTopicKeys || []), currentRecommendation.repeatTopicKey]
        : prev.completedTopicKeys,
    }));

    setMyWorldStats((prev) => ({
      ...prev,
      outingsThisMonth: prev.outingsThisMonth + 1,
      peopleConnected: prev.peopleConnected + 1,
      newExperiences: prev.newExperiences + 1,
    }));
    setCurrentScreen('my-world');
  };

  const handleShowNextRecommendation = () => {
    if (recommendationsList.length > 0) {
      setCurrentRecIndex((prev) => (prev + 1) % recommendationsList.length);
    }
  };

  const handleInterrupt = () => {
    if (liveVoiceServiceRef.current) {
      liveVoiceServiceRef.current.stopAudioPlayback();
    }
    setConversationState('listening');
  };

  const handleTogglePause = () => {
    if (conversationState === 'speaking') {
      if (liveVoiceServiceRef.current) {
        liveVoiceServiceRef.current.stopAudioPlayback();
      }
      setConversationState('paused');
    } else if (conversationState === 'paused') {
      setConversationState('speaking');
    }
  };

  const handleHearAgain = () => {
    setConversationState('speaking');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = languageMode === 'en' ? kakiResponseEn : kakiResponseZh;
      const clean = textToSpeak.replace(/[“"”]/g, '');
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = 0.9;
      window.speechSynthesis.speak(utt);
    }
  };

  const handleReconnectLive = async () => {
    setLiveErrorMessage(null);
    if (liveVoiceServiceRef.current) {
      await liveVoiceServiceRef.current.connect();
      await liveVoiceServiceRef.current.startRecording();
    }
  };

  const handleConfirmMemory = (prompt: MemoryConsentPrompt) => {
    setLifeGraph((prev) => {
      const updated = { ...prev };
      if (prompt.category === 'interest') {
        updated.interests = Array.from(new Set([...updated.interests, prompt.itemEn]));
      } else if (prompt.category === 'barrier') {
        updated.participationBarriers = Array.from(new Set([...updated.participationBarriers, prompt.itemEn]));
      } else {
        updated.activityPreferences = Array.from(new Set([...updated.activityPreferences, prompt.itemEn]));
      }
      return updated;
    });
    setMemoryConsentPrompt(null);
  };

  const handleJumpToScreen = (screen: ScreenType, convState?: ConversationState) => {
    if (convState) {
      setConversationState(convState);
    }
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-[#F0EBE1] flex justify-center items-center sm:py-4 selection:bg-[#E6CCB2]">
      {/* Mobile App Canvas Container */}
      <div
        className={`w-full max-w-md h-[100dvh] sm:h-[844px] sm:max-h-[94vh] sm:rounded-[40px] sm:border sm:border-[#EDE0D4] bg-[#F9F6F2] text-[#2D2C2A] flex flex-col justify-between shadow-2xl relative overflow-hidden ${
          textScale === 'large' ? 'text-lg' : 'text-base'
        }`}
      >
        {/* Top Accessible App Header */}
        <Header
          languageMode={languageMode}
          onLanguageChange={setLanguageMode}
          textScale={textScale}
          onTextScaleToggle={() => setTextScale((prev) => (prev === 'normal' ? 'large' : 'normal'))}
          onOpenDemoInsights={(tab) => {
            setInitialDemoTab(tab || 'scenarios');
            setIsDemoInsightsOpen(true);
          }}
          onLogoClick={handleGoHome}
          isVoiceAudioEnabled={isVoiceAudioEnabled}
          onToggleVoiceAudio={() => setIsVoiceAudioEnabled((prev) => !prev)}
          onApplyScenario={handleApplyScenario}
        />

        {/* Main App Screen Viewport */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-2 flex flex-col justify-between">
          {/* SCREEN 1: HOME */}
          {currentScreen === 'home' && (
            <HomeScreen
              persona={DEMO_PERSONA}
              languageMode={languageMode}
              textScale={textScale}
              onStartVoice={handleStartVoice}
              onSeeToday={() => setCurrentScreen('recommendation')}
            />
          )}

          {/* SCREEN 2: CONVERSATION */}
          {currentScreen === 'conversation' && (
            <ConversationScreen
              currentState={conversationState}
              languageMode={languageMode}
              textScale={textScale}
              liveVoiceMode={liveVoiceMode}
              liveConnectionStatus={liveConnectionStatus}
              liveVolume={liveVolume}
              errorMessage={liveErrorMessage}
              memoryConsentPrompt={memoryConsentPrompt}
              onGoHome={handleGoHome}
              onProceedToUnderstanding={handleProceedToUnderstanding}
              onDirectToRecommendation={handleDirectToRetirementRecommendation}
              userUtteranceZh={userUtteranceZh}
              userUtteranceEn={userUtteranceEn}
              kakiResponseZh={kakiResponseZh}
              kakiResponseEn={kakiResponseEn}
              onProcessUtterance={handleProcessUtterance}
              onInterrupt={handleInterrupt}
              onTogglePause={handleTogglePause}
              onHearAgain={handleHearAgain}
              onReconnect={handleReconnectLive}
              onConfirmMemory={handleConfirmMemory}
              onDismissMemory={() => setMemoryConsentPrompt(null)}
              isLoadingBackend={isLoadingBackend}
            />
          )}

          {/* SCREEN 3: UNDERSTANDING */}
          {currentScreen === 'understanding' && (
            <UnderstandingScreen
              items={understandingItems}
              languageMode={languageMode}
              textScale={textScale}
              onConfirm={handleConfirmUnderstanding}
              onEdit={() => setIsEditUnderstandingOpen(true)}
              onVoiceCorrect={() => setIsEditUnderstandingOpen(true)}
              onOpenGraphVisualizer={() => setCurrentScreen('graph')}
            />
          )}

          {/* SCREEN: LIVE LIFE PARTICIPATION GRAPH VISUALIZER */}
          {currentScreen === 'graph' && (
            <GraphVisualizerScreen
              graph={lifeGraph}
              languageMode={languageMode}
              textScale={textScale}
              onApplyScenario={handleApplyScenario}
              onNavigateToRecommendation={() => setCurrentScreen('recommendation')}
              onNavigateToConversation={() => setCurrentScreen('conversation')}
              onGoHome={handleGoHome}
            />
          )}

          {/* SCREEN 4: RECOMMENDATION */}
          {currentScreen === 'recommendation' && (
            <RecommendationScreen
              activity={currentRecommendation}
              languageMode={languageMode}
              textScale={textScale}
              onAccept={handleAcceptRecommendation}
              onShowNext={handleShowNextRecommendation}
              onWhyThis={() => setIsWhyThisOpen(true)}
            />
          )}

          {/* SCREEN 5: MY WORLD / SUCCESS */}
          {currentScreen === 'my-world' && (
            <MyWorldScreen
              stats={myWorldStats}
              categories={MY_WORLD_CATEGORIES}
              confirmedActivity={confirmedActivity}
              languageMode={languageMode}
              textScale={textScale}
              onGoHome={handleGoHome}
              onStartNewConversation={handleStartVoice}
            />
          )}
        </main>

        {/* Persistent Minimal Bottom Navigation (Docked) */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            if (screen === 'conversation') {
              handleStartVoice();
              return;
            }
            setCurrentScreen(screen);
          }}
          isLargeText={textScale === 'large'}
        />

        {/* Modals and Sheets */}
        <DemoInsightsModal
          isOpen={isDemoInsightsOpen}
          onClose={() => setIsDemoInsightsOpen(false)}
          onJumpToScreen={handleJumpToScreen}
          activeGraph={lifeGraph}
          onApplyScenario={handleApplyScenario}
          onResetDemo={handleResetDemo}
          onProcessUtterance={handleProcessUtterance}
          activeOpportunity={currentRecommendation}
          initialTab={initialDemoTab}
        />

        <EditUnderstandingModal
          isOpen={isEditUnderstandingOpen}
          onClose={() => setIsEditUnderstandingOpen(false)}
          items={understandingItems}
          languageMode={languageMode}
          onSave={setUnderstandingItems}
        />

        <WhyThisModal
          isOpen={isWhyThisOpen}
          onClose={() => setIsWhyThisOpen(false)}
          activity={currentRecommendation}
          languageMode={languageMode}
        />
      </div>
    </div>
  );
}
