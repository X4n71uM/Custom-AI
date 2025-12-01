import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession, ChatMessage, ModelProfile } from '../types';
import { Message } from './Message';
import { ModelSelector } from './ModelSelector';
import { SendIcon, MicIcon, ImageIcon, CloseIcon } from './icons';
import { sendMessageStream } from '../services/geminiService';
import { generateId } from '../utils/helpers';

// Fix: Add declarations for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}


interface ChatViewProps {
  session: ChatSession | null;
  onUpdateSession: (session: ChatSession) => void;
  onModelChange: (sessionId: string, model: ModelProfile) => void;
}

const WelcomeScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-24 h-24 mb-6">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 20 L80 80" stroke="url(#grad1)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M20 80 L80 20" stroke="url(#grad2)" strokeWidth="8" strokeLinecap="round"/>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#64FFDA', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#2ECC71', stopOpacity: 1}} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: '#FFD700', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#64FFDA', stopOpacity: 1}} />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <h1 className="text-3xl font-bold text-white">Xantium AI</h1>
    <h2 className="text-xl text-[#64FFDA] mt-2">Die Brücke zur Erleuchtung</h2>
    <p className="mt-4 text-[#8892B0] max-w-md">
      Intelligenz im Einklang: Für eine Welt, die aufblüht.
      <br />
      Wählen Sie links einen Chat aus oder starten Sie einen neuen.
    </p>
  </div>
);

const LoadingIndicator: React.FC = () => (
  <div className="flex items-center gap-3 p-4">
     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#112240] flex items-center justify-center border border-[#64FFDA]/50">
       <svg className="w-6 h-6 text-[#64FFDA] animate-[spin_1.5s_linear_infinite]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
         <circle cx="50" cy="50" r="40" stroke="#64FFDA" strokeWidth="8" strokeDasharray="100 251.2" strokeLinecap="round" />
       </svg>
    </div>
    <div className="rounded-2xl p-4 bg-[#112240] text-[#CCD6F6] rounded-bl-none">
      <p className="text-sm">Xantium AI denkt nach...</p>
    </div>
  </div>
);


export const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateSession, onModelChange }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fix: With types defined, we can safely access window properties.
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'de-DE';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        setInput(prev => (prev ? prev.trim() + ' ' : '') + transcript.trim());
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (isRecording) {
            setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (isRecording) {
            setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition not supported by this browser.');
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isLoading]);

  if (!session) {
    return <WelcomeScreen />;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imagePreview) return;
    
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      image: imagePreview,
    };

    const updatedMessages = [...session.messages, userMessage];
    onUpdateSession({ ...session, messages: updatedMessages });

    setInput('');
    setImagePreview(undefined);

    const modelResponse: ChatMessage = {
      id: generateId(),
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };

    try {
      const stream = await sendMessageStream(session.messages, userMessage.text, userMessage.image, session.modelProfile);

      for await (const chunk of stream) {
        modelResponse.text += chunk.text;
        onUpdateSession({ ...session, messages: [...updatedMessages, modelResponse] });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      modelResponse.text = "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.";
      onUpdateSession({ ...session, messages: [...updatedMessages, modelResponse] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecording = () => {
    if (!isSpeechSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A192F]">
      <div className="flex-shrink-0">
        <ModelSelector selectedModel={session.modelProfile} onModelChange={(model) => onModelChange(session.id, model)} />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {session.messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#112240]">
        <form onSubmit={handleSendMessage} className="relative">
          {imagePreview && (
            <div className="absolute bottom-full mb-2 p-2 bg-[#112240] rounded-lg">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
              <button
                type="button"
                onClick={() => setImagePreview(undefined)}
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ihre Nachricht an Xantium AI..."
            className="w-full bg-[#112240] text-[#CCD6F6] rounded-full py-3 pl-12 pr-28 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#64FFDA] transition-all"
            disabled={isLoading}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-3">
             <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#8892B0] hover:text-[#64FFDA]" title="Bild hochladen" disabled={isLoading}>
                <ImageIcon className="w-6 h-6" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
             <button
                type="button"
                onClick={handleToggleRecording}
                className={`text-[#8892B0] hover:text-[#64FFDA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording ? 'text-red-500' : ''
                }`}
                title={isSpeechSupported ? (isRecording ? 'Aufnahme stoppen' : 'Spracheingabe') : 'Spracheingabe nicht unterstützt'}
                disabled={!isSpeechSupported || isLoading}
              >
                <MicIcon className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#64FFDA] text-[#0A192F] rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            disabled={isLoading || (!input.trim() && !imagePreview)}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};