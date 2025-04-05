'use client';
import React, { useRef, useEffect } from 'react';
import { UIMessage } from 'ai';

interface ChatBoxProps {
  messages: UIMessage[];
}

export function ChatBox({ messages }: ChatBoxProps) {
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
      className="rounded-xl border border-gray-300 dark:border-gray-700 bg-background p-4 overflow-y-auto shadow-inner space-y-3 font-sans"
      style={{ flexGrow: 1, height: '55vh' }}
    >
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const time = new Date(msg.createdAt ?? Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl whitespace-pre-wrap text-sm leading-relaxed shadow-sm ${
                isUser ? 'ml-auto bg-accent/60 text-white' : 'mr-auto bg-brand/60 text-white'
              }`}
            >
              {msg.content}
            </div>
            <span className="hidden group-hover:block text-xs text-gray-400 mt-1 font-sans transition-opacity duration-300">
              {time}
            </span>
          </div>
        );
      })}
    </div>
  );
}