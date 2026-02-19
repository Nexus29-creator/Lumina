
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient, encode, decode, decodeAudioData } from '../services/gemini';
import { Modality, LiveServerMessage } from '@google/genai';
import { Icons } from '../constants';
import { LiveTranscript, UserSettings } from '../types';

interface LiveBrainstormProps {
  settings: UserSettings;
}

const LiveBrainstorm: React.FC<LiveBrainstormProps> = ({ settings }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGeminiClient();
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.inputTranscription) {
              currentInputTransRef.current += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription) {
              currentOutputTransRef.current += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.turnComplete) {
              const userInput = currentInputTransRef.current;
              const aiOutput = currentOutputTransRef.current;
              if (userInput) setTranscripts(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userInput }]);
              if (aiOutput) setTranscripts(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: aiOutput }]);
              currentInputTransRef.current = '';
              currentOutputTransRef.current = '';
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live error:", e);
            stopSession();
          },
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a creative partner. Respond briefly and enthusiastically to help brainstorm ideas. Be conversational."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-950 to-indigo-950/20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-outfit mb-4">Live Voice Brainstorm</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Persona active: <span className="text-indigo-400 font-bold">{settings.voiceName}</span>. Speak naturally with Lumina to iterate in real-time.
        </p>
      </div>

      <div className="relative mb-12">
        <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
        <button
          onClick={isActive ? stopSession : startSession}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isActive 
            ? 'bg-rose-600 scale-110 shadow-rose-500/40 hover:bg-rose-500' 
            : 'bg-indigo-600 hover:scale-105 shadow-indigo-500/40 hover:bg-indigo-500'
          }`}
        >
          {isActive ? (
            <div className="flex gap-1 items-center h-8">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className="w-1.5 bg-white rounded-full animate-[pulse_1s_infinite]" 
                  style={{ animationDelay: `${i * 0.1}s`, height: '100%' }}
                ></div>
              ))}
            </div>
          ) : (
            <Icons.Live />
          )}
        </button>
      </div>

      <div className="w-full max-w-2xl glass rounded-3xl p-6 h-64 overflow-y-auto space-y-4">
        {transcripts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 italic">
            Tap the button to start the conversation...
          </div>
        ) : (
          transcripts.map(t => (
            <div key={t.id} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${t.role === 'user' ? 'bg-indigo-600/20 text-indigo-200' : 'bg-white/5 text-gray-300'}`}>
                {t.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveBrainstorm;
