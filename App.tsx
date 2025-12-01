
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ChatSession, ModelProfile } from './types';
import { generateId } from './utils/helpers';
import { MenuIcon, CloseIcon } from './components/icons';

const App: React.FC = () => {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('xantium-ai-chats', []);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions.sort((a, b) => b.createdAt - a.createdAt)[0].id);
    }
  }, [currentSessionId, sessions]);

  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'Neuer Chat',
      messages: [],
      modelProfile: 'pro',
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setSidebarOpen(false);
  };
  
  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
    if (currentSessionId === id) {
        const remainingSessions = sessions.filter(s => s.id !== id);
        setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions.sort((a,b) => b.createdAt - a.createdAt)[0].id : null);
    }
  }

  const handleUpdateSession = (updatedSession: ChatSession) => {
    // Auto-generate title from first message
    if (updatedSession.messages.length > 0 && updatedSession.title === 'Neuer Chat') {
        const firstUserMessage = updatedSession.messages.find(m => m.role === 'user');
        if (firstUserMessage) {
            updatedSession.title = firstUserMessage.text.split(' ').slice(0, 5).join(' ') + '...';
        }
    }

    setSessions(prev =>
      prev.map(session => (session.id === updatedSession.id ? updatedSession : session))
    );
  };
  
  const handleModelChange = (sessionId: string, model: ModelProfile) => {
      setSessions(prev =>
        prev.map(session => (session.id === sessionId ? { ...session, modelProfile: model } : session))
      );
  };

  const handleClearAll = () => {
    setSessions([]);
    setCurrentSessionId(null);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <div className="flex h-screen w-full bg-[#0A192F] text-[#CCD6F6]">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
        isOpen={isSidebarOpen}
      />
      <main className="flex-1 flex flex-col relative">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="md:hidden absolute top-4 left-4 z-30 p-2 bg-[#112240] rounded-full text-white"
        >
          {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
        <ChatView 
            session={currentSession} 
            onUpdateSession={handleUpdateSession} 
            onModelChange={handleModelChange}
        />
      </main>
    </div>
  );
};

export default App;
