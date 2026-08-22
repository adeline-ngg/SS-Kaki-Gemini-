import React from 'react';
import { Check, Edit3, Music, Users, HeartHandshake, MapPin, Mic, Database } from 'lucide-react';
import { UnderstandingItem, LanguageMode, TextScale } from '../../types';

interface UnderstandingScreenProps {
  items: UnderstandingItem[];
  languageMode: LanguageMode;
  textScale: TextScale;
  onConfirm: () => void;
  onEdit: () => void;
  onVoiceCorrect: () => void;
  onOpenGraphVisualizer?: () => void;
}

export const UnderstandingScreen: React.FC<UnderstandingScreenProps> = ({
  items,
  languageMode,
  textScale,
  onConfirm,
  onEdit,
  onVoiceCorrect,
  onOpenGraphVisualizer,
}) => {
  const isLarge = textScale === 'large';

  const renderIcon = (name: UnderstandingItem['iconName']) => {
    const props = { className: 'w-5 h-5 text-[#CB8570] stroke-[2.2]' };
    switch (name) {
      case 'music':
        return <Music {...props} />;
      case 'users':
        return <Users {...props} />;
      case 'heart-handshake':
        return <HeartHandshake {...props} />;
      case 'map-pin':
        return <MapPin {...props} />;
      default:
        return <Check {...props} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1">
      {/* Top Headline Section */}
      <div>
        <div className="text-center pt-1 mb-2">
          {languageMode !== 'zh' && (
            <h1
              className={`font-semibold text-[#2D2C2A] leading-snug break-words ${
                isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Let me make sure I understood
            </h1>
          )}

          {languageMode !== 'en' && (
            <p
              className={`text-[#2D2C2A]/60 font-medium mt-0.5 ${
                isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}
            >
              检查一下我的理解
            </p>
          )}
        </div>

        {/* The 4 Understanding Cards */}
        <div className="space-y-2.5 my-3">
          {items.map((item) => (
            <div
              key={item.id}
              id={`understanding-card-${item.id}`}
              className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-[#EDE0D4] flex items-center justify-between gap-3 transition-all hover:border-[#D4A373]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#EDE0D4]/40 flex-shrink-0 flex items-center justify-center border border-[#EDE0D4]">
                  {renderIcon(item.iconName)}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-semibold text-[#2D2C2A] leading-snug break-words ${
                      isLarge ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                    }`}
                  >
                    {item.en}
                  </p>

                  {languageMode !== 'en' && (
                    <p className="mt-0.5 text-xs sm:text-sm text-[#2D2C2A]/60 font-normal leading-tight break-words">
                      {item.zh}
                    </p>
                  )}
                </div>
              </div>

              <div className="w-6 h-6 rounded-full bg-[#1B3022]/10 text-[#1B3022] flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation & Primary Action Area */}
      <div className="pt-2 pb-1 space-y-2 text-center">
        {/* Buttons in stack layout */}
        <button
          type="button"
          id="understanding-confirm-btn"
          onClick={onConfirm}
          className="w-full h-14 sm:h-16 bg-[#1B3022] hover:bg-[#25402E] text-white rounded-full text-base sm:text-lg font-semibold shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer touch-manipulation"
        >
          <Check className="w-5 h-5 stroke-[3] text-[#A3B18A]" />
          <span>Yes, that's right · 对，没错</span>
        </button>

        <button
          type="button"
          id="understanding-edit-btn"
          onClick={onEdit}
          className="w-full h-12 sm:h-14 rounded-full border border-[#1B3022] text-[#1B3022] hover:bg-[#1B3022]/10 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer touch-manipulation"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Something isn't right · 有些想修改</span>
        </button>

        {/* Voice Hint */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            type="button"
            id="understanding-voice-correct-btn"
            onClick={onVoiceCorrect}
            className="py-1 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#2D2C2A]/60 hover:text-[#CB8570] transition-colors font-medium cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-[#CB8570]" />
            <span>Or tap here to speak what to change · 也可说话修改</span>
          </button>
        </div>
      </div>
    </div>
  );
};
