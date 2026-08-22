import React, { useState, useRef, useEffect } from 'react';
import { Type, Sparkles, Globe, Volume2, VolumeX, FlaskConical, ChevronDown, Database, Cpu, User, RefreshCw, Layers, Brain } from 'lucide-react';
import { LanguageMode, TextScale } from '../types';
import { TEST_SCENARIOS, TestScenario } from '../data/scenarios';

interface HeaderProps {
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  textScale: TextScale;
  onTextScaleToggle: () => void;
  onOpenDemoInsights: (tab?: 'scenarios' | 'gemini' | 'graph' | 'insights' | 'persona' | 'jumper') => void;
  onLogoClick: () => void;
  isVoiceAudioEnabled?: boolean;
  onToggleVoiceAudio?: () => void;
  onApplyScenario?: (scenario: TestScenario) => void;
  onOpenGraphVisualizer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  languageMode,
  onLanguageChange,
  textScale,
  onTextScaleToggle,
  onOpenDemoInsights,
  onLogoClick,
  isVoiceAudioEnabled = false,
  onToggleVoiceAudio,
  onApplyScenario,
  onOpenGraphVisualizer,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nextLanguageMode = (): LanguageMode => {
    if (languageMode === 'mixed') return 'zh';
    if (languageMode === 'zh') return 'en';
    return 'mixed';
  };

  const getLanguageLabel = () => {
    switch (languageMode) {
      case 'zh':
        return '中文';
      case 'en':
        return 'EN';
      case 'mixed':
      default:
        return 'EN+中';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F9F6F2]/95 backdrop-blur-md border-b border-[#EDE0D4] px-3.5 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-1.5">
        {/* Brand & Persona Identity */}
        <button
          type="button"
          onClick={onLogoClick}
          id="kaki-logo-btn"
          aria-label="Kaki Home"
          className="flex items-center gap-2 p-1 rounded-xl hover:opacity-90 transition-opacity text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CB8570]"
        >
          {/* App Logo */}
          <span className="text-2xl font-bold tracking-tight text-[#CB8570] leading-none">
            Kaki
          </span>

          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EDE0D4] text-[#2D2C2A]/70 font-medium whitespace-nowrap">
            SG
          </span>
        </button>

        {/* Action Controls: Language, Audio Toggle, Text Size & Scenarios Lab */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Voice Audio Speaker Toggle */}
          {onToggleVoiceAudio && (
            <button
              type="button"
              id="header-audio-toggle"
              onClick={onToggleVoiceAudio}
              title={isVoiceAudioEnabled ? 'Voice audio enabled (Click to mute)' : 'Voice audio muted (Click to enable)'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border active:scale-95 shadow-xs whitespace-nowrap ${
                isVoiceAudioEnabled
                  ? 'bg-[#E9EDC9] text-[#1B3022] border-[#CCD5AE]'
                  : 'bg-white text-[#2D2C2A]/60 border-[#EDE0D4] hover:bg-[#EDE0D4]/30'
              }`}
            >
              {isVoiceAudioEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#1B3022]" />
                  <span className="hidden sm:inline">Voice On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#2D2C2A]/60" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </button>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            id="header-lang-toggle"
            onClick={() => onLanguageChange(nextLanguageMode())}
            title="Toggle language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white hover:bg-[#EDE0D4]/30 text-[#2D2C2A] text-xs font-semibold transition-all border border-[#EDE0D4] active:scale-95 shadow-xs whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-[#CB8570]" />
            <span>{getLanguageLabel()}</span>
          </button>

          {/* Text Size Accessibility Toggle */}
          <button
            type="button"
            id="header-text-scale-toggle"
            onClick={onTextScaleToggle}
            title={`Current: ${textScale === 'large' ? 'Large text' : 'Normal text'}`}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border active:scale-95 shadow-xs whitespace-nowrap ${
              textScale === 'large'
                ? 'bg-[#1B3022] text-white border-[#1B3022]'
                : 'bg-white text-[#2D2C2A] border-[#EDE0D4] hover:bg-[#EDE0D4]/30'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-[#CB8570]" />
            <span>{textScale === 'large' ? 'Large' : 'Aa'}</span>
          </button>

          {/* Scenarios & Lab Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              id="header-demo-insights-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Open Scenarios & Diagnostics Lab"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white text-xs font-bold transition-all border border-[#1B3022] shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#CCD5AE]" />
              <span>Scenarios Lab</span>
              <ChevronDown className={`w-3 h-3 text-[#CCD5AE] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Content */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-[#EDE0D4] shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <div className="px-2.5 py-1.5 border-b border-[#EDE0D4] mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#2D2C2A]/60 uppercase tracking-wider">
                    Testing & Diagnostics Lab
                  </span>
                  <span className="text-[10px] bg-[#E9EDC9] text-[#1B3022] px-2 py-0.5 rounded-full font-semibold">
                    Dev / Reviewer
                  </span>
                </div>

                {/* Primary Tools */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDemoInsights('scenarios');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#2D2C2A] hover:bg-[#F9F6F2] hover:text-[#CB8570] transition-colors cursor-pointer text-left"
                  >
                    <FlaskConical className="w-4 h-4 text-[#CB8570] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold">Scenarios (A through K) Lab</div>
                      <div className="text-[10px] text-[#2D2C2A]/50 font-normal">Test deterministic architecture & edge cases</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDemoInsights('gemini');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#2D2C2A] hover:bg-[#F9F6F2] hover:text-[#CB8570] transition-colors cursor-pointer text-left"
                  >
                    <Brain className="w-4 h-4 text-[#CB8570] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold">Gemini Semantic LLM Sandbox</div>
                      <div className="text-[10px] text-[#2D2C2A]/50 font-normal">Test custom utterances & graph extraction</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDemoInsights('graph');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#2D2C2A] hover:bg-[#F9F6F2] hover:text-[#CB8570] transition-colors cursor-pointer text-left"
                  >
                    <Database className="w-4 h-4 text-[#1B3022] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold">Life Participation Graph Visualizer</div>
                      <div className="text-[10px] text-[#2D2C2A]/50 font-normal">Inspect active vertices, constraints & state</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDemoInsights('insights');
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-[#2D2C2A] hover:bg-[#F9F6F2] hover:text-[#CB8570] transition-colors cursor-pointer text-left"
                  >
                    <Cpu className="w-4 h-4 text-[#D4A373] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold">Pipeline Rationale & Algorithm Scorer</div>
                      <div className="text-[10px] text-[#2D2C2A]/50 font-normal">Review 6-step deterministic score breakdown</div>
                    </div>
                  </button>
                </div>

                {/* Quick Scenario Jumper Pills */}
                <div className="mt-2 pt-2 border-t border-[#EDE0D4]">
                  <div className="px-2 pb-1.5 text-[10px] font-bold text-[#2D2C2A]/50 uppercase">
                    Quick Scenario Switch:
                  </div>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    {TEST_SCENARIOS.slice(0, 9).map((sc) => {
                      const letter = sc.id.replace('scenario-', '').toUpperCase();
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onApplyScenario?.(sc);
                          }}
                          className="px-2 py-1 bg-[#F9F6F2] hover:bg-[#EDE0D4] rounded-lg text-[10px] font-bold text-[#2D2C2A] text-center truncate border border-[#EDE0D4]/80 active:scale-95 transition-all cursor-pointer"
                          title={sc.name}
                        >
                          <span className="text-[#CB8570] font-black mr-0.5">{letter}:</span>
                          <span>{sc.name.split(':')[1]?.trim() || sc.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
