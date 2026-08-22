import React from 'react';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { VoiceOrb } from '../VoiceOrb';
import { PersonaProfile, LanguageMode, TextScale } from '../../types';

interface HomeScreenProps {
  persona: PersonaProfile;
  languageMode: LanguageMode;
  textScale: TextScale;
  onStartVoice: () => void;
  onSeeToday: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  persona,
  languageMode,
  textScale,
  onStartVoice,
  onSeeToday,
}) => {
  const isLarge = textScale === 'large';

  return (
    <div className="flex-1 flex flex-col justify-between py-2">
      {/* Top Section: Personal Greeting & Location Badge */}
      <div className="text-center pt-1">
        {/* Subtle community context pill */}
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#2D2C2A]/70 text-xs font-medium mb-3 border border-[#EDE0D4] shadow-xs">
          <MapPin className="w-3 h-3 text-[#CB8570]" />
          <span>{persona.location} · Singapore</span>
        </div>

        {/* Personalized Welcoming Heading */}
        <div className="space-y-0.5">
          {languageMode !== 'zh' && (
            <h1
              className={`font-semibold text-[#2D2C2A] leading-snug break-words ${
                isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Good morning, {persona.salutation}
            </h1>
          )}

          {languageMode !== 'en' && (
            <p
              className={`font-medium text-[#2D2C2A]/60 ${
                isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}
            >
              早上好，{persona.chineseSalutation}
            </p>
          )}
        </div>

        {/* Main Prompt */}
        <div className="mt-3">
          {languageMode !== 'zh' && (
            <p
              className={`font-medium text-[#2D2C2A] leading-snug ${
                isLarge ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
              }`}
            >
              How are you today?
            </p>
          )}

          {languageMode !== 'en' && (
            <p
              className={`text-[#2D2C2A]/60 mt-0.5 ${
                isLarge ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              今天怎么样？
            </p>
          )}
        </div>
      </div>

      {/* Center Hero: Interactive Voice Orb */}
      <div className="my-5 flex justify-center items-center">
        <VoiceOrb
          state="idle"
          onClick={onStartVoice}
          size="normal"
          showLabel={true}
          languageMode={languageMode}
          isLargeText={isLarge}
        />
      </div>

      {/* Lower Secondary Action */}
      <div className="pt-2 text-center space-y-2.5">
        <button
          type="button"
          id="home-see-today-btn"
          onClick={onSeeToday}
          className="w-full p-4 rounded-3xl border-2 border-[#D4A373] bg-white/50 text-[#D4A373] hover:bg-[#D4A373]/10 transition-all shadow-xs active:scale-98 cursor-pointer touch-manipulation flex items-center justify-between gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#D4A373]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#D4A373]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm sm:text-base text-[#2D2C2A] leading-tight truncate">
              See something for today
            </div>
            {languageMode !== 'en' && (
              <div className="text-xs text-[#2D2C2A]/60 font-medium mt-0.5 truncate">
                看看今天为你准备的内容
              </div>
            )}
          </div>

          <ArrowRight className="w-4 h-4 text-[#D4A373] flex-shrink-0" />
        </button>

        <p className="text-[11px] sm:text-xs text-[#2D2C2A]/50 font-normal">
          Kaki is ready whenever you are · 随时按上方球体说话
        </p>
      </div>
    </div>
  );
};
