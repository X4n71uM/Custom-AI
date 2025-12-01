
import React from 'react';
import type { ChatSession } from '../types';
import { LogoIcon, PlusIcon, TrashIcon } from './icons';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onClearAll,
  isOpen,
}) => {
  return (
    <div
      className={`absolute z-20 md:relative inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out bg-[#112240] w-64 md:w-72 flex flex-col border-r border-[#1d2d49]`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[#1d2d49]">
        <div className="flex items-center gap-2">
            <LogoIcon className="w-8 h-8" />
            <h1 className="text-lg font-bold text-white">Xantium AI</h1>
        </div>
      </div>
      <button
        onClick={onCreateSession}
        className="flex items-center justify-center gap-2 m-4 p-2 rounded-lg bg-[#0A192F] text-[#64FFDA] hover:bg-[#1d2d49] transition-colors"
      >
        <PlusIcon className="w-5 h-5" />
        Neuer Chat
      </button>

      <div className="flex-1 overflow-y-auto px-2">
        <h2 className="text-xs font-semibold uppercase text-[#8892B0] px-2 mt-4 mb-2">Verlauf</h2>
        <nav className="flex flex-col gap-1">
          {sessions.sort((a,b) => b.createdAt - a.createdAt).map((session) => (
            <div key={session.id} className="group flex items-center">
                <a
                    href="#"
                    onClick={(e) => {
                    e.preventDefault();
                    onSelectSession(session.id);
                    }}
                    className={`flex-1 block p-2 rounded-md text-sm truncate ${
                    currentSessionId === session.id
                        ? 'bg-[#64FFDA] text-[#0A192F]'
                        : 'text-[#CCD6F6] hover:bg-[#0A192F]'
                    }`}
                >
                    {session.title}
                </a>
                <button 
                    onClick={() => onDeleteSession(session.id)} 
                    className="p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-opacity"
                    title="Chat löschen"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-[#1d2d49]">
        <button
          onClick={() => {
            if (window.confirm('Möchten Sie wirklich den gesamten Verlauf löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.')) {
              onClearAll();
            }
          }}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm text-amber-400 hover:bg-amber-400/10 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
          Verlauf leeren
        </button>
      </div>
    </div>
  );
};
