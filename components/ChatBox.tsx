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
      className="rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 overflow-y-auto shadow-inner space-y-3 font-sans"
      style={{ flexGrow: 1, height: '55vh' }}
    >
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-3 rounded-xl whitespace-pre-wrap text-sm leading-relaxed shadow-sm ${
              isUser ? 'ml-auto bg-blue-100 text-gray-900' : 'mr-auto bg-gray-100 text-gray-800'
            }`}
          >
            {msg.content}
          </div>
        );
      })}
    </div>
  );
}