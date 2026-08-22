import React from 'react';
import { X, Heart, ShieldCheck, Footprints, Users, Clock, Check, Sparkles, AlertCircle } from 'lucide-react';
import { ActivityRecommendation, LanguageMode } from '../../types';

interface WhyThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityRecommendation;
  languageMode: LanguageMode;
}

export const WhyThisModal: React.FC<WhyThisModalProps> = ({
  isOpen,
  onClose,
  activity,
  languageMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F9F6F2] rounded-t-[32px] sm:rounded-[32px] border border-[#EDE0D4] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#EDE0D4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#CB8570] text-white flex items-center justify-center font-bold shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2D2C2A]">
                Why Kaki Chose This For You
              </h2>
              {languageMode !== 'en' && (
                <p className="text-xs text-[#CB8570] font-semibold">
                  为你量身挑选的匹配理由
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            id="close-why-this-btn"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-[#2D2C2A]/60 hover:text-[#2D2C2A] hover:bg-[#EDE0D4]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {/* Trust Safeguard Banner for High-Stakes / Verified sessions */}
          {activity.verifiedProvider && (
            <div className="p-3.5 rounded-2xl bg-[#E9EDC9]/40 border border-[#CCD5AE] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#1B3022] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#1B3022] font-medium leading-relaxed">
                <strong>Verified Trust Safeguard:</strong> Provided by <strong>{activity.provider}</strong>.
                {activity.purposeType === 'life_stage_learning'
                  ? ' Strictly educational and non-commercial. Kaki does not provide financial or legal advice.'
                  : ' Verified community program with verified facilitators.'}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {activity.detailedWhyPoints.map((point, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-full bg-[#E9EDC9] text-[#1B3022] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#2D2C2A]">
                    {point.titleEn}
                  </h3>
                  {languageMode !== 'en' && (
                    <p className="text-xs font-semibold text-[#CB8570] mt-0.5">
                      {point.titleZh}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-[#2D2C2A]/70 mt-1 leading-relaxed">
                    {point.descEn}
                  </p>
                  {languageMode !== 'en' && (
                    <p className="text-xs text-[#2D2C2A]/50 mt-0.5">
                      {point.descZh}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Diagnostic Details */}
          {activity.pipelineInsight && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4] text-xs text-[#2D2C2A]/70 space-y-1.5 shadow-xs">
              <div className="font-bold text-[#CB8570] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommendation Pipeline Insight</span>
              </div>
              <div><strong>Relevance basis:</strong> {activity.pipelineInsight.relevanceSource}</div>
              <div><strong>Context rationale:</strong> {activity.pipelineInsight.contextReason}</div>
              <div><strong>Accessibility:</strong> {activity.pipelineInsight.accessibilityStatus}</div>
              <div><strong>Repeat Policy:</strong> {activity.pipelineInsight.repeatStatus}</div>
              {activity.featured && <div><strong>Featured Weight:</strong> {activity.pipelineInsight.featuredEffect}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EDE0D4]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-sm transition-colors shadow-xs"
          >
            I understand · 了解了
          </button>
        </div>
      </div>
    </div>
  );
};

