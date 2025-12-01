
export type ModelProfile = 'pro' | 'flash';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string; // base64 data URL
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelProfile: ModelProfile;
  createdAt: number;
}
