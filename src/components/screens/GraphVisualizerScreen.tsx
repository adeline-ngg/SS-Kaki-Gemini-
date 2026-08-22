import React, { useState } from 'react';
import {
  Database,
  Brain,
  ShieldCheck,
  User,
  Heart,
  MapPin,
  AlertTriangle,
  Repeat,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { LifeParticipationGraph, Opportunity, LanguageMode, TextScale } from '../../types';
import { OPPORTUNITY_CATALOG } from '../../data/opportunities';
import { runRecommendationPipeline } from '../../services/recommendationEngine';
import { TEST_SCENARIOS, TestScenario } from '../../data/scenarios';

interface GraphVisualizerScreenProps {
  graph: LifeParticipationGraph;
  languageMode: LanguageMode;
  textScale: TextScale;
  onApplyScenario?: (scenario: TestScenario) => void;
  onNavigateToRecommendation?: () => void;
  onNavigateToConversation?: () => void;
  onGoHome?: () => void;
}

export const GraphVisualizerScreen: React.FC<GraphVisualizerScreenProps> = ({
  graph,
  languageMode,
  textScale,
  onApplyScenario,
  onNavigateToRecommendation,
  onNavigateToConversation,
  onGoHome,
}) => {
  const isLarge = textScale === 'large';
  const [selectedSection, setSelectedSection] = useState<'all' | 'profile' | 'interests' | 'barriers' | 'pipeline'>('all');
  const [expandedPipelineOppId, setExpandedPipelineOppId] = useState<string | null>(null);

  // Compute live recommendation engine scoring on current graph state
  const pipelineResult = runRecommendationPipeline(graph, OPPORTUNITY_CATALOG);
  const topPick = pipelineResult.topOpportunities[0];

  return (
    <div className="flex-1 flex flex-col justify-between py-1 gap-3 overflow-y-auto pr-0.5 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-white p-4 rounded-3xl border border-[#EDE0D4] shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B3022] text-white flex items-center justify-center shadow-xs">
            <Database className="w-5 h-5 text-[#CCD5AE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-[#2D2C2A] ${isLarge ? 'text-lg' : 'text-base'}`}>
                Life Participation Graph
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#1B3022] text-[10px] font-extrabold uppercase">
                Live State
              </span>
            </div>
            <p className="text-xs text-[#2D2C2A]/60">
              Evolving profile, barrier mitigations & deterministic recommendation scorer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="px-3 py-1.5 rounded-full bg-[#EDE0D4]/40 hover:bg-[#EDE0D4] text-[#2D2C2A] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Back</span>
            </button>
          )}
          <button
            type="button"
            onClick={onNavigateToConversation}
            className="px-3 py-1.5 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Talk</span>
            <ArrowRight className="w-3 h-3 text-[#CCD5AE]" />
          </button>
        </div>
      </div>

      {/* Quick Scenario Runner Bar */}
      {onApplyScenario && (
        <div className="bg-white/90 p-3 rounded-2xl border border-[#EDE0D4] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-[#2D2C2A]/70 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#CB8570]" />
              <span>Simulate Scenarios (A through I) to Watch Graph Change:</span>
            </span>
            <span className="text-[10px] text-[#2D2C2A]/50">One-tap update</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TEST_SCENARIOS.map((sc) => {
              const letter = sc.id.replace('scenario-', '').toUpperCase();
              return (
                <button
                  key={sc.id}
                  type="button"
                  id={`graph-screen-scenario-${letter.toLowerCase()}-btn`}
                  onClick={() => onApplyScenario(sc)}
                  className="px-3 py-1.5 rounded-full bg-[#F9F6F2] hover:bg-[#EDE0D4] text-[#2D2C2A] text-xs font-semibold border border-[#EDE0D4] whitespace-nowrap active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                >
                  <span className="w-4 h-4 rounded-full bg-[#1B3022] text-white flex items-center justify-center text-[10px] font-bold">
                    {letter}
                  </span>
                  <span>{sc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Dimensions' },
          { id: 'profile', label: '1. Persona Profile' },
          { id: 'interests', label: '2. Interests & Drivers' },
          { id: 'barriers', label: '3. Barriers & Mitigations' },
          { id: 'pipeline', label: `4. Live Pipeline Scorer (${pipelineResult.evaluatedCatalog.length})` },
        ].map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setSelectedSection(sec.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedSection === sec.id
                ? 'bg-[#1B3022] text-white border-[#1B3022] shadow-xs'
                : 'bg-white text-[#2D2C2A]/70 border-[#EDE0D4] hover:bg-[#EDE0D4]/30'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 1. PERSONA PROFILE NODE */}
      {(selectedSection === 'all' || selectedSection === 'profile') && (
        <div className="p-4 rounded-3xl bg-white border border-[#EDE0D4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EDE0D4]/60 pb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#CB8570]" />
              <h3 className="font-bold text-sm text-[#2D2C2A]">1. Core Persona & Life Transition Node</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EDE0D4]/50 text-[#2D2C2A]/80">
              {graph.profile.lifeStage}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-2xl bg-[#F9F6F2] border border-[#EDE0D4]/60">
              <span className="text-[10px] font-bold text-[#2D2C2A]/50 uppercase block mb-0.5">Name</span>
              <span className="font-bold text-[#2D2C2A] text-sm">{graph.profile.name} ({graph.profile.chineseName})</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F9F6F2] border border-[#EDE0D4]/60">
              <span className="text-[10px] font-bold text-[#2D2C2A]/50 uppercase block mb-0.5">Age & Demographics</span>
              <span className="font-bold text-[#2D2C2A] text-sm">{graph.profile.age} years old</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F9F6F2] border border-[#EDE0D4]/60">
              <span className="text-[10px] font-bold text-[#2D2C2A]/50 uppercase block mb-0.5">Location Anchor</span>
              <span className="font-bold text-[#2D2C2A] text-sm">{graph.profile.location}</span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F9F6F2] border border-[#EDE0D4]/60">
              <span className="text-[10px] font-bold text-[#2D2C2A]/50 uppercase block mb-0.5">Languages & Dialects</span>
              <span className="font-bold text-[#2D2C2A] text-sm">{graph.profile.languages.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERESTS & PURPOSE DRIVERS */}
      {(selectedSection === 'all' || selectedSection === 'interests') && (
        <div className="p-4 rounded-3xl bg-white border border-[#EDE0D4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EDE0D4]/60 pb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#CB8570]" />
              <h3 className="font-bold text-sm text-[#2D2C2A]">2. Expressed Interests & Purpose Drivers</h3>
            </div>
            <span className="text-xs text-[#2D2C2A]/50 font-medium">
              Powers relevance multiplier in scoring
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-xs font-bold text-[#2D2C2A] block mb-1.5">
                Expressed Interests (Active Graph Vertices):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {graph.interests.length > 0 ? (
                  graph.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#EDE0D4]/60 border border-[#EDE0D4] text-xs font-bold text-[#2D2C2A] flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#CB8570]" />
                      <span>{interest}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#2D2C2A]/40 italic">None recorded</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#1B3022] block mb-1.5">
                Intrinsic Purpose Drivers (+35% Boost Factor):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {graph.purposeDrivers.length > 0 ? (
                  graph.purposeDrivers.map((driver, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#E9EDC9] border border-[#CCD5AE] text-xs font-bold text-[#1B3022] flex items-center gap-1.5"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#1B3022]" />
                      <span>{driver}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#2D2C2A]/40 italic">None recorded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BARRIERS, ACCESSIBILITY & DISLIKES */}
      {(selectedSection === 'all' || selectedSection === 'barriers') && (
        <div className="p-4 rounded-3xl bg-white border border-[#EDE0D4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EDE0D4]/60 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#CB8570]" />
              <h3 className="font-bold text-sm text-[#2D2C2A]">3. Participation Barriers & Mitigations</h3>
            </div>
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Guaranteed Accommodations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200">
              <span className="font-bold text-red-900 block mb-1.5">
                Active Friction / Barriers:
              </span>
              <div className="space-y-1">
                {graph.participationBarriers.length > 0 ? (
                  graph.participationBarriers.map((bar, i) => (
                    <div key={i} className="text-red-800 font-semibold flex items-center gap-1">
                      <span>⚠</span>
                      <span>{bar}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-red-700/60 italic">None</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F9F6F2] border border-[#EDE0D4]">
              <span className="font-bold text-[#1B3022] block mb-1.5">
                Accessibility Accommodations (+45% Boost):
              </span>
              <div className="space-y-1">
                {graph.accessibilityPreferences.length > 0 ? (
                  graph.accessibilityPreferences.map((acc, i) => (
                    <div key={i} className="text-[#1B3022] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1B3022]" />
                      <span>{acc}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[#2D2C2A]/40 italic">None</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-800 block mb-1.5">
                Hard Dislikes (Filtered to 0):
              </span>
              <div className="space-y-1">
                {graph.dislikes.length > 0 ? (
                  graph.dislikes.map((dis, i) => (
                    <div key={i} className="text-gray-700 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-gray-500" />
                      <span>{dis}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 italic">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. REPEAT POLICY & COMPLETED TOPICS */}
      {(selectedSection === 'all' || selectedSection === 'barriers') && (
        <div className="p-4 rounded-3xl bg-white border border-[#EDE0D4] shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[#CB8570]" />
            <h3 className="font-bold text-sm text-[#2D2C2A]">4. Repeat-Policy Suppression State</h3>
          </div>
          <p className="text-xs text-[#2D2C2A]/60">
            One-off activities and completed milestone topics are automatically suppressed from future suggestions to protect dignity and respect progress.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4]">
              <span className="font-bold text-[#2D2C2A] block mb-1">Completed Topic Keys (0 Score):</span>
              <div className="flex flex-wrap gap-1">
                {graph.completedTopicKeys?.length > 0 ? (
                  graph.completedTopicKeys.map((k) => (
                    <span key={k} className="px-2 py-0.5 bg-[#1B3022]/10 text-[#1B3022] font-semibold rounded">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="text-[#2D2C2A]/40 italic">None yet</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F9F6F2] border border-[#EDE0D4]">
              <span className="font-bold text-[#2D2C2A] block mb-1">Completed Opportunity IDs:</span>
              <div className="flex flex-wrap gap-1">
                {graph.completedOpportunityIds?.length > 0 ? (
                  graph.completedOpportunityIds.map((id) => (
                    <span key={id} className="px-2 py-0.5 bg-[#1B3022]/10 text-[#1B3022] font-semibold rounded">
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-[#2D2C2A]/40 italic">None yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. LIVE RECOMMENDATION ENGINE PIPELINE RANKING */}
      {(selectedSection === 'all' || selectedSection === 'pipeline') && (
        <div className="p-4 rounded-3xl bg-white border border-[#EDE0D4] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#EDE0D4]/60 pb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#CB8570]" />
              <h3 className="font-bold text-sm text-[#2D2C2A]">5. Live Deterministic Pipeline Scorer</h3>
            </div>
            <span className="text-xs font-extrabold text-[#CB8570]">
              Top Pick: {topPick?.titleEn || 'None'}
            </span>
          </div>

          <div className="space-y-2">
            {pipelineResult.evaluatedCatalog.map((item, idx) => {
              const isTop = idx === 0;
              const opp = item.opportunity;
              return (
                <div
                  key={opp.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isTop
                      ? 'bg-[#E9EDC9]/40 border-[#CCD5AE] shadow-xs'
                      : 'bg-[#F9F6F2]/70 border-[#EDE0D4]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isTop ? 'bg-[#1B3022] text-white' : 'bg-[#EDE0D4] text-[#2D2C2A]'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-[#2D2C2A]">
                          {opp.titleEn}
                        </span>
                        {isTop && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1B3022] text-white text-[10px] font-bold">
                            Top Recommendation
                          </span>
                        )}
                        {opp.verifiedProvider && (
                          <span className="px-2 py-0.5 rounded-full bg-[#CCD5AE]/40 text-[#1B3022] text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2D2C2A]/60 mt-0.5">
                        {opp.titleZh} · {opp.location} {opp.distanceLabel ? `(${opp.distanceLabel})` : ''}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-extrabold text-[#CB8570]">
                        {Math.round(item.score)} pts
                      </span>
                      <span className="block text-[10px] text-[#2D2C2A]/50 uppercase font-semibold">
                        {opp.purposeType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Diagnostic Breakdown */}
                  <div className="mt-2 pt-2 border-t border-[#EDE0D4]/70 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                    <div>
                      <span className="text-[#2D2C2A]/50 font-medium">Relevance: </span>
                      <span className="font-semibold text-[#2D2C2A]">{item.pipelineInsight.relevanceSource}</span>
                    </div>
                    <div>
                      <span className="text-[#2D2C2A]/50 font-medium">Accommodations: </span>
                      <span className="font-semibold text-[#1B3022]">{item.pipelineInsight.accessibilityStatus}</span>
                    </div>
                    <div>
                      <span className="text-[#2D2C2A]/50 font-medium">Featured Rule: </span>
                      <span className="font-semibold text-[#2D2C2A]/70">{item.pipelineInsight.featuredEffect}</span>
                    </div>
                    <div>
                      <span className="text-[#2D2C2A]/50 font-medium">Repeat Status: </span>
                      <span className="font-semibold text-[#2D2C2A]/70">{item.pipelineInsight.repeatStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Footer */}
      {topPick && onNavigateToRecommendation && (
        <div className="pt-2 pb-1">
          <button
            type="button"
            id="graph-screen-view-rec-btn"
            onClick={onNavigateToRecommendation}
            className="w-full h-13 sm:h-14 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <span>View Tailored Opportunity ({topPick.titleEn})</span>
            <ArrowRight className="w-4 h-4 text-[#CCD5AE]" />
          </button>
        </div>
      )}
    </div>
  );
};
