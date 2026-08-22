import React from 'react';
import { Sparkles, Mic, Compass } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isLargeText?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  isLargeText = false,
}) => {
  // Map internal screens to the 3 main navigational tabs
  const getActiveTab = (): 'today' | 'talk' | 'my-world' => {
    if (currentScreen === 'home') return 'today';
    if (currentScreen === 'conversation' || currentScreen === 'understanding') return 'talk';
    if (currentScreen === 'recommendation' || currentScreen === 'my-world') return 'my-world';
    return 'today';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      aria-label="Main Navigation"
      className="flex-shrink-0 z-20 bg-[#F9F6F2] border-t border-[#EDE0D4] px-3 py-1.5 shadow-xs"
    >
      <div className="flex items-center justify-around gap-1">
        {/* Tab 1: Today */}
        <button
          type="button"
          id="nav-tab-today"
          onClick={() => onNavigate('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all touch-manipulation min-h-[48px] active:scale-95 ${
            activeTab === 'today'
              ? 'text-[#CB8570] font-bold bg-[#EDE0D4]/40'
              : 'text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-0.5 ${activeTab === 'today' ? 'text-[#CB8570] stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className={`leading-none ${isLargeText ? 'text-xs font-bold' : 'text-[11px] font-semibold'}`}>
            Today · 今天
          </span>
        </button>

        {/* Tab 2: Talk (Voice) */}
        <button
          type="button"
          id="nav-tab-talk"
          onClick={() => onNavigate('conversation')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all touch-manipulation min-h-[48px] active:scale-95 ${
            activeTab === 'talk'
              ? 'text-[#CB8570] font-bold bg-[#EDE0D4]/40'
              : 'text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
          }`}
        >
          <div className="relative">
            <Mic className={`w-4 h-4 mb-0.5 ${activeTab === 'talk' ? 'text-[#CB8570] stroke-[2.4]' : 'stroke-[1.8]'}`} />
            {activeTab === 'talk' && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#CB8570] animate-ping" />
            )}
          </div>
          <span className={`leading-none ${isLargeText ? 'text-xs font-bold' : 'text-[11px] font-semibold'}`}>
            Talk · 说话
          </span>
        </button>

        {/* Tab 3: My World */}
        <button
          type="button"
          id="nav-tab-my-world"
          onClick={() => onNavigate('my-world')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all touch-manipulation min-h-[48px] active:scale-95 ${
            activeTab === 'my-world'
              ? 'text-[#CB8570] font-bold bg-[#EDE0D4]/40'
              : 'text-[#2D2C2A]/60 hover:text-[#2D2C2A]'
          }`}
        >
          <Compass className={`w-4 h-4 mb-0.5 ${activeTab === 'my-world' ? 'text-[#CB8570] stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className={`leading-none ${isLargeText ? 'text-xs font-bold' : 'text-[11px] font-semibold'}`}>
            World · 我的
          </span>
        </button>
      </div>
    </nav>
  );
};
