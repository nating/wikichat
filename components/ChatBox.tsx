'use client';

import React, { useRef, useEffect } from 'react';
import { UIMessage } from 'ai';

interface ChatBoxProps {
  messages: UIMessage[];
  isEmpty: boolean;
  loading?: boolean;
}

export function ChatBox({ messages, isEmpty, loading }: ChatBoxProps) {
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div
      ref={chatBoxRef}
      className="transition-all duration-300 relative flex-grow min-h-0 overflow-y-auto rounded-xl border border-gray-300 dark:border-gray-700 bg-background p-4 shadow-inner space-y-3 font-sans"
    >
      {loading ? (
        <div className="text-sm text-gray-400 italic text-center animate-pulse">Loading chat history…</div>
      ) : isEmpty ? (
        <div className="text-sm text-gray-400 italic text-center">Please scrape a Wikipedia page to begin chatting.</div>
      ) : (
        messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id ?? idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-xl whitespace-pre-wrap text-sm leading-relaxed shadow-sm transition-colors duration-300 ${
                  isUser ? 'ml-auto bg-accent/60 text-white' : 'mr-auto bg-brand/60 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}