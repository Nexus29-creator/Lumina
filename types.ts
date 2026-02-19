
export enum AppMode {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  IMAGE = 'image',
  VIDEO = 'video',
  LIVE = 'live',
  SETTINGS = 'settings',
  CREATOR = 'creator'
}

export type AppLanguage = 'en' | 'fr' | 'es';

export interface UserSettings {
  preferredModel: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
  safetyLevel: 'low' | 'medium' | 'high';
  voiceName: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
  enableHistory: boolean;
  searchGrounding: boolean;
  language: AppLanguage;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: Array<{ title: string; uri: string }>;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  status: 'processing' | 'ready' | 'error';
}

export interface LiveTranscript {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ActiveUser {
  id: string;
  name: string;
  location: string;
  lastAction: string;
  timestamp: number;
}
