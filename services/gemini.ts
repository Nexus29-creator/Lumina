
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ChatHistoryItem, UserSettings } from "../types";

// Always use process.env.API_KEY directly as per guidelines.
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const chatWithGemini = async (prompt: string, history: ChatHistoryItem[] = [], settings?: UserSettings) => {
  const ai = getGeminiClient();
  const chat = ai.chats.create({
    model: settings?.preferredModel || 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are Lumina, a creative AI assistant. You help users brainstorm, write, and visualize ideas. Use a professional yet inspiring tone.',
      tools: settings?.searchGrounding !== false ? [{ googleSearch: {} }] : [],
    },
    history: history
  });

  const response = await chat.sendMessage({ message: prompt });
  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || ''
    })).filter((s: any) => s.uri) || []
  };
};

export const generateImage = async (prompt: string, referenceImageBase64?: string) => {
  const ai = getGeminiClient();
  const parts: any[] = [{ text: prompt }];
  
  if (referenceImageBase64) {
    parts.unshift({
      inlineData: {
        data: referenceImageBase64.split(',')[1],
        mimeType: referenceImageBase64.match(/data:([^;]+);/)?.[1] || 'image/png'
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

export const getDailyInspiration = async () => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Give me a short, highly creative and inspiring one-sentence prompt for a digital artist today.',
    config: {
      systemInstruction: 'You are a creative director.',
    }
  });
  return response.text || "Create a world where light behaves like liquid.";
};

export const startVideoGeneration = async (prompt: string) => {
  const ai = getGeminiClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  return operation;
};

export const checkVideoStatus = async (operation: any) => {
  const ai = getGeminiClient();
  const updatedOp = await ai.operations.getVideosOperation({ operation });
  if (updatedOp.done && updatedOp.response?.generatedVideos?.[0]?.video?.uri) {
    const downloadLink = updatedOp.response.generatedVideos[0].video.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  return null;
};

// Live API Helpers
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
