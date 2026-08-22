import React from 'react';
import { Mic, Pause, Volume2, Sparkles } from 'lucide-react';
import { ConversationState } from '../types';

interface VoiceOrbProps {
  state: ConversationState;
  onClick?: () => void;
  size?: 'normal' | 'compact' | 'hero';
  showLabel?: boolean;
  languageMode?: 'mixed' | 'en' | 'zh';
  isLargeText?: boolean;
  liveVolume?: number;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  onClick,
  size = 'hero',
  showLabel = true,
  languageMode = 'mixed',
  isLargeText = false,
  liveVolume = 0,
}) => {
  const getOrbDimensions = () => {
    switch (size) {
      case 'compact':
        return 'w-20 h-20 sm:w-24 sm:h-24';
      case 'normal':
        return 'w-32 h-32 sm:w-36 sm:h-36';
      case 'hero':
      default:
        return 'w-36 h-36 sm:w-44 sm:h-44';
    }
  };

  const getLabelContent = () => {
    switch (state) {
      case 'listening':
        return {
          en: "I'm listening",
          zh: '我在听…',
          hintEn: 'Tap when finished speaking',
          hintZh: '说完请按“说完了”',
        };
      case 'thinking':
        return {
          en: 'Give me a moment…',
          zh: '我想一想…',
          hintEn: 'Connecting the best options',
          hintZh: '正在为你整理合适内容',
        };
      case 'speaking':
        return {
          en: 'Kaki is speaking',
          zh: 'Kaki 正在回答',
          hintEn: 'Tap orb to pause or repeat',
          hintZh: '可随时暂停或重听',
        };
      case 'paused':
        return {
          en: 'Paused',
          zh: '已暂停',
          hintEn: 'Tap to resume',
          hintZh: '轻触继续',
        };
      case 'idle':
      default:
        return {
          en: 'Tap and talk',
          zh: '按这里说话',
          hintEn: 'Speak naturally in English or 中文',
          hintZh: '直接用你习惯的语言交谈',
        };
    }
  };

  const label = getLabelContent();

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Interactive Orb Area */}
      <button
        type="button"
        onClick={onClick}
        id={`voice-orb-${state}`}
        aria-label={`Voice Assistant: ${label.en}. ${label.zh}`}
        className="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D96B43] rounded-full p-2 transition-transform active:scale-95 cursor-pointer touch-manipulation"
      >
        {/* Ambient Outer Aura Glows */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            state === 'listening'
              ? 'bg-[#A3B18A]/30 scale-125 animate-orb-ripple-1 blur-xl'
              : state === 'thinking'
              ? 'bg-[#D4A373]/25 scale-110 blur-xl animate-pulse'
              : state === 'speaking'
              ? 'bg-[#CB8570]/30 scale-120 animate-orb-breath blur-xl'
              : 'bg-[#D4A373]/20 scale-105 blur-lg group-hover:scale-115 group-hover:bg-[#D4A373]/30'
          }`}
        />

        {/* Multi-layered Animated Pulse Rings (when listening or speaking) */}
        {(state === 'listening' || state === 'speaking') && (
          <>
            <div
              className={`absolute inset-0 rounded-full border-2 animate-orb-ripple-1 pointer-events-none ${
                state === 'listening' ? 'border-[#A3B18A]/40' : 'border-[#CB8570]/40'
              }`}
            />
            <div
              className={`absolute inset-0 rounded-full border animate-orb-ripple-2 pointer-events-none ${
                state === 'listening' ? 'border-[#CCD5AE]/40' : 'border-[#D4A373]/40'
              }`}
            />
          </>
        )}

        {/* Main Physical Touch Sphere */}
        <div
          className={`relative ${getOrbDimensions()} rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden cursor-pointer ${
            state === 'listening'
              ? 'orb-listening ring-4 ring-[#E9EDC9]'
              : state === 'thinking'
              ? 'orb-thinking ring-4 ring-[#EDE0D4]'
              : state === 'speaking'
              ? 'orb-speaking ring-4 ring-[#EDE0D4]'
              : 'orb-active ring-4 ring-[#EDE0D4] group-hover:scale-105'
          }`}
        >
          {/* Internal Organic Swirl Light */}
          <div
            className={`absolute -inset-full opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent_60%)] pointer-events-none ${
              state === 'thinking' ? 'animate-orb-spin' : ''
            }`}
          />

          {/* Central State Icon & Visual Wave Bars */}
          <div
            className={`relative z-10 flex flex-col items-center justify-center ${
              state === 'listening' ? 'text-[#1B3022]' : 'text-[#2D2C2A]'
            }`}
          >
            {state === 'idle' && (
              <div className="flex flex-col items-center gap-1">
                <Mic className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.2] drop-shadow-xs transition-transform group-hover:scale-110 text-[#2D2C2A]" />
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#2D2C2A]/80">Kaki</span>
              </div>
            )}

            {state === 'listening' && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 h-12 sm:h-16">
                {[0.4, 0.9, 0.6, 1, 0.7, 0.9, 0.5].map((scale, i) => {
                  const dynamicHeight = Math.max(14, Math.min(54, scale * (28 + liveVolume * 40)));
                  return (
                    <span
                      key={i}
                      className="w-1.5 sm:w-2 bg-[#1B3022] rounded-full transition-all duration-150"
                      style={{
                        height: `${dynamicHeight}px`,
                        animation: liveVolume < 0.05 ? `voice-wave 1.2s ease-in-out infinite ${i * 0.15}s` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            )}

            {state === 'thinking' && (
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 animate-spin duration-3000 opacity-95 text-[#2D2C2A]" />
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#2D2C2A] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-[#2D2C2A] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-[#2D2C2A] rounded-full animate-bounce" />
                </div>
              </div>
            )}

            {state === 'speaking' && (
              <div className="flex flex-col items-center gap-1.5">
                <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-[#2D2C2A]" />
                <div className="flex items-center gap-1 h-6">
                  {[0.5, 0.9, 0.7, 1, 0.6].map((scale, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-[#2D2C2A] rounded-full"
                      style={{
                        height: `${scale * 20}px`,
                        animation: `voice-wave 1s ease-in-out infinite ${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {state === 'paused' && (
              <Pause className="w-10 h-10 sm:w-12 sm:h-12 fill-[#2D2C2A] stroke-none" />
            )}
          </div>
        </div>
      </button>

      {/* Accessible Clear Labels Below Orb */}
      {showLabel && (
        <div className="mt-4 text-center transition-all duration-300 max-w-xs px-2">
          <div className="flex flex-col items-center gap-0.5">
            {languageMode !== 'zh' && (
              <h2
                className={`font-semibold text-[#2D2C2A] leading-snug ${
                  isLargeText ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                }`}
              >
                {label.en}
              </h2>
            )}

            {languageMode !== 'en' && (
              <p
                className={`font-medium text-[#2D2C2A]/70 ${
                  isLargeText ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                }`}
              >
                {label.zh}
              </p>
            )}
          </div>

          <p
            className={`mt-1.5 text-[#2D2C2A]/60 font-medium ${
              isLargeText ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
            }`}
          >
            {languageMode === 'zh'
              ? label.hintZh
              : languageMode === 'en'
              ? label.hintEn
              : `${label.hintEn} · ${label.hintZh}`}
          </p>
        </div>
      )}
    </div>
  );
};
