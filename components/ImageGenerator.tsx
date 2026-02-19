
import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { generateImage } from '../services/gemini';
import { GeneratedImage, UserSettings } from '../types';

// Define the interface for props to include settings.
interface ImageGeneratorProps {
  settings: UserSettings;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ settings }) => {
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const url = await generateImage(prompt, referenceImage || undefined);
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: Date.now()
      };
      setGallery(prev => [newImg, ...prev]);
      setPrompt('');
      setReferenceImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-3xl font-outfit font-bold gradient-text">Visionary Art Studio</h2>
        <p className="text-gray-400">Transform your imagination into visuals using Gemini 2.5 Flash Image. Upload a style reference for precision.</p>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your masterpiece..."
                className="w-full bg-gray-900 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 shadow-inner"
              />
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-4 rounded-2xl border transition-all flex items-center gap-2 ${
                referenceImage 
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                : 'border-white/10 bg-gray-900 text-gray-400 hover:border-white/20'
              }`}
            >
              <Icons.Upload />
              <span className="text-sm font-bold hidden md:inline">
                {referenceImage ? 'Style Linked' : 'Reference'}
              </span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Icons.Sparkles />
                  Compose
                </>
              )}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          {referenceImage && (
            <div className="flex items-center gap-4 bg-indigo-500/5 p-3 rounded-2xl border border-indigo-500/10 w-fit animate-in fade-in slide-in-from-top-2">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                <img src={referenceImage} className="w-full h-full object-cover" alt="ref" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-300">Style Reference Active</p>
                <button 
                  onClick={() => setReferenceImage(null)}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Remove reference
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {gallery.map((img) => (
          <div key={img.id} className="group relative glass rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] border border-white/5">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
              <p className="text-sm font-medium line-clamp-2 text-gray-200">{img.prompt}</p>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => window.open(img.url, '_blank')}
                  className="flex-1 bg-white text-gray-900 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:bg-gray-200"
                >
                  Download HD
                </button>
              </div>
            </div>
          </div>
        ))}
        {gallery.length === 0 && !isGenerating && (
          <div className="col-span-full h-96 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-gray-600 bg-white/[0.01]">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <Icons.Image />
            </div>
            <p className="font-outfit text-xl font-bold text-gray-500">The canvas is empty</p>
            <p className="text-sm text-gray-600 mt-2">Describe a scene or upload a sketch to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
