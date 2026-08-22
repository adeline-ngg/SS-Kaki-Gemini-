import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  User,
  Brain,
  ShieldCheck,
  PlayCircle,
  Heart,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Layers,
  Repeat,
  Check,
  HelpCircle,
  BookOpen,
  Filter,
  TrendingUp,
  AlertTriangle,
  Award,
  ShieldAlert,
  Flame,
  Send,
  Play,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { DEMO_INSIGHTS, DEMO_PERSONA } from '../../data/mockData';
import {
  TEST_SCENARIOS,
  TestScenario,
  DeterministicTestResult,
  runDeterministicTest,
  runAllDeterministicTests,
} from '../../data/scenarios';
import { OPPORTUNITY_CATALOG, DEFAULT_LIFE_PARTICIPATION_GRAPH } from '../../data/opportunities';
import { runRecommendationPipeline } from '../../services/recommendationEngine';
import { ScreenType, ConversationState, LifeParticipationGraph, Opportunity } from '../../types';

interface DemoInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToScreen: (screen: ScreenType, convState?: ConversationState) => void;
  activeGraph?: LifeParticipationGraph;
  onApplyScenario?: (scenario: TestScenario) => void;
  onResetDemo?: () => void;
  onProcessUtterance?: (utterance: string) => Promise<void>;
  activeOpportunity?: Opportunity;
  initialTab?: 'scenarios' | 'gemini' | 'graph' | 'insights' | 'persona' | 'jumper';
}

export const DemoInsightsModal: React.FC<DemoInsightsModalProps> = ({
  isOpen,
  onClose,
  onJumpToScreen,
  activeGraph = DEFAULT_LIFE_PARTICIPATION_GRAPH,
  onApplyScenario,
  onResetDemo,
  onProcessUtterance,
  activeOpportunity,
  initialTab = 'scenarios',
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'gemini' | 'graph' | 'insights' | 'persona' | 'jumper'>(initialTab);
  const [labPrompt, setLabPrompt] = useState('');
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, DeterministicTestResult>>({});
  const [lastBatchRunStats, setLastBatchRunStats] = useState<{ passed: number; total: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      // Automatically run deterministic tests on open so user gets immediate trustworthy results
      handleRunAllTests();
    }
  }, [isOpen, initialTab]);

  const handleRunAllTests = () => {
    const { results, passedCount, totalCount } = runAllDeterministicTests();
    const map: Record<string, DeterministicTestResult> = {};
    results.forEach((r) => {
      map[r.id] = r;
    });
    setTestResults(map);
    setLastBatchRunStats({ passed: passedCount, total: totalCount });
  };

  const handleRunSingleTest = (scenarioId: string) => {
    const result = runDeterministicTest(scenarioId);
    setTestResults((prev) => ({
      ...prev,
      [scenarioId]: result,
    }));
  };

  const handleRunLabPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!labPrompt.trim() || !onProcessUtterance) return;
    const text = labPrompt.trim();
    setLabPrompt('');
    setIsProcessingPrompt(true);
    try {
      await onProcessUtterance(text);
      onClose();
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  // Dynamically evaluate recommendation pipeline on the live graph
  const livePipelineResult = useMemo(() => {
    return runRecommendationPipeline(activeGraph, OPPORTUNITY_CATALOG);
  }, [activeGraph]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#F9F6F2] rounded-[28px] sm:rounded-[32px] border border-[#EDE0D4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-insights-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EDE0D4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1B3022] text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5 text-[#CCD5AE]" />
            </div>
            <div>
              <h2 id="demo-insights-title" className="text-base sm:text-lg font-bold text-[#2D2C2A]">
                Scenarios Lab & Pipeline Diagnostics
              </h2>
              <p className="text-xs text-[#2D2C2A]/60 font-medium">
                Deterministic Architecture Suite (A–K) & 6-Step Pipeline Verifier
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-demo-insights-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-[#2D2C2A]/60 hover:text-[#2D2C2A] hover:bg-[#EDE0D4]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EDE0D4] px-2 sm:px-3 bg-white/70 overflow-x-auto gap-1">
          <button
            type="button"
            id="tab-scenarios-btn"
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'scenarios'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            🧪 Architecture Tests (A–K)
          </button>
          <button
            type="button"
            id="tab-gemini-btn"
            onClick={() => setActiveTab('gemini')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'gemini'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            🤖 Gemini LLM Test
          </button>
          <button
            type="button"
            id="tab-graph-btn"
            onClick={() => setActiveTab('graph')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'graph'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            📊 Live Graph
          </button>
          <button
            type="button"
            id="tab-insights-btn"
            onClick={() => setActiveTab('insights')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'insights'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            ⚙️ Pipeline Rationale ({livePipelineResult.evaluatedCatalog.length})
          </button>
          <button
            type="button"
            id="tab-persona-btn"
            onClick={() => setActiveTab('persona')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'persona'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            👤 Persona
          </button>
          <button
            type="button"
            id="tab-jumper-btn"
            onClick={() => setActiveTab('jumper')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'jumper'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            ⚡ Jumper
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: DETERMINISTIC ARCHITECTURE TESTS (A-K) */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4 text-sm">
              {/* Test Suite Control Banner */}
              <div className="p-4 rounded-2xl bg-white border border-[#CCD5AE] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1B3022] text-sm sm:text-base">
                      Deterministic Architecture Tests (A through K)
                    </span>
                    {lastBatchRunStats && (
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        lastBatchRunStats.passed === lastBatchRunStats.total
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {lastBatchRunStats.passed} / {lastBatchRunStats.total} Passed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#2D2C2A]/70 mt-0.5">
                    Tests product logic and invariant rules deterministically from isolated clean baseline graphs. Never mutates live user state.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    id="run-all-tests-btn"
                    onClick={handleRunAllTests}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1B3022] hover:bg-[#25402E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run All Tests</span>
                  </button>
                  {onResetDemo && (
                    <button
                      type="button"
                      id="reset-demo-baseline-btn"
                      onClick={onResetDemo}
                      className="px-3 py-2 rounded-xl bg-white text-[#1B3022] font-semibold border border-[#CCD5AE] hover:bg-[#EDE0D4]/40 text-xs flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Live</span>
                    </button>
                  )}
                </div>
              </div>

              {/* List of Test Scenarios */}
              <div className="space-y-3.5">
                {TEST_SCENARIOS.map((scenario) => {
                  const testRes = testResults[scenario.id];
                  const isPass = testRes?.status === 'PASS';
                  const isFail = testRes?.status === 'FAIL';

                  return (
                    <div
                      key={scenario.id}
                      className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs flex flex-col gap-3 transition-all hover:border-[#CB8570]"
                    >
                      {/* Scenario Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#1B3022] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {scenario.id.replace('scenario-', '').toUpperCase()}
                          </span>
                          <div>
                            <span className="font-bold text-[#2D2C2A] text-sm sm:text-base block">
                              {scenario.name}
                            </span>
                            <span className="text-[11px] text-[#2D2C2A]/60 font-medium">
                              {scenario.category}
                            </span>
                          </div>
                        </div>

                        {/* PASS/FAIL Status Badge */}
                        <div className="flex items-center gap-2">
                          {testRes ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                                isPass
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {isPass ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>PASS</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>FAIL</span>
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#2D2C2A]/50 bg-[#F9F6F2] px-2.5 py-1 rounded-full border border-[#EDE0D4]">
                              Ready
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[#2D2C2A]/80 leading-relaxed">
                        {scenario.description}
                      </p>

                      {/* Utterance & Kaki Response */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#F9F6F2] p-2.5 rounded-xl border border-[#EDE0D4]">
                          <span className="text-[10px] font-bold uppercase text-[#2D2C2A]/50 block mb-1">
                            User Spoken Utterance:
                          </span>
                          <p className="italic text-[#2D2C2A] font-medium">{scenario.transcriptZh}</p>
                          <p className="text-[11px] text-[#2D2C2A]/60 mt-0.5">{scenario.transcriptEn}</p>
                        </div>

                        <div className="bg-[#E9EDC9]/20 p-2.5 rounded-xl border border-[#CCD5AE]">
                          <span className="text-[10px] font-bold uppercase text-[#1B3022]/70 block mb-1">
                            Kaki Conversational Response:
                          </span>
                          <p className="text-[#1B3022] font-semibold">{scenario.kakiResponseZh}</p>
                          <p className="text-[11px] text-[#1B3022]/80 mt-0.5">{scenario.kakiResponseEn}</p>
                        </div>
                      </div>

                      {/* Test Diagnostics & Invariants breakdown if test has run */}
                      {testRes && (
                        <div className={`p-3 rounded-xl text-xs space-y-1.5 border ${
                          isPass ? 'bg-[#F9FAF8] border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-semibold">
                            <span className="text-[#2D2C2A]/70">
                              <strong>Expected:</strong> {testRes.expectedResult}
                            </span>
                            <span className={isPass ? 'text-emerald-800' : 'text-rose-800'}>
                              <strong>Actual:</strong> {testRes.actualResult}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#2D2C2A]/80 pt-1 border-t border-[#EDE0D4]/60">
                            <strong>Why:</strong> {testRes.whyExplanation}
                          </div>

                          {testRes.diagnostics.selectedOpportunityId && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 text-[10px]">
                              <div className="bg-white p-1.5 rounded-lg border border-[#EDE0D4]">
                                <span className="text-[#2D2C2A]/50 block">Purpose Type</span>
                                <span className="font-bold text-[#1B3022]">{testRes.diagnostics.purposeType || 'N/A'}</span>
                              </div>
                              <div className="bg-white p-1.5 rounded-lg border border-[#EDE0D4]">
                                <span className="text-[#2D2C2A]/50 block">Qualifying Basis</span>
                                <span className="font-bold text-[#1B3022]">{testRes.diagnostics.qualifyingRelevanceBasis || 'None'}</span>
                              </div>
                              <div className="bg-white p-1.5 rounded-lg border border-[#EDE0D4]">
                                <span className="text-[#2D2C2A]/50 block">Rank Score</span>
                                <span className="font-bold text-[#1B3022]">
                                  {testRes.diagnostics.finalScore !== undefined
                                    ? `${testRes.diagnostics.finalScore} pts (Base: ${testRes.diagnostics.scoreBeforeFeatured})`
                                    : 'N/A'}
                                </span>
                              </div>
                              <div className="bg-white p-1.5 rounded-lg border border-[#EDE0D4]">
                                <span className="text-[#2D2C2A]/50 block">Repeat Status</span>
                                <span className="font-bold text-[#1B3022]">{testRes.diagnostics.repeatStatus || 'Eligible'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Controls */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#EDE0D4]/50 mt-1">
                        <span className="text-[11px] text-[#2D2C2A]/50 font-medium">
                          Isolated test: Clean baseline execution
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id={`run-test-${scenario.id}-btn`}
                            onClick={() => handleRunSingleTest(scenario.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#F9F6F2] hover:bg-[#EDE0D4]/60 text-[#2D2C2A] font-semibold text-xs border border-[#EDE0D4] cursor-pointer transition-colors"
                          >
                            Run Test
                          </button>
                          <button
                            type="button"
                            id={`apply-${scenario.id}-btn`}
                            onClick={() => {
                              if (onApplyScenario) onApplyScenario(scenario);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#1B3022] hover:bg-[#25402E] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <span>Load into Live Demo</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI LLM TEST (PLAYGROUND & SEMANTIC TESTS) */}
          {activeTab === 'gemini' && (
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#CB8570]" />
                    <span className="text-sm font-bold text-[#2D2C2A]">
                      Gemini Semantic Understanding Test
                    </span>
                  </div>
                  <span className="text-[10px] text-[#1B3022] bg-[#E9EDC9] px-2 py-0.5 rounded-full font-bold">
                    Real-time Gemini Model
                  </span>
                </div>
                <p className="text-xs text-[#2D2C2A]/70 mb-3">
                  Test custom conversational utterances with Gemini 2.5. Verifies how the LLM extracts Life Participation Graph signals, handles code-switching, and respects boundaries.
                </p>

                {onProcessUtterance && (
                  <form onSubmit={handleRunLabPrompt} className="space-y-2.5">
                    <input
                      type="text"
                      value={labPrompt}
                      onChange={(e) => setLabPrompt(e.target.value)}
                      placeholder="Type test utterance in English, Mandarin, or Singlish (e.g. 'Wah my knee pain cannot climb stairs')..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F9F6F2] border border-[#CCD5AE] focus:outline-none focus:ring-1 focus:ring-[#1B3022] text-[#2D2C2A]"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#2D2C2A]/50">
                        Extracts graph updates & triggers pipeline
                      </span>
                      <button
                        type="submit"
                        disabled={!labPrompt.trim() || isProcessingPrompt}
                        className="px-4 py-2 rounded-xl bg-[#1B3022] hover:bg-[#25402E] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                      >
                        {isProcessingPrompt ? (
                          <span>Processing with Gemini...</span>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Run Gemini Semantic Test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Sample Utterance Starters */}
              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <h4 className="text-xs font-bold text-[#2D2C2A] mb-2">
                  Sample Test Prompts to Try:
                </h4>
                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => setLabPrompt('Actually 我退休以后也没有什么东西做，以前我们会去 dancing one。')}
                    className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4] hover:border-[#CB8570] cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-[#1B3022] block">Singlish / Code-Switching Test:</span>
                    <span className="italic text-[#2D2C2A]/80">"Actually 我退休以后也没有什么东西做，以前我们会去 dancing one。"</span>
                  </div>
                  <div
                    onClick={() => setLabPrompt('我以前很喜欢跳舞，但是现在膝盖不好，而且一个人去很 sian。')}
                    className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4] hover:border-[#CB8570] cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-[#1B3022] block">Barrier & Dislike Disentanglement:</span>
                    <span className="italic text-[#2D2C2A]/80">"我以前很喜欢跳舞，但是现在膝盖不好，而且一个人去很 sian。"</span>
                  </div>
                  <div
                    onClick={() => setLabPrompt('你觉得我应该把公积金全部领出来买股票还是买保险？')}
                    className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4] hover:border-[#CB8570] cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-[#1B3022] block">High-Stakes Financial Safety Boundary:</span>
                    <span className="italic text-[#2D2C2A]/80">"你觉得我应该把公积金全部领出来买股票还是买保险？"</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE LIFE PARTICIPATION GRAPH VISUALIZER */}
          {activeTab === 'graph' && (
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-[#CB8570]" />
                  <div>
                    <h3 className="font-bold text-[#2D2C2A]">Live Life Participation Graph</h3>
                    <p className="text-xs text-[#2D2C2A]/60">State evolving in real-time across conversations</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E9EDC9] text-[#1B3022] text-[11px] font-bold">
                  Active
                </span>
              </div>

              {activeGraph && (
                <div className="space-y-3">
                  {/* Profile Section */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                    <div className="font-bold text-[#CB8570] mb-2 flex items-center justify-between">
                      <span>1. Persona Profile & Life Stage</span>
                      <span className="text-[11px] font-semibold text-[#2D2C2A]/50 bg-[#EDE0D4]/30 px-2 py-0.5 rounded-md">
                        {activeGraph.profile.lifeStage}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-[#F9F6F2] p-2 rounded-xl">
                        <span className="text-[10px] text-[#2D2C2A]/50 uppercase font-semibold block">Name</span>
                        <span className="font-bold text-[#2D2C2A]">{activeGraph.profile.name} ({activeGraph.profile.chineseName})</span>
                      </div>
                      <div className="bg-[#F9F6F2] p-2 rounded-xl">
                        <span className="text-[10px] text-[#2D2C2A]/50 uppercase font-semibold block">Age</span>
                        <span className="font-bold text-[#2D2C2A]">{activeGraph.profile.age} years old</span>
                      </div>
                      <div className="bg-[#F9F6F2] p-2 rounded-xl">
                        <span className="text-[10px] text-[#2D2C2A]/50 uppercase font-semibold block">Location</span>
                        <span className="font-bold text-[#2D2C2A]">{activeGraph.profile.location}</span>
                      </div>
                      <div className="bg-[#F9F6F2] p-2 rounded-xl">
                        <span className="text-[10px] text-[#2D2C2A]/50 uppercase font-semibold block">Languages</span>
                        <span className="font-bold text-[#2D2C2A]">{activeGraph.profile.languages.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interests & Purpose Drivers */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                    <div className="font-bold text-[#CB8570] mb-2">2. Expressed Interests & Purpose Drivers</div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] text-[#2D2C2A]/60 font-semibold block mb-1">Expressed Interests:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGraph.interests.length > 0 ? (
                            activeGraph.interests.map((item, i) => (
                              <span key={i} className="bg-[#EDE0D4]/60 text-[#2D2C2A] px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#EDE0D4]">
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#2D2C2A]/40 italic">None recorded</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#2D2C2A]/60 font-semibold block mb-1">Purpose Drivers:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGraph.purposeDrivers.length > 0 ? (
                            activeGraph.purposeDrivers.map((item, i) => (
                              <span key={i} className="bg-[#E9EDC9] text-[#1B3022] px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#CCD5AE]">
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#2D2C2A]/40 italic">None recorded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barriers & Adaptations */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                    <div className="font-bold text-[#CB8570] mb-2">3. Barriers, Accessibility & Dislikes</div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] text-red-800 font-semibold block mb-1">Participation Barriers:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGraph.participationBarriers.length > 0 ? (
                            activeGraph.participationBarriers.map((item, i) => (
                              <span key={i} className="bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                                ⚠ {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#2D2C2A]/40 italic">None recorded</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#2D2C2A]/60 font-semibold block mb-1">Accessibility Preferences:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGraph.accessibilityPreferences.length > 0 ? (
                            activeGraph.accessibilityPreferences.map((item, i) => (
                              <span key={i} className="bg-[#F9F6F2] border border-[#EDE0D4] px-2.5 py-1 rounded-lg text-xs font-medium text-[#2D2C2A]">
                                ✓ {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#2D2C2A]/40 italic">None recorded</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#2D2C2A]/60 font-semibold block mb-1">Explicit Dislikes (Hard Filtered):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeGraph.dislikes.length > 0 ? (
                            activeGraph.dislikes.map((item, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 border border-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                                ✕ {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#2D2C2A]/40 italic">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Repeat Policy & Completed State */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                    <div className="font-bold text-[#CB8570] mb-2">4. Repeat Policy & Completed State</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-[#2D2C2A]/60 font-semibold block mb-1">Completed Milestone Topics:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeGraph.completedTopicKeys.length > 0 ? (
                            activeGraph.completedTopicKeys.map((k, i) => (
                              <span key={i} className="bg-[#E9EDC9] text-[#1B3022] px-2 py-0.5 rounded text-[11px] font-mono">
                                {k}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#2D2C2A]/40 italic">None completed</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#2D2C2A]/60 font-semibold block mb-1">Completed Opportunity IDs:</span>
                        <div className="flex flex-wrap gap-1">
                          {activeGraph.completedOpportunityIds.length > 0 ? (
                            activeGraph.completedOpportunityIds.map((id, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-mono">
                                {id}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#2D2C2A]/40 italic">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PIPELINE RATIONALE (6-Step Architecture Verifier) */}
          {activeTab === 'insights' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#CB8570]" />
                    <h3 className="font-bold text-[#2D2C2A] text-sm sm:text-base">
                      6-Step Recommendation Architecture Pipeline
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#1B3022] bg-[#E9EDC9] px-2.5 py-1 rounded-full">
                    {livePipelineResult.evaluatedCatalog.length} Eligible · {livePipelineResult.rejectedCount} Ineligible/Suppressed
                  </span>
                </div>
                <p className="text-xs text-[#2D2C2A]/70 mb-3">
                  Every catalog item passes through 6 strict algorithmic phases in exact order: 1. Determine Qualifying Relevance, 2. Hard Suitability Filters, 3. High-Stakes Trust Boundary, 4. Repeat Policy Suppression, 5. Fit Scoring, 6. Featured Adjustment.
                </p>

                {/* Ranked Opportunities List */}
                <div className="space-y-3">
                  {livePipelineResult.evaluatedCatalog.map((item, idx) => (
                    <div
                      key={item.opportunity.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        idx === 0
                          ? 'bg-[#E9EDC9]/30 border-[#CCD5AE] ring-1 ring-[#1B3022]/20'
                          : 'bg-[#F9F6F2] border-[#EDE0D4]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-[#1B3022] text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-[#2D2C2A] text-xs sm:text-sm">
                            {item.opportunity.titleEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.opportunity.featured && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                              Featured (+18%)
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#1B3022] bg-white px-2.5 py-0.5 rounded-full border border-[#CCD5AE]">
                            Score: {item.score}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-[#2D2C2A]/70 bg-white/70 p-2 rounded-xl border border-[#EDE0D4]">
                        <div>
                          <strong>Purpose:</strong> {item.opportunity.purposeType}
                        </div>
                        <div>
                          <strong>Qualifying Basis:</strong> {item.relevanceBasis}
                        </div>
                        <div>
                          <strong>Base Score:</strong> {item.scoreBeforeFeatured} pts
                        </div>
                      </div>

                      <div className="mt-1.5 text-[11px] text-[#2D2C2A]/80 space-y-0.5">
                        <p><strong>Rationale:</strong> {item.pipelineInsight.relevanceSource}</p>
                        <p><strong>Context Fit:</strong> {item.pipelineInsight.contextReason}</p>
                        <p><strong>Trust:</strong> {item.pipelineInsight.trustRequirement}</p>
                        <p><strong>Repeat Policy:</strong> {item.pipelineInsight.repeatStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Debug Pipeline Log */}
              {livePipelineResult.debugReport.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                  <h4 className="font-bold text-[#2D2C2A] text-xs mb-2">
                    Pipeline Execution & Rejection Log ({livePipelineResult.debugReport.length} events)
                  </h4>
                  <div className="space-y-1 font-mono text-[11px] text-[#2D2C2A]/70 bg-[#F9F6F2] p-3 rounded-xl border border-[#EDE0D4] max-h-48 overflow-y-auto">
                    {livePipelineResult.debugReport.map((line, idx) => (
                      <div key={idx} className="leading-tight">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PERSONA PROFILE */}
          {activeTab === 'persona' && (
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B3022] text-white flex items-center justify-center font-bold text-sm">
                    陈
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#2D2C2A]">{DEMO_PERSONA.name} ({DEMO_PERSONA.chineseName})</h3>
                    <p className="text-xs text-[#2D2C2A]/60">{DEMO_PERSONA.age} years old · {DEMO_PERSONA.neighborhood}</p>
                  </div>
                </div>
                <p className="text-xs text-[#2D2C2A]/80 leading-relaxed bg-[#F9F6F2] p-3 rounded-xl border border-[#EDE0D4]">
                  {DEMO_PERSONA.bio}
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: SCREEN JUMPER */}
          {activeTab === 'jumper' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <h3 className="font-bold text-[#2D2C2A] mb-2">Quick Navigation Jumper</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { onJumpToScreen('home'); onClose(); }}
                    className="p-3 rounded-xl bg-[#F9F6F2] hover:bg-[#EDE0D4]/50 border border-[#EDE0D4] text-left font-semibold text-[#2D2C2A] cursor-pointer"
                  >
                    1. Home Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => { onJumpToScreen('conversation', 'listening'); onClose(); }}
                    className="p-3 rounded-xl bg-[#F9F6F2] hover:bg-[#EDE0D4]/50 border border-[#EDE0D4] text-left font-semibold text-[#2D2C2A] cursor-pointer"
                  >
                    2. Active Conversation Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => { onJumpToScreen('understanding'); onClose(); }}
                    className="p-3 rounded-xl bg-[#F9F6F2] hover:bg-[#EDE0D4]/50 border border-[#EDE0D4] text-left font-semibold text-[#2D2C2A] cursor-pointer"
                  >
                    3. Understanding & Co-Discovery Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => { onJumpToScreen('recommendation'); onClose(); }}
                    className="p-3 rounded-xl bg-[#F9F6F2] hover:bg-[#EDE0D4]/50 border border-[#EDE0D4] text-left font-semibold text-[#2D2C2A] cursor-pointer"
                  >
                    4. Recommendation Cards Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => { onJumpToScreen('my-world'); onClose(); }}
                    className="p-3 rounded-xl bg-[#F9F6F2] hover:bg-[#EDE0D4]/50 border border-[#EDE0D4] text-left font-semibold text-[#2D2C2A] cursor-pointer"
                  >
                    5. My World Footprints Screen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
