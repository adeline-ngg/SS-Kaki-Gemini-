import React, { useState } from 'react';
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
  ArrowRight,
  Database,
  Layers,
  Repeat,
  Check,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { DEMO_INSIGHTS, DEMO_PERSONA } from '../../data/mockData';
import { TEST_SCENARIOS, TestScenario } from '../../data/scenarios';
import { ScreenType, ConversationState, LifeParticipationGraph, Opportunity } from '../../types';

interface DemoInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToScreen: (screen: ScreenType, convState?: ConversationState) => void;
  activeGraph?: LifeParticipationGraph;
  onApplyScenario?: (scenario: TestScenario) => void;
  onResetDemo?: () => void;
  activeOpportunity?: Opportunity;
}

export const DemoInsightsModal: React.FC<DemoInsightsModalProps> = ({
  isOpen,
  onClose,
  onJumpToScreen,
  activeGraph,
  onApplyScenario,
  onResetDemo,
  activeOpportunity,
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'graph' | 'insights' | 'persona' | 'jumper'>('scenarios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#F9F6F2] rounded-[32px] border border-[#EDE0D4] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-insights-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#EDE0D4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#CB8570] text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="demo-insights-title" className="text-lg font-bold text-[#2D2C2A]">
                Demo Insights & Phase 2 Architecture
              </h2>
              <p className="text-xs text-[#2D2C2A]/60 font-medium">
                Gemini Reasoning, Life Participation Graph & Scenario Testing
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
        <div className="flex border-b border-[#EDE0D4] px-3 bg-white/50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'scenarios'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            🧪 Scenarios (A–F)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'graph'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            📊 Life Graph
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'insights'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            Pipeline Rationale
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('persona')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'persona'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            Persona Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jumper')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'jumper'
                ? 'border-[#CB8570] text-[#CB8570]'
                : 'border-transparent text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
            }`}
          >
            Screen Jumper ⚡
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: SCENARIOS (A-F) */}
          {activeTab === 'scenarios' && (
            <div className="space-y-3.5 text-sm">
              <div className="p-3.5 rounded-2xl bg-[#E9EDC9]/30 border border-[#CCD5AE] text-xs text-[#1B3022]">
                <strong>Scenario Testing Lab:</strong> Tap any scenario below to automatically update the Life Participation Graph, trigger the recommendation pipeline, and jump directly into the flow.
              </div>

              <div className="space-y-2.5">
                {TEST_SCENARIOS.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs flex flex-col gap-2 transition-all hover:border-[#CB8570]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2D2C2A] text-sm">
                        {scenario.name}
                      </span>
                      <span className="text-[11px] font-semibold bg-[#CB8570]/10 text-[#CB8570] px-2.5 py-0.5 rounded-full">
                        {scenario.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#2D2C2A]/70 leading-relaxed">
                      {scenario.description}
                    </p>

                    <div className="bg-[#F9F6F2] p-2.5 rounded-xl border border-[#EDE0D4] text-xs italic text-[#2D2C2A]/80">
                      {scenario.transcriptZh}
                    </div>

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        id={`test-${scenario.id}-btn`}
                        onClick={() => {
                          if (onApplyScenario) onApplyScenario(scenario);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Run this scenario</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIFE PARTICIPATION GRAPH */}
          {activeTab === 'graph' && (
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#CB8570]" />
                <div>
                  <h3 className="font-bold text-[#2D2C2A]">Live Life Participation Graph State</h3>
                  <p className="text-xs text-[#2D2C2A]/60">Evolves dynamically through conversational turns and activities</p>
                </div>
              </div>

              {activeGraph && (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4]">
                    <div className="font-bold text-[#CB8570] mb-1.5">Profile & Life Stage</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Name: <span className="font-semibold text-[#2D2C2A]">{activeGraph.profile.name} ({activeGraph.profile.chineseName})</span></div>
                      <div>Age: <span className="font-semibold text-[#2D2C2A]">{activeGraph.profile.age}</span></div>
                      <div>Location: <span className="font-semibold text-[#2D2C2A]">{activeGraph.profile.location}</span></div>
                      <div>Stage: <span className="font-semibold text-[#2D2C2A]">{activeGraph.profile.lifeStage}</span></div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4]">
                    <div className="font-bold text-[#CB8570] mb-1.5">Interests & Purpose Drivers</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {activeGraph.interests.map((item, i) => (
                        <span key={i} className="bg-[#EDE0D4]/40 px-2.5 py-0.5 rounded-md text-xs font-medium text-[#2D2C2A]">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-[#2D2C2A]/60 font-semibold mb-1">Purpose Drivers:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeGraph.purposeDrivers.map((item, i) => (
                        <span key={i} className="bg-[#E9EDC9] text-[#1B3022] px-2.5 py-0.5 rounded-md text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4]">
                    <div className="font-bold text-[#CB8570] mb-1.5">Participation Barriers & Accessibility</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {activeGraph.participationBarriers.map((item, i) => (
                        <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-[#2D2C2A]/60 font-semibold mb-1">Accessibility Preferences:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeGraph.accessibilityPreferences.map((item, i) => (
                        <span key={i} className="bg-[#F9F6F2] border border-[#EDE0D4] px-2.5 py-0.5 rounded-md text-xs font-medium text-[#2D2C2A]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4]">
                    <div className="font-bold text-[#CB8570] mb-1.5">Repeat Policy & History Engine</div>
                    <div className="text-xs text-[#2D2C2A]/70 space-y-1">
                      <div>Completed Milestone Topics: {activeGraph.completedTopicKeys?.length > 0 ? activeGraph.completedTopicKeys.join(', ') : 'None yet'}</div>
                      <div>Completed Event IDs: {activeGraph.completedOpportunityIds?.length > 0 ? activeGraph.completedOpportunityIds.join(', ') : 'None yet'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PIPELINE RATIONALE */}
          {activeTab === 'insights' && (
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <div className="font-bold text-[#CB8570] mb-1 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[#CB8570]" />
                  <span>The 5 Opportunity Purpose Types</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                  <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4]">
                    <strong>1. Lifestyle / Social:</strong> Joyful hobbies, music, dance, tea walks.
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4]">
                    <strong>2. Life-Stage Learning:</strong> High-stakes milestone preparation (CPF, estate planning, health).
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4]">
                    <strong>3. Contribution / Purpose:</strong> Intergenerational youth mentoring, peer sharing.
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4]">
                    <strong>4. Discovery / Experience:</strong> Novel cultural arts, craft workshops, soundwalks.
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4] col-span-1 sm:col-span-2">
                    <strong>5. Capability / Independence:</strong> Everyday smartphone confidence, scam prevention.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E9EDC9]/30 border border-[#CCD5AE]">
                <div className="text-xs font-bold text-[#1B3022] uppercase mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>High-Stakes Boundary Compliance</span>
                </div>
                <p className="text-xs sm:text-sm text-[#1B3022] font-medium leading-relaxed">
                  Kaki NEVER offers financial, legal, or medical advice directly. High-stakes topics are routed strictly to verified educational workshops from authoritative public institutions (e.g. CPF Board, C3A, Pro Bono SG).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <div className="text-xs font-bold text-[#CB8570] uppercase mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Featured Event Integrity Rule</span>
                </div>
                <p className="text-xs text-[#2D2C2A]/70 leading-relaxed">
                  A featured event flag ONLY boosts candidates that already possess a positive baseline relevance score. An irrelevant event (e.g. high-intensity badminton tournament when the user has knee strain) is strictly filtered out and receives ZERO boost.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PERSONA */}
          {activeTab === 'persona' && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#CB8570] text-white font-bold text-lg flex items-center justify-center">
                  MC
                </div>
                <div>
                  <h3 className="font-bold text-[#2D2C2A] text-base">
                    {DEMO_PERSONA.name} ({DEMO_PERSONA.chineseName}) · Age {DEMO_PERSONA.age}
                  </h3>
                  <p className="text-xs text-[#2D2C2A]/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#CB8570]" />
                    {DEMO_PERSONA.location} · {DEMO_PERSONA.preferredLanguages}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-[#2D2C2A]">Life Context: </span>
                  <span className="text-[#2D2C2A]/70">{DEMO_PERSONA.bio}</span>
                </div>
                <div>
                  <span className="font-bold text-[#2D2C2A]">Key Barrier: </span>
                  <span className="text-[#CB8570] font-semibold">{DEMO_PERSONA.barriers}</span>
                </div>
                <div>
                  <span className="font-bold text-[#2D2C2A]">Pre-Retirement Stage: </span>
                  <span className="text-[#2D2C2A]/70">
                    Independent and capable, but gradual shrinkage of daily social contacts occurs unless intentional low-friction connections are made.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Fast Screen Jumper */}
          {activeTab === 'jumper' && (
            <div className="space-y-2.5">
              <p className="text-xs text-[#2D2C2A]/60 font-medium mb-2">
                Instantly jump to any screen or conversational state to test UX transitions:
              </p>

              <button
                type="button"
                id="jump-to-screen-1"
                onClick={() => {
                  onJumpToScreen('home');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] flex items-center justify-between text-left transition-colors font-semibold text-sm text-[#2D2C2A] shadow-xs cursor-pointer"
              >
                <span>Screen 1: Home (Hero & Voice Orb)</span>
                <ArrowRight className="w-4 h-4 text-[#CB8570]" />
              </button>

              <button
                type="button"
                id="jump-to-screen-2-listening"
                onClick={() => {
                  onJumpToScreen('conversation', 'listening');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] flex items-center justify-between text-left transition-colors font-semibold text-sm text-[#2D2C2A] shadow-xs cursor-pointer"
              >
                <span>Screen 2A: Conversation (Listening State)</span>
                <ArrowRight className="w-4 h-4 text-[#CB8570]" />
              </button>

              <button
                type="button"
                id="jump-to-screen-2-speaking"
                onClick={() => {
                  onJumpToScreen('conversation', 'speaking');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] flex items-center justify-between text-left transition-colors font-semibold text-sm text-[#2D2C2A] shadow-xs cursor-pointer"
              >
                <span>Screen 2B: Conversation (Speaking / Audio State)</span>
                <ArrowRight className="w-4 h-4 text-[#CB8570]" />
              </button>

              <button
                type="button"
                id="jump-to-screen-3"
                onClick={() => {
                  onJumpToScreen('understanding');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] flex items-center justify-between text-left transition-colors font-semibold text-sm text-[#2D2C2A] shadow-xs cursor-pointer"
              >
                <span>Screen 3: Understanding (4 Key Points)</span>
                <ArrowRight className="w-4 h-4 text-[#CB8570]" />
              </button>

              <button
                type="button"
                id="jump-to-screen-4"
                onClick={() => {
                  onJumpToScreen('recommendation');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] flex items-center justify-between text-left transition-colors font-semibold text-sm text-[#2D2C2A] shadow-xs cursor-pointer"
              >
                <span>Screen 4: Single Tailored Recommendation</span>
                <ArrowRight className="w-4 h-4 text-[#CB8570]" />
              </button>

              <button
                type="button"
                id="jump-to-screen-5"
                onClick={() => {
                  onJumpToScreen('my-world');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] flex items-center justify-between text-left transition-colors font-semibold text-sm text-[#2D2C2A] shadow-xs cursor-pointer"
              >
                <span>Screen 5: My World (Positive Measures & Graph)</span>
                <ArrowRight className="w-4 h-4 text-[#CB8570]" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EDE0D4] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {onResetDemo && (
            <button
              type="button"
              id="reset-demo-baseline-btn"
              onClick={() => {
                onResetDemo();
                onClose();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#EDE0D4]/60 hover:bg-[#EDE0D4] text-[#2D2C2A] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Repeat className="w-3.5 h-3.5 text-[#CB8570]" />
              <span>Reset Demo to Baseline</span>
            </button>
          )}

          <button
            type="button"
            id="insights-close-footer-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer ml-auto"
          >
            Close & return to prototype
          </button>
        </div>
      </div>
    </div>
  );
};
