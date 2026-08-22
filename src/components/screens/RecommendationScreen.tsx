import React from 'react';
import { Check, RefreshCw, Calendar, Users, UserCheck, ShieldCheck, Sparkles, HeartHandshake, BookOpen, Award, Footprints } from 'lucide-react';
import { ActivityRecommendation, LanguageMode, TextScale } from '../../types';
import { getPurposeFraming } from '../../services/recommendationEngine';

interface RecommendationScreenProps {
  activity: ActivityRecommendation;
  languageMode: LanguageMode;
  textScale: TextScale;
  onAccept: () => void;
  onShowNext: () => void;
  onWhyThis: () => void;
  onOpenDiagnostics?: () => void;
}

export const RecommendationScreen: React.FC<RecommendationScreenProps> = ({
  activity,
  languageMode,
  textScale,
  onAccept,
  onShowNext,
  onWhyThis,
  onOpenDiagnostics,
}) => {
  const isLarge = textScale === 'large';
  const framing = getPurposeFraming(activity.purposeType || 'lifestyle_social');

  return (
    <div className="flex-1 flex flex-col justify-between py-1">
      {/* Top Headline with dynamic purpose framing */}
      <div className="text-center pt-1 mb-2">
        {languageMode !== 'zh' && (
          <h1
            className={`font-semibold text-[#2D2C2A] leading-snug break-words ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {framing.headlineEn}
          </h1>
        )}

        {languageMode !== 'en' && (
          <p
            className={`text-[#2D2C2A]/60 font-medium mt-0.5 ${
              isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
            }`}
          >
            {framing.headlineZh}
          </p>
        )}
      </div>

      {/* The Single Curated Spotlight Recommendation Card */}
      <div className="bg-white w-full rounded-3xl overflow-hidden shadow-md border border-[#EDE0D4] flex flex-col my-1.5">
        <div className="p-4 sm:p-5">
          {/* Purpose Badge, Verified Provider, and Group Size Row */}
          <div className="flex justify-between items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#CB8570]/10 text-[#CB8570] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#CB8570]" />
                <span>{framing.badgeEn} · {framing.badgeZh}</span>
              </span>
              {activity.verifiedProvider && (
                <span className="bg-[#E9EDC9] text-[#1B3022] px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1B3022]" />
                  <span>Verified · 认证</span>
                </span>
              )}
            </div>
            <div className="text-xs text-[#2D2C2A]/60 font-medium flex items-center gap-1 flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-[#CB8570]" />
              <span>{activity.groupSize}</span>
            </div>
          </div>

          {/* Activity Title Header */}
          <h2
            className={`font-bold text-[#2D2C2A] leading-snug break-words ${
              isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
            }`}
          >
            {activity.titleEn}
          </h2>

          {languageMode !== 'en' && (
            <p className="text-sm font-semibold text-[#CB8570] mt-0.5 mb-2 leading-tight">
              {activity.titleZh}
            </p>
          )}

          {/* Time & Location */}
          <div className="text-xs sm:text-sm font-medium text-[#2D2C2A]/80 my-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#CB8570] flex-shrink-0" />
            <span className="truncate">{activity.timing} · {activity.location}</span>
          </div>

          {/* Natural Tones Detail Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activity.distanceLabel && (
              <span className="bg-[#F9F6F2] px-2.5 py-1 rounded-lg text-xs font-medium text-[#2D2C2A] border border-[#EDE0D4] flex items-center gap-1">
                <Footprints className="w-3 h-3 text-[#CB8570]" />
                <span>{activity.distanceLabel}</span>
              </span>
            )}
            <span className="bg-[#F9F6F2] px-2.5 py-1 rounded-lg text-xs font-medium text-[#2D2C2A] border border-[#EDE0D4]">
              {activity.languagePill}
            </span>
            <span className="bg-[#F9F6F2] px-2.5 py-1 rounded-lg text-xs font-medium text-[#2D2C2A] border border-[#EDE0D4]">
              {activity.intensity}
            </span>
            <span className="bg-[#F9F6F2] px-2.5 py-1 rounded-lg text-xs font-medium text-[#2D2C2A] border border-[#EDE0D4] flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-[#1B3022]" />
              <span className="truncate">{activity.hostName} ({activity.hostRole})</span>
            </span>
          </div>

          {/* Match Reason Quote Box */}
          <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#EDE0D4]">
            <p className="text-xs sm:text-sm leading-relaxed italic text-[#2D2C2A]/80 break-words">
              “{activity.whyChosenEn}”
            </p>
            {languageMode !== 'en' && (
              <p className="text-xs text-[#2D2C2A]/60 mt-1 font-normal leading-normal break-words">
                {activity.whyChosenZh}
              </p>
            )}
          </div>
        </div>

        {/* Action Button Container */}
        <div className="border-t border-[#EDE0D4] p-3.5 sm:p-4 flex flex-col gap-2 bg-[#F9F6F2]/30">
          <button
            type="button"
            id="recommendation-accept-btn"
            onClick={onAccept}
            className="w-full h-14 sm:h-16 bg-[#CB8570] hover:bg-[#B8705C] active:bg-[#A35E4B] text-white rounded-full text-base sm:text-lg font-bold shadow-md shadow-[#CB8570]/30 flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer touch-manipulation"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Yes, I'm interested · 我想参加</span>
          </button>

          <button
            type="button"
            id="recommendation-show-else-btn"
            onClick={onShowNext}
            className="w-full h-10 text-[#2D2C2A]/70 hover:text-[#2D2C2A] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors active:scale-98 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#CB8570]" />
            <span>Show something else · 换一个看看</span>
          </button>

          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              id="recommendation-why-this-btn"
              onClick={onWhyThis}
              className="text-[11px] sm:text-xs text-[#2D2C2A]/60 hover:text-[#CB8570] transition-colors font-semibold cursor-pointer underline decoration-[#EDE0D4] underline-offset-4"
            >
              Why this? · 查看匹配理由
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

