'use client';
import React from 'react';

interface ChatInputProps {
  disabled: boolean;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

export function ChatInput({ disabled, input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="w-full border border-gray-300 dark:border-gray-700 bg-background rounded-xl p-2 flex items-center gap-2 shadow-sm">
      <input
        className="flex-1 h-[48px] rounded-lg px-4 text-foreground placeholder-gray-500 bg-background border-none focus:outline-none font-sans text-base"
        type="text"
        placeholder="Ask a question..."
        value={input}
        onChange={handleInputChange}
        disabled={isLoading || disabled}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading || disabled}
        className="h-[40px] w-[40px] rounded-full bg-brand hover:bg-[--color-brand-dark] text-white text-sm font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          '➤'
        )}
      </button>
    </form>
  );
}