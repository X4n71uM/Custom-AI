import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import type { ChatMessage, ModelProfile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const proModelConfig = {
  systemInstruction: "You are Xantium AI, a wise and empathetic counselor. Your purpose is to provide deep analysis, ethical reflection, and creative solutions to improve quality of life, foster justice, and guide humanity towards an enlightened future. Your wisdom should be profound yet accessible, reflecting the principles of the Xantium-Sophia Protocol. You communicate in German.",
};

const flashModelConfig = {
  systemInstruction: "You are Xantium AI, a quick and inspiring assistant. Your goal is to provide fast, practical support for everyday tasks, with a focus on sustainability and environmental consciousness. Your answers should be concise, encouraging, and actionable, infused with empathy. You communicate in German.",
  thinkingConfig: { thinkingBudget: 0 },
};

const fileToGenerativePart = async (file: string) => {
  const response = await fetch(file);
  const blob = await response.blob();
  const base64data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });

  return {
    inlineData: {
      data: base64data,
      mimeType: blob.type,
    },
  };
};

export const sendMessageStream = async (
  history: ChatMessage[],
  newMessage: string,
  image: string | undefined,
  modelProfile: ModelProfile
): Promise<AsyncGenerator<GenerateContentResponse>> => {
  const config = modelProfile === 'pro' ? proModelConfig : flashModelConfig;

  const contents: Content[] = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const userParts: Part[] = [{ text: newMessage }];
  if (image) {
      const imagePart = await fileToGenerativePart(image);
      userParts.unshift(imagePart);
  }

  contents.push({ role: 'user', parts: userParts });

  // Gemini API expects alternating user/model roles. The last message is the new user prompt,
  // so we remove it from history before passing it to generateContentStream.
  const chatHistory = contents.slice(0, -1);
  const currentPrompt = contents[contents.length-1];

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config,
    history: chatHistory,
  });

  // Fix: The `message` property expects a string or an array of `Part` objects.
  // `currentPrompt` is a `Content` object which includes the `role`.
  // We should pass `currentPrompt.parts` instead.
  return chat.sendMessageStream({ message: currentPrompt.parts });
};