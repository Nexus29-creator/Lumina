
import React from 'react';
import { AppMode, UserSettings } from '../types';
import { Icons } from '../constants';
import { translations } from '../translations';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isCreatorUnlocked: boolean;
  settings: UserSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, isCreatorUnlocked, settings }) => {
  const t = translations[settings.language];
  const modes = [
    { id: AppMode.DASHBOARD, name: t.home, icon: Icons.Home },
    { id: AppMode.CHAT, name: t.chat, icon: Icons.Chat },
    { id: AppMode.IMAGE, name: t.art, icon: Icons.Image },
    { id: AppMode.VIDEO, name: t.video, icon: Icons.Video },
    { id: AppMode.LIVE, name: t.live, icon: Icons.Live },
  ];

  return (
    <aside className="w-20 md:w-64 glass flex flex-col h-screen fixed left-0 top-0 z-50 transition-all">
      <div className="p-6 flex items-center gap-3">
        <div 
          onClick={() => onModeChange(AppMode.DASHBOARD)}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer hover:rotate-6 transition-transform"
        >
          <Icons.Sparkles />
        </div>
        <span className="font-outfit text-xl font-bold hidden md:block">Lumina</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              currentMode === mode.id
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <mode.icon />
            <span className="font-medium hidden md:block">{mode.name}</span>
          </button>
        ))}

        {isCreatorUnlocked && (
          <button
            onClick={() => onModeChange(AppMode.CREATOR)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all mt-8 ${
              currentMode === AppMode.CREATOR
                ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                : 'text-rose-500/60 hover:bg-rose-500/10 hover:text-rose-400'
            }`}
          >
            <Icons.Shield />
            <span className="font-bold hidden md:block">{t.admin}</span>
          </button>
        )}
      </nav>

      <div className="px-3 py-6 border-t border-white/5">
        <button
          onClick={() => onModeChange(AppMode.SETTINGS)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            currentMode === AppMode.SETTINGS
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Icons.Settings />
          <span className="font-medium hidden md:block">{t.settings}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
