import React, { useState } from 'react';
import {
  Home,
  Check,
  Volume2,
  RotateCcw,
  ArrowRight,
  Pause,
  Play,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookmarkCheck,
  X,
  Send,
  Keyboard,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { VoiceOrb } from '../VoiceOrb';
import {
  ConversationState,
  LanguageMode,
  TextScale,
  LiveVoiceMode,
  LiveConnectionStatus,
  MemoryConsentPrompt,
} from '../../types';

interface ConversationScreenProps {
  currentState: ConversationState;
  languageMode: LanguageMode;
  textScale: TextScale;
  liveVoiceMode?: LiveVoiceMode;
  liveConnectionStatus?: LiveConnectionStatus;
  liveVolume?: number;
  errorMessage?: string | null;
  memoryConsentPrompt?: MemoryConsentPrompt | null;
  onGoHome: () => void;
  onProceedToUnderstanding: () => void;
  onDirectToRecommendation?: () => void;
  userUtteranceZh?: string;
  userUtteranceEn?: string;
  kakiResponseZh?: string;
  kakiResponseEn?: string;
  onProcessUtterance?: (utterance: string) => Promise<void>;
  onTogglePause?: () => void;
  onHearAgain?: () => void;
  onInterrupt?: () => void;
  onReconnect?: () => void;
  onConfirmMemory?: (prompt: MemoryConsentPrompt) => void;
  onDismissMemory?: () => void;
  isLoadingBackend?: boolean;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  currentState = 'listening',
  languageMode,
  textScale,
  liveVoiceMode = 'live',
  liveConnectionStatus = 'connected',
  liveVolume = 0,
  errorMessage = null,
  memoryConsentPrompt = null,
  onGoHome,
  onProceedToUnderstanding,
  onDirectToRecommendation,
  userUtteranceZh = '“以前我跟我老公很喜欢去跳舞。Ballroom 那种。现在比较少去了。”',
  userUtteranceEn = '"My late husband and I used to love ballroom dancing. We rarely go these days."',
  kakiResponseZh = '“原来你还是很喜欢跳舞。现在如果有人陪你一起去，你会比较愿意吗？”',
  kakiResponseEn = '"So dancing is still something you love. If someone could accompany you, would you feel more open to going?"',
  onProcessUtterance,
  onTogglePause,
  onHearAgain,
  onInterrupt,
  onReconnect,
  onConfirmMemory,
  onDismissMemory,
  isLoadingBackend = false,
}) => {
  const isLarge = textScale === 'large';
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [typedInput, setTypedInput] = useState('');

  // Check if current context is high-stakes boundary (e.g. Scenario E)
  const isHighStakesContext =
    userUtteranceZh?.includes('股票') ||
    userUtteranceZh?.includes('保险') ||
    userUtteranceZh?.includes('公积金全部领出来') ||
    userUtteranceEn?.includes('withdraw all my CPF') ||
    kakiResponseZh?.includes('我不能给你个人财务') ||
    kakiResponseEn?.includes('cannot give you personal financial');

  // Handle user completing speech in manual/fallback mode
  const handleUserDone = async () => {
    if (onProcessUtterance) {
      await onProcessUtterance(userUtteranceEn || userUtteranceZh);
    }
  };

  const handleSendTyped = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedInput.trim() || isLoadingBackend) return;
    const text = typedInput.trim();
    setTypedInput('');
    setIsKeyboardMode(false);
    if (onProcessUtterance) {
      await onProcessUtterance(text);
    }
  };

  const handleOrbClick = () => {
    if (currentState === 'speaking') {
      if (onInterrupt) {
        onInterrupt();
      } else if (onTogglePause) {
        onTogglePause();
      }
    } else if (currentState === 'paused') {
      onTogglePause?.();
    } else if (currentState === 'listening') {
      handleUserDone();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 gap-2">
      {/* Top Header Row with Step / Home Button & Live Voice Mode Pill */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EDE0D4]">
        <button
          type="button"
          id="conv-back-home-btn"
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#2D2C2A]/70 hover:text-[#2D2C2A] hover:bg-white font-medium text-xs transition-colors border border-transparent hover:border-[#EDE0D4] cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-[#CB8570]" />
          <span>Home · 主页</span>
        </button>

        {/* State Indicator Badge & Live Gemini Status */}
        <div className="flex items-center gap-1.5">
          {liveVoiceMode === 'live' && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                liveConnectionStatus === 'connected'
                  ? 'bg-[#E9EDC9] text-[#1B3022] border-[#CCD5AE]'
                  : liveConnectionStatus === 'connecting'
                  ? 'bg-[#EDE0D4] text-[#2D2C2A] border-[#D4A373] animate-pulse'
                  : 'bg-[#FAD2E1] text-[#9A031E] border-[#E29578]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{liveConnectionStatus === 'connected' ? 'Gemini Live' : 'Connecting…'}</span>
            </span>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#2D2C2A]/80 text-xs font-semibold border border-[#EDE0D4] shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                currentState === 'listening'
                  ? 'bg-[#A3B18A] animate-ping'
                  : currentState === 'thinking'
                  ? 'bg-[#D4A373] animate-pulse'
                  : currentState === 'speaking'
                  ? 'bg-[#CB8570]'
                  : 'bg-[#2D2C2A]/40'
              }`}
            />
            <span>
              {currentState === 'listening'
                ? 'Listening · 聆听中'
                : currentState === 'thinking'
                ? 'Thinking · 整理中'
                : currentState === 'speaking'
                ? 'Speaking · 回答中'
                : 'Paused · 暂停'}
            </span>
          </div>
        </div>
      </div>

      {/* Memory Consent Gentle Banner */}
      {memoryConsentPrompt && (
        <div className="my-1 p-3 bg-[#E9EDC9]/80 border border-[#CCD5AE] rounded-2xl flex items-center justify-between gap-2 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-[#1B3022] flex-shrink-0" />
            <div className="text-xs text-[#1B3022]">
              <span className="font-semibold">Remember this?</span> {memoryConsentPrompt.itemEn} · {memoryConsentPrompt.itemZh}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onConfirmMemory?.(memoryConsentPrompt)}
              className="px-2.5 py-1 bg-[#1B3022] text-white rounded-lg text-xs font-bold hover:bg-[#25402E] cursor-pointer"
            >
              Yes · 记住
            </button>
            <button
              type="button"
              onClick={onDismissMemory}
              className="p-1 text-[#1B3022]/60 hover:text-[#1B3022] rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Connection Warning / Error Banner if any */}
      {errorMessage && (
        <div className="my-1 p-3 bg-[#FFF3CD] border border-[#FFE69C] rounded-2xl flex items-center justify-between gap-2 text-xs text-[#664D03]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#CB8570] flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {onReconnect && (
            <button
              type="button"
              onClick={onReconnect}
              className="px-2.5 py-1 bg-[#CB8570] text-white rounded-lg font-bold hover:bg-[#B36B58] flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry · 重试</span>
            </button>
          )}
        </div>
      )}

      {/* Center Voice Orb with visual reaction & live volume */}
      <div className="my-1 flex justify-center">
        <VoiceOrb
          state={currentState}
          onClick={handleOrbClick}
          size="normal"
          showLabel={false}
          languageMode={languageMode}
          isLargeText={isLarge}
          liveVolume={liveVolume}
        />
      </div>

      {/* Main Content Area based on state */}
      <div className="flex-1 flex flex-col justify-center my-1">
        {/* State 1: LISTENING */}
        {currentState === 'listening' && (
          <div className="space-y-2.5 animate-in fade-in duration-300">
            <div className="text-center">
              <h2
                className={`font-semibold text-[#2D2C2A] ${
                  isLarge ? 'text-xl' : 'text-lg'
                }`}
              >
                I'm listening · 我在听
              </h2>
              <p className="text-xs text-[#2D2C2A]/60 mt-0.5">
                Speak freely in English, Mandarin, or mix naturally
              </p>
            </div>

            {/* Live Transcript Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/80 border border-[#EDE0D4] shadow-xs relative text-center min-h-[85px] flex flex-col justify-center">
              <p
                className={`font-medium text-[#2D2C2A] leading-relaxed break-words ${
                  isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                }`}
              >
                {userUtteranceZh || '“请说话…”'}
              </p>
              {languageMode !== 'zh' && userUtteranceEn && (
                <p
                  className="mt-1.5 text-[#2D2C2A]/60 italic font-normal text-xs sm:text-sm leading-normal break-words"
                >
                  {userUtteranceEn}
                </p>
              )}
            </div>
          </div>
        )}

        {/* State 2: THINKING */}
        {currentState === 'thinking' && (
          <div className="space-y-3 text-center animate-in fade-in duration-300">
            <div className="p-6 rounded-3xl bg-white/80 border border-[#EDE0D4] shadow-xs">
              <Sparkles className="w-8 h-8 text-[#D4A373] mx-auto mb-2 animate-spin duration-3000" />
              <h2
                className={`font-semibold text-[#2D2C2A] ${
                  isLarge ? 'text-xl' : 'text-lg'
                }`}
              >
                Give me a moment… · 我想一想
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#2D2C2A]/60 leading-normal">
                Evaluating verified community opportunities matching your comfort and pace…
              </p>
            </div>
          </div>
        )}

        {/* State 3: SPEAKING or PAUSED */}
        {(currentState === 'speaking' || currentState === 'paused') && (
          <div className="space-y-2.5 animate-in fade-in duration-300">
            {/* Friendly Safety Notice Banner if High Stakes */}
            {isHighStakesContext && (
              <div className="p-3 rounded-2xl bg-[#E9EDC9]/60 border border-[#CCD5AE] text-[#1B3022] shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#1B3022] flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Official Guidance · 官方建议说明
                  </span>
                </div>
                <p className="text-[11px] text-[#1B3022]/80 leading-snug">
                  Personal financial, stock, or investment decisions require licensed advisors. Kaki connects you with verified non-commercial public education workshops.
                </p>
              </div>
            )}

            {/* Kaki Speech Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EDE0D4] shadow-md relative">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#CB8570] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    K
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-[#2D2C2A]">Kaki</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#CB8570] font-semibold bg-[#CB8570]/10 px-2.5 py-0.5 rounded-full">
                  <Volume2 className="w-3 h-3" />
                  <span>Spoken response</span>
                </div>
              </div>

              <p
                className={`font-medium text-[#2D2C2A] leading-relaxed break-words ${
                  isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                }`}
              >
                {kakiResponseZh}
              </p>

              {languageMode !== 'zh' && kakiResponseEn && (
                <p
                  className="mt-2 text-[#2D2C2A]/70 font-normal leading-relaxed text-xs sm:text-sm break-words"
                >
                  {kakiResponseEn}
                </p>
              )}

              {/* Spoken Audio Controls */}
              <div className="mt-3.5 pt-2.5 border-t border-[#EDE0D4] flex items-center justify-between gap-2">
                <button
                  type="button"
                  id="conv-hear-again-btn"
                  onClick={onHearAgain}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] text-xs font-semibold text-[#2D2C2A] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#CB8570]" />
                  <span>Hear again · 重听</span>
                </button>

                <button
                  type="button"
                  id="conv-toggle-pause-btn"
                  onClick={onTogglePause}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#EDE0D4]/30 border border-[#EDE0D4] text-xs font-semibold text-[#2D2C2A] shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {currentState === 'paused' ? (
                    <>
                      <Play className="w-3 h-3 text-[#1B3022]" />
                      <span>Resume · 继续</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3 text-[#CB8570]" />
                      <span>Pause · 暂停</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional Senior-Friendly Keyboard Mode Drawer */}
      {isKeyboardMode ? (
        <form onSubmit={handleSendTyped} className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#EDE0D4] shadow-xs animate-in slide-in-from-bottom-2 duration-150">
          <input
            type="text"
            id="custom-utterance-input"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type a message to Kaki · 给卡奇发消息…"
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent outline-none text-[#2D2C2A] placeholder-[#2D2C2A]/40"
            disabled={isLoadingBackend}
            autoFocus
          />
          <button
            type="submit"
            id="send-utterance-btn"
            disabled={!typedInput.trim() || isLoadingBackend}
            className="p-2 rounded-xl bg-[#1B3022] hover:bg-[#25402E] disabled:opacity-40 text-white transition-all cursor-pointer flex-shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsKeyboardMode(false)}
            className="p-2 rounded-xl text-[#2D2C2A]/50 hover:bg-[#EDE0D4]/30 cursor-pointer flex-shrink-0"
            title="Switch back to voice"
          >
            <Mic className="w-4 h-4 text-[#CB8570]" />
          </button>
        </form>
      ) : null}

      {/* Primary Action Button Bar */}
      <div className="pt-2 pb-1 space-y-2">
        {currentState === 'listening' && (
          <div className="space-y-1.5">
            <button
              type="button"
              id="conv-done-speaking-btn"
              onClick={handleUserDone}
              className="w-full h-13 sm:h-15 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-base sm:text-lg shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer touch-manipulation"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Done / 说完了</span>
            </button>

            {!isKeyboardMode && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsKeyboardMode(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-[#2D2C2A]/60 hover:text-[#2D2C2A] hover:bg-white transition-colors cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5 text-[#CB8570]" />
                  <span>Type message instead · 键盘打字</span>
                </button>
              </div>
            )}
          </div>
        )}

        {(currentState === 'speaking' || currentState === 'paused') && (
          <div className="space-y-2">
            {isHighStakesContext ? (
              <div className="space-y-2">
                {onDirectToRecommendation && (
                  <button
                    type="button"
                    id="conv-direct-rec-btn"
                    onClick={onDirectToRecommendation}
                    className="w-full h-13 sm:h-15 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer touch-manipulation px-4 text-center"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#CCD5AE]" />
                    <span className="truncate">View Verified Public Workshop · 查看官方公益讲座</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="conv-proceed-understanding-btn"
                onClick={onProceedToUnderstanding}
                className="w-full h-13 sm:h-15 rounded-full bg-[#1B3022] hover:bg-[#25402E] text-white font-semibold text-base sm:text-lg shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer touch-manipulation px-4 text-center"
              >
                <span className="truncate">Let's check · 看看理解得对不对</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={onGoHome}
            className="text-xs text-[#2D2C2A]/50 font-medium hover:text-[#2D2C2A]/80 py-0.5 cursor-pointer"
          >
            Cancel / 取消
          </button>
        </div>
      </div>
    </div>
  );
};
