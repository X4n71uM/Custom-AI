
import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import { formatTimestamp } from '../utils/helpers';
import { UserIcon, BotIcon, CopyIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-4 p-4 my-2 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#112240] flex items-center justify-center border border-[#64FFDA]/50">
          <BotIcon className="w-6 h-6 text-[#64FFDA]" />
        </div>
      )}
      <div className={`flex flex-col max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl p-4 ${isUser ? 'bg-[#64FFDA] text-[#0A192F] rounded-br-none' : 'bg-[#112240] text-[#CCD6F6] rounded-bl-none'}`}>
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-semibold opacity-80">
                {isUser ? 'Du' : 'Xantium AI'}
             </span>
             {!isUser && (
              <button onClick={handleCopy} className="text-[#64FFDA] hover:text-white transition-colors">
                <CopyIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {message.image && (
            <img src={message.image} alt="User upload" className="max-w-xs h-auto rounded-lg mb-2" />
          )}

          <p className="whitespace-pre-wrap">{message.text}</p>
          {copied && <span className="text-xs mt-1 text-emerald-400">Kopiert!</span>}
        </div>
        <span className="text-xs text-[#8892B0] mt-1 px-2">{formatTimestamp(message.timestamp)}</span>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#112240] flex items-center justify-center border border-gray-600">
          <UserIcon className="w-6 h-6 text-[#CCD6F6]" />
        </div>
      )}
    </div>
  );
};
