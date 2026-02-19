
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatHistoryItem, UserSettings } from '../types';
import { Icons } from '../constants';
import { chatWithGemini } from '../services/gemini';

interface ChatInterfaceProps {
  settings: UserSettings;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ settings }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am Lumina. How can I assist your creative process today?',
      timestamp: Date.now()
    }
  ]);
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(input, history, settings);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        sources: response.sources,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      if (settings.enableHistory) {
        setHistory(prev => [
          ...prev,
          { role: 'user', parts: [{ text: input }] },
          { role: 'model', parts: [{ text: response.text }] }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Workspace cleared. What\'s on your mind now?',
      timestamp: Date.now()
    }]);
    setHistory([]);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
        <h2 className="text-lg font-bold font-outfit text-gray-300 flex items-center gap-2">
          <Icons.Chat /> AI Conversation
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">
            {settings.preferredModel.includes('pro') ? 'Pro Engine' : 'Flash Engine'}
          </span>
          <button 
            onClick={clearHistory}
            className="text-xs font-bold text-gray-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Icons.Trash /> Clear
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'glass text-gray-200 border border-white/5'
              } transition-all hover:scale-[1.01]`}
            >
              <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Research Citations</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg text-indigo-300 transition-colors border border-indigo-500/20"
                      >
                        {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-t from-gray-950 to-transparent sticky bottom-0">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your creative query..."
            className="w-full bg-gray-900/80 border border-white/10 rounded-2xl py-4 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all placeholder:text-gray-600 min-h-[60px] max-h-[200px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Icons.Send />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 mt-3 font-medium uppercase tracking-widest">
          {settings.enableHistory ? 'History Preserved' : 'Private Mode Active'} • Grounding: {settings.searchGrounding ? 'ON' : 'OFF'}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
