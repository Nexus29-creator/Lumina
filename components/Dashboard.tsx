
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { AppMode, UserSettings } from '../types';
import { getDailyInspiration } from '../services/gemini';
import { translations } from '../translations';

interface DashboardProps {
  onNavigate: (mode: AppMode) => void;
  // This prop wasn't passed in App.tsx before but let's assume it should be for translation.
  // Actually, let's just use a hardcoded default or pass it if possible.
  // For consistency with other components, I'll update App.tsx to pass it.
  settings?: UserSettings; 
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, settings }) => {
  const lang = settings?.language || 'en';
  const t = translations[lang];
  const [inspiration, setInspiration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const text = await getDailyInspiration();
        setInspiration(text);
      } catch (e) {
        setInspiration("Visualize the unseen threads of the universe.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspiration();
  }, []);

  const tools = [
    { 
      id: AppMode.CHAT, 
      name: t.chat, 
      desc: 'Ground-truth brainstorming with web access.', 
      icon: Icons.Chat,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: AppMode.IMAGE, 
      name: t.art, 
      desc: 'Multimodal image creation and reference styles.', 
      icon: Icons.Image,
      color: 'from-purple-500 to-rose-500'
    },
    { 
      id: AppMode.VIDEO, 
      name: t.video, 
      desc: 'Cinematic video generation from prompts.', 
      icon: Icons.Video,
      color: 'from-amber-500 to-orange-600'
    },
    { 
      id: AppMode.LIVE, 
      name: t.live, 
      desc: 'Real-time voice conversation and ideation.', 
      icon: Icons.Live,
      color: 'from-emerald-500 to-teal-600'
    },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto max-w-6xl mx-auto space-y-12 pb-20">
      <header className="space-y-4">
        <h1 className="text-5xl font-outfit font-extrabold tracking-tight">
          {t.welcome} <span className="gradient-text">{t.creator}</span>.
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl">
          Your multimodal workspace for turning abstract ideas into digital reality.
        </p>
      </header>

      {/* Daily Inspiration Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative glass p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400">
            <Icons.Sparkles />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-indigo-400">{t.dailyInspiration}</p>
            {isLoading ? (
              <div className="h-6 w-3/4 bg-white/5 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl italic font-medium text-gray-200 leading-relaxed">
                "{inspiration}"
              </p>
            )}
          </div>
          <button 
            onClick={() => onNavigate(AppMode.IMAGE)}
            className="px-6 py-3 bg-white text-gray-950 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10 shrink-0"
          >
            {t.generate}
          </button>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className="glass group hover:bg-white/5 p-6 rounded-3xl text-left border border-white/5 transition-all hover:border-white/20 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform`}>
              <tool.icon />
            </div>
            <h3 className="text-xl font-bold mb-2 font-outfit">{tool.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{tool.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {t.launch} 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
