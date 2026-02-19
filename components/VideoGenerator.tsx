
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { startVideoGeneration, checkVideoStatus } from '../services/gemini';
import { GeneratedVideo } from '../types';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [currentOperation, setCurrentOperation] = useState<any>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasKey(ok);
    };
    checkKey();
  }, []);

  const handleAuth = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !!currentOperation) return;

    try {
      const operation = await startVideoGeneration(prompt);
      const newVid: GeneratedVideo = {
        id: operation.name,
        url: '',
        prompt: prompt,
        timestamp: Date.now(),
        status: 'processing'
      };
      setVideos(prev => [newVid, ...prev]);
      setCurrentOperation(operation);
      setPrompt('');
      
      // Start polling
      pollStatus(operation, newVid.id);
    } catch (err: any) {
      if (err.message.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      alert("Error starting video generation. Please check your API key permissions.");
    }
  };

  const pollStatus = async (op: any, id: string) => {
    const check = async () => {
      try {
        const url = await checkVideoStatus(op);
        if (url) {
          setVideos(prev => prev.map(v => v.id === id ? { ...v, url, status: 'ready' } : v));
          setCurrentOperation(null);
        } else {
          setTimeout(check, 10000); // Poll every 10s
        }
      } catch (err) {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v));
        setCurrentOperation(null);
      }
    };
    check();
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
          <Icons.Video />
        </div>
        <h2 className="text-3xl font-bold font-outfit mb-4">Unlock Video Studio</h2>
        <p className="text-gray-400 max-w-md mb-8">
          Veo 3.1 Fast video generation requires a dedicated API key. Please connect your account to start creating cinematic sequences.
        </p>
        <button
          onClick={handleAuth}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-amber-900/30"
        >
          Select API Key
        </button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="mt-4 text-sm text-gray-500 underline">Learn about billing</a>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-3xl font-outfit font-bold gradient-text">Cinematic Video Suite</h2>
        <p className="text-gray-400">Generate high-fidelity AI video clips using Veo 3.1 technology.</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your cinematic vision..."
              className="w-full bg-gray-900 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!!currentOperation || !prompt.trim()}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-amber-900/20 flex items-center gap-2"
          >
            {currentOperation ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Rendering...
              </div>
            ) : "Action!"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8">
        {videos.map((vid) => (
          <div key={vid.id} className="glass rounded-3xl overflow-hidden p-4">
            {vid.status === 'processing' ? (
              <div className="aspect-video bg-gray-900/50 rounded-2xl flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-amber-500 font-bold uppercase tracking-widest text-xs">Dreaming in pixels</p>
                  <p className="text-gray-500 text-sm mt-1">This usually takes 2-3 minutes...</p>
                </div>
              </div>
            ) : vid.status === 'ready' ? (
              <video src={vid.url} controls className="w-full aspect-video rounded-2xl shadow-2xl" />
            ) : (
              <div className="aspect-video bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                Generation failed. Please try a different prompt.
              </div>
            )}
            <div className="mt-4 px-2">
              <h3 className="font-bold text-gray-300">Prompt</h3>
              <p className="text-sm text-gray-500 italic mt-1">{vid.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGenerator;
