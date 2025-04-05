'use client';
import React from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ input, handleInputChange, handleSubmit }: ChatInputProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row gap-3 items-end pt-4"
    >
      <input
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-500 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans text-base"
        type="text"
        placeholder="Ask a question about the article..."
        value={input}
        onChange={handleInputChange}
      />
      <button
        type="submit"
        className="h-[48px] rounded-lg px-6 bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm font-semibold hover:from-sky-600 hover:to-blue-700 transition font-sans shadow"
      >
        Send
      </button>
    </form>
  );
}