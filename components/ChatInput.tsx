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
      data-testid="chat-form"
      onSubmit={handleSubmit}
      className="w-full flex flex-col sm:flex-row gap-3 items-end pt-4"
    >
      <input
        className="flex-1 h-[48px] rounded-lg border border-gray-300 dark:border-gray-700 bg-background px-4 text-foreground placeholder-gray-500 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand font-sans text-base"
        type="text"
        placeholder="Ask a question about the article..."
        value={input}
        onChange={handleInputChange}
      />
      <button
        type="submit"
        className="h-[48px] rounded-lg px-6 text-sm font-semibold font-sans shadow bg-brand text-white hover:bg-[--color-brand-dark] transform active:scale-[0.97] transition duration-150"
      >
        Send
      </button>
    </form>
  );
}
