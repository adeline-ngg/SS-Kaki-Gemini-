import React from 'react';
import { Type, Sparkles, Globe } from 'lucide-react';
import { LanguageMode, TextScale } from '../types';

interface HeaderProps {
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  textScale: TextScale;
  onTextScaleToggle: () => void;
  onOpenDemoInsights: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  languageMode,
  onLanguageChange,
  textScale,
  onTextScaleToggle,
  onOpenDemoInsights,
  onLogoClick,
}) => {
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
    <header className="sticky top-0 z-30 bg-[#F9F6F2]/95 backdrop-blur-md border-b border-[#EDE0D4] px-3.5 py-3 transition-colors">
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

        {/* Action Controls: Language, Text Size & Demo Insights */}
        <div className="flex items-center gap-1 sm:gap-1.5">
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

          {/* Demo Insights Modal Button */}
          <button
            type="button"
            id="header-demo-insights-btn"
            onClick={onOpenDemoInsights}
            title="Demo insights and evaluation guide"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white text-xs font-semibold transition-all border border-[#1B3022] shadow-xs active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#CCD5AE]" />
            <span>Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
