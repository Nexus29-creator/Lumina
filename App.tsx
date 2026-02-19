
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import LiveBrainstorm from './components/LiveBrainstorm';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import CreatorInterface from './components/CreatorInterface';
import { AppMode, UserSettings, ActiveUser } from './types';
import { translations } from './translations';
// Added missing Icons import
import { Icons } from './constants';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isCreatorUnlocked, setIsCreatorUnlocked] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    preferredModel: 'gemini-3-flash-preview',
    safetyLevel: 'medium',
    voiceName: 'Zephyr',
    enableHistory: true,
    searchGrounding: true,
    language: 'fr'
  });

  const t = translations[settings.language];

  // Simulation of "Public Server" traffic
  useEffect(() => {
    const mockUsers = [
      { name: "Alice", loc: "Paris, FR" },
      { name: "Bob", loc: "New York, US" },
      { name: "Elena", loc: "Madrid, ES" },
      { name: "Yuki", loc: "Tokyo, JP" },
      { name: "Carlos", loc: "Berlin, DE" }
    ];

    const actions = ["Chatting", "Generating Art", "Video Studio", "Idle", "Live Voice"];

    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const isAdding = Math.random() > 0.3;
        if (isAdding && prev.length < 15) {
          const userBase = mockUsers[Math.floor(Math.random() * mockUsers.length)];
          const newUser: ActiveUser = {
            id: Math.random().toString(36).substring(7),
            name: userBase.name + " " + Math.floor(Math.random() * 100),
            location: userBase.loc,
            lastAction: actions[Math.floor(Math.random() * actions.length)],
            timestamp: Date.now()
          };
          return [...prev, newUser];
        } else if (prev.length > 2) {
          return prev.filter((_, i) => i !== 0);
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleClearAll = () => {
    if (confirm("Confirmer la suppression ?")) {
      window.location.reload();
    }
  };

  const unlockCreator = (code: string) => {
    if (code.toLowerCase() === 'lumina-admin') {
      setIsCreatorUnlocked(true);
      alert("Mode Créateur activé.");
    } else {
      alert("Accès refusé.");
    }
  };

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.DASHBOARD:
        // Pass settings to Dashboard for translations
        return <Dashboard onNavigate={setCurrentMode} settings={settings} />;
      case AppMode.CHAT:
        return <ChatInterface settings={settings} />;
      case AppMode.IMAGE:
        return <ImageGenerator settings={settings} />;
      case AppMode.VIDEO:
        return <VideoGenerator />;
      case AppMode.LIVE:
        return <LiveBrainstorm settings={settings} />;
      case AppMode.SETTINGS:
        return (
          <Settings 
            settings={settings} 
            onUpdate={updateSettings} 
            onClearHistory={handleClearAll}
            onUnlockCreator={unlockCreator}
            isCreatorUnlocked={isCreatorUnlocked}
          />
        );
      case AppMode.CREATOR:
        return isCreatorUnlocked ? <CreatorInterface activeUsers={activeUsers} /> : <Dashboard onNavigate={setCurrentMode} settings={settings} />;
      default:
        return <Dashboard onNavigate={setCurrentMode} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex">
      <Sidebar 
        currentMode={currentMode} 
        onModeChange={setCurrentMode} 
        isCreatorUnlocked={isCreatorUnlocked}
        settings={settings}
      />
      
      <main className="flex-1 ml-20 md:ml-64 transition-all overflow-hidden h-screen flex flex-col relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] -z-10 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-rose-600/10 rounded-full blur-[160px] -z-10 pointer-events-none animate-pulse delay-700"></div>
        
        <header className="h-16 glass border-t-0 border-x-0 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{t.workspace} /</span>
            <span className="text-sm font-bold text-white capitalize">{currentMode.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-bold">Public Server Online</span>
              <span className="text-[10px] text-gray-500">{activeUsers.length} users active</span>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030712] bg-gray-800 overflow-hidden ring-1 ring-white/5">
                  <img src={`https://picsum.photos/seed/${i + 15}/32/32`} alt="avatar" />
                </div>
              ))}
            </div>
            <button 
              onClick={() => setCurrentMode(AppMode.SETTINGS)}
              className="hidden md:flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-lg text-sm font-bold transition-all border border-indigo-500/30"
            >
              <Icons.Settings />
            </button>
          </div>
        </header>

        <section className="flex-1 relative overflow-hidden">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;
