
import React, { useState } from 'react';
import { Icons } from '../constants';
import { UserSettings, AppLanguage } from '../types';
import { translations } from '../translations';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => void;
  onClearHistory: () => void;
  onUnlockCreator: (code: string) => void;
  isCreatorUnlocked: boolean;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearHistory, onUnlockCreator, isCreatorUnlocked }) => {
  const t = translations[settings.language];
  const voices: UserSettings['voiceName'][] = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];
  const [accessCode, setAccessCode] = useState('');

  return (
    <div className="p-8 h-full overflow-y-auto max-w-4xl mx-auto space-y-10 pb-20">
      <header className="space-y-2">
        <h2 className="text-3xl font-outfit font-bold gradient-text">{t.preferences}</h2>
        <p className="text-gray-400">Configure your creative environment and security parameters.</p>
      </header>

      {/* Language Section */}
      <section className="glass rounded-[32px] p-8 border border-white/5 space-y-6">
        <div className="flex items-center gap-3 text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          <h3 className="text-xl font-bold font-outfit">{t.language}</h3>
        </div>
        <div className="flex gap-4">
          {(['en', 'fr', 'es'] as AppLanguage[]).map(lang => (
            <button
              key={lang}
              onClick={() => onUpdate({ language: lang })}
              className={`px-6 py-3 rounded-2xl font-bold transition-all border ${
                settings.language === lang 
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="glass rounded-[32px] p-8 border border-white/5 space-y-6">
        <div className="flex items-center gap-3 text-indigo-400">
          <Icons.Shield />
          <h3 className="text-xl font-bold font-outfit">{t.security}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="font-bold text-sm">Cloud History</p>
                <p className="text-xs text-gray-500">Store conversations for context</p>
              </div>
              <button 
                onClick={() => onUpdate({ enableHistory: !settings.enableHistory })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableHistory ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableHistory ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="font-bold text-sm">Search Grounding</p>
                <p className="text-xs text-gray-500">Allow AI to verify facts online</p>
              </div>
              <button 
                onClick={() => onUpdate({ searchGrounding: !settings.searchGrounding })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.searchGrounding ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.searchGrounding ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex flex-col justify-between">
            <div>
              <p className="font-bold text-rose-400 text-sm">Data Erasure</p>
              <p className="text-xs text-rose-300/60 mt-1 leading-relaxed">Permanently clear all local session data and logs.</p>
            </div>
            <button 
              onClick={onClearHistory}
              className="mt-4 w-full py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-500/20"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </section>

      {/* Creator Secret Access */}
      {!isCreatorUnlocked && (
        <section className="glass rounded-[32px] p-8 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Admin Access</h3>
          <div className="flex gap-2">
            <input 
              type="password" 
              placeholder="Enter Creator Key..."
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50"
            />
            <button 
              onClick={() => onUnlockCreator(accessCode)}
              className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl text-xs font-bold transition-all"
            >
              Unlock
            </button>
          </div>
        </section>
      )}

      {isCreatorUnlocked && (
        <div className="text-center bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
          <p className="text-rose-400 font-bold text-sm">Creator Mode Unlocked • Use Sidebar to access</p>
        </div>
      )}
      
      <div className="text-center pt-10">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Lumina Studio v1.2.4 • Public Server Relay Active</p>
      </div>
    </div>
  );
};

export default Settings;
