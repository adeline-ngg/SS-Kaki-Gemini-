import React, { useState } from 'react';
import { X, Check, Mic, Sparkles, RefreshCw } from 'lucide-react';
import { UnderstandingItem, LanguageMode } from '../../types';

interface EditUnderstandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: UnderstandingItem[];
  languageMode: LanguageMode;
  onSave: (updated: UnderstandingItem[]) => void;
}

export const EditUnderstandingModal: React.FC<EditUnderstandingModalProps> = ({
  isOpen,
  onClose,
  items,
  languageMode,
  onSave,
}) => {
  const [localItems, setLocalItems] = useState<UnderstandingItem[]>(items);
  const [voiceInputSimulated, setVoiceInputSimulated] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmed: !item.confirmed } : item
      )
    );
  };

  const handleSimulateVoiceAdjustment = () => {
    setVoiceInputSimulated(true);
    setTimeout(() => {
      // Simulate adding a preference: "Prefer morning timing"
      setLocalItems((prev) => [
        ...prev.filter((i) => i.id !== 'u3'),
        {
          id: 'u3',
          en: 'Morning sessions before 11:30 AM are best',
          zh: '上午 11:30 之前的时段最舒服、精神最好',
          detailEn: 'Prefers daytime light without afternoon heat',
          detailZh: '喜欢上午明亮温和的光线，避开午后炎热',
          iconName: 'heart-handshake',
          confirmed: true,
        },
      ]);
      setVoiceInputSimulated(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F9F6F2] rounded-t-[32px] sm:rounded-[32px] border border-[#EDE0D4] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#EDE0D4] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#2D2C2A]">
              Adjust what Kaki noted
            </h2>
            {languageMode !== 'en' && (
              <p className="text-xs text-[#CB8570] font-semibold">修改或补充你的喜好</p>
            )}
          </div>

          <button
            type="button"
            id="close-edit-understanding-btn"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-[#2D2C2A]/60 hover:text-[#2D2C2A] hover:bg-[#EDE0D4]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3">
          <p className="text-xs text-[#2D2C2A]/60 font-medium">
            Tap an item to toggle, or speak directly below:
          </p>

          <div className="space-y-2.5">
            {localItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  item.confirmed
                    ? 'border-[#CB8570] bg-white shadow-xs'
                    : 'border-[#EDE0D4] bg-white/50 opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    item.confirmed
                      ? 'bg-[#CB8570] text-white'
                      : 'border-2 border-[#EDE0D4]'
                  }`}
                >
                  {item.confirmed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                <div>
                  <div className="font-bold text-sm text-[#2D2C2A]">{item.en}</div>
                  {languageMode !== 'en' && (
                    <div className="text-xs text-[#2D2C2A]/60 font-medium mt-0.5">
                      {item.zh}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Voice correction trigger */}
          <div className="pt-2">
            <button
              type="button"
              id="simulate-voice-adjustment-btn"
              onClick={handleSimulateVoiceAdjustment}
              disabled={voiceInputSimulated}
              className="w-full p-3.5 rounded-full bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] text-[#2D2C2A] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
            >
              {voiceInputSimulated ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#CB8570]" />
                  <span>Kaki is updating preference...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#CB8570]" />
                  <span>Speak a correction: "Mornings before 11:30 AM are best"</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EDE0D4] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-[#EDE0D4] text-[#2D2C2A]/70 font-semibold text-sm hover:bg-[#EDE0D4]/30 transition-colors"
          >
            Cancel · 取消
          </button>
          <button
            type="button"
            id="save-understanding-adjustments-btn"
            onClick={() => {
              onSave(localItems);
              onClose();
            }}
            className="flex-1 py-3 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-sm transition-colors shadow-xs"
          >
            Save & Continue · 保存更新
          </button>
        </div>
      </div>
    </div>
  );
};
