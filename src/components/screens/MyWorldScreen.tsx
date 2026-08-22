import React, { useState } from 'react';
import { Sparkles, Calendar, CheckCircle2, ChevronRight, Heart, Users, MapPin, Award, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { MyWorldStats, MyWorldCategory, ActivityRecommendation, LanguageMode, TextScale } from '../../types';

interface MyWorldScreenProps {
  stats: MyWorldStats;
  categories: MyWorldCategory[];
  confirmedActivity?: ActivityRecommendation | null;
  languageMode: LanguageMode;
  textScale: TextScale;
  onGoHome: () => void;
  onStartNewConversation: () => void;
}

export const MyWorldScreen: React.FC<MyWorldScreenProps> = ({
  stats,
  categories,
  confirmedActivity,
  languageMode,
  textScale,
  onGoHome,
  onStartNewConversation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isLarge = textScale === 'large';

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'things-i-enjoy':
        return <Heart className="w-4 h-4 text-[#CB8570]" />;
      case 'people':
        return <Users className="w-4 h-4 text-[#1B3022]" />;
      case 'places':
        return <MapPin className="w-4 h-4 text-[#CB8570]" />;
      case 'contribute':
        return <Award className="w-4 h-4 text-[#D4A373]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#CB8570]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1">
      <div>
        {/* Step 1: Reassuring Confirmation Note */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E9EDC9]/30 border border-[#CCD5AE] flex items-center gap-3 mb-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-[#1B3022] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#1B3022] uppercase tracking-wider">
              Step confirmed · 步骤已确认
            </p>
            <p
              className={`font-semibold text-[#1B3022] leading-snug truncate ${
                isLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              }`}
            >
              Nice. I'll help you take the next step.
            </p>
            {languageMode !== 'en' && (
              <p className="text-[11px] text-[#2D2C2A]/60 font-medium truncate">
                太好了，我会帮你安排好接下来的事。
              </p>
            )}
          </div>
        </div>

        {/* Hero Emotional Statement */}
        <div className="text-center my-3 space-y-0.5">
          <span className="inline-block text-[11px] font-semibold px-3 py-0.5 rounded-full bg-white text-[#CB8570] border border-[#EDE0D4] mb-1 shadow-xs">
            Life in Motion · 活跃生活
          </span>
          <h1
            className={`font-semibold text-[#2D2C2A] leading-snug break-words ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            Your world just got a little bigger
          </h1>

          {languageMode !== 'en' && (
            <p
              className={`font-medium text-[#2D2C2A]/60 ${
                isLarge ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
              }`}
            >
              你的世界又更丰富了一点。
            </p>
          )}
        </div>

        {/* 4 Positive Life-Participation Measures */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          {/* Measure 1 */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs text-center flex flex-col justify-center items-center">
            <span className="text-3xl sm:text-4xl font-bold text-[#CB8570] tracking-tight leading-none">
              {stats.outingsThisMonth}
            </span>
            <span
              className={`font-semibold text-[#2D2C2A] mt-1 text-xs sm:text-sm leading-tight`}
            >
              Outings this month
            </span>
            {languageMode !== 'en' && (
              <span className="text-[10px] text-[#2D2C2A]/60 font-medium leading-tight">本月出行活动</span>
            )}
          </div>

          {/* Measure 2 */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs text-center flex flex-col justify-center items-center">
            <span className="text-3xl sm:text-4xl font-bold text-[#1B3022] tracking-tight leading-none">
              {stats.peopleConnected}
            </span>
            <span
              className={`font-semibold text-[#2D2C2A] mt-1 text-xs sm:text-sm leading-tight`}
            >
              People connected
            </span>
            {languageMode !== 'en' && (
              <span className="text-[10px] text-[#2D2C2A]/60 font-medium leading-tight">认识的新伙伴</span>
            )}
          </div>

          {/* Measure 3 */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs text-center flex flex-col justify-center items-center">
            <span className="text-3xl sm:text-4xl font-bold text-[#D4A373] tracking-tight leading-none">
              {stats.newExperiences}
            </span>
            <span
              className={`font-semibold text-[#2D2C2A] mt-1 text-xs sm:text-sm leading-tight`}
            >
              New experiences
            </span>
            {languageMode !== 'en' && (
              <span className="text-[10px] text-[#2D2C2A]/60 font-medium leading-tight">尝试的新体验</span>
            )}
          </div>

          {/* Measure 4 */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs text-center flex flex-col justify-center items-center">
            <span className="text-3xl sm:text-4xl font-bold text-[#CB8570] tracking-tight leading-none">
              {stats.peopleHelped}
            </span>
            <span
              className={`font-semibold text-[#2D2C2A] mt-1 text-xs sm:text-sm leading-tight`}
            >
              Person helped
            </span>
            {languageMode !== 'en' && (
              <span className="text-[10px] text-[#2D2C2A]/60 font-medium leading-tight">贡献经验帮助人</span>
            )}
          </div>
        </div>

        {/* Newly Added Up-coming Session Summary */}
        {confirmedActivity && (
          <div className="p-3.5 rounded-2xl bg-white border border-[#EDE0D4] shadow-xs my-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#EDE0D4]/50 flex items-center justify-center text-[#CB8570] flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-[#CB8570] uppercase">Upcoming · 即将参加</div>
                <div className="text-xs sm:text-sm font-bold text-[#2D2C2A] truncate">{confirmedActivity.titleEn}</div>
                <div className="text-[11px] text-[#2D2C2A]/60 truncate">{confirmedActivity.timing} · {confirmedActivity.location}</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E9EDC9]/50 text-[#1B3022] whitespace-nowrap flex-shrink-0">
              Sarah meets you
            </span>
          </div>
        )}

        {/* Secondary Section: My World Preview & Categories */}
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2
                className={`font-semibold text-[#2D2C2A] ${
                  isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                }`}
              >
                My World · 我的世界
              </h2>
            </div>
            <span className="text-[11px] text-[#2D2C2A]/50 font-medium">
              Circle
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isExpanded = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  id={`my-world-cat-${cat.id}`}
                  className="rounded-2xl bg-white border border-[#EDE0D4] overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(isExpanded ? null : cat.id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-[#EDE0D4]/20 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[#EDE0D4]/40 flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(cat.id)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-bold text-[#2D2C2A] truncate ${
                            isLarge ? 'text-base' : 'text-sm'
                          }`}
                        >
                          {cat.titleEn}
                        </div>
                        {languageMode !== 'en' && (
                          <div className="text-[11px] text-[#2D2C2A]/60 font-medium truncate">
                            {cat.titleZh}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F9F6F2] text-[#2D2C2A]/70 border border-[#EDE0D4]">
                        {cat.items.length}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-[#CB8570] transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Items Drawer */}
                  {isExpanded && (
                    <div className="p-3 pt-1 bg-[#F9F6F2] border-t border-[#EDE0D4] space-y-1.5">
                      {cat.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-white border border-[#EDE0D4] flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#2D2C2A] truncate">{item.nameEn}</div>
                            {languageMode !== 'en' && (
                              <div className="text-[10px] text-[#2D2C2A]/60 truncate">{item.nameZh}</div>
                            )}
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EDE0D4]/50 text-[#2D2C2A] flex-shrink-0">
                            {item.tagEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 pb-1 space-y-2">
        <button
          type="button"
          id="myworld-start-new-chat-btn"
          onClick={onStartNewConversation}
          className="w-full h-14 sm:h-16 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-base sm:text-lg shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer touch-manipulation"
        >
          <MessageSquarePlus className="w-5 h-5 stroke-[2.5]" />
          <span>Talk with Kaki again · 再聊聊</span>
        </button>

        <button
          type="button"
          id="myworld-return-home-btn"
          onClick={onGoHome}
          className="w-full h-11 sm:h-12 rounded-full border border-[#1B3022] text-[#1B3022] hover:bg-[#1B3022]/10 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 text-[#1B3022]" />
          <span>Back to Home · 返回主页</span>
        </button>
      </div>
    </div>
  );
};
