'use client';
import React from 'react';

interface UrlInputProps {
  wikiUrl: string;
  warning: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  scraping: boolean;
  alreadyScraped: boolean;
}

export function UrlInput({
  wikiUrl,
  warning,
  onChange,
  onSubmit,
  disabled,
  scraping,
}: UrlInputProps) {
  return (
    <section className="w-full flex flex-col gap-2">
      <div className="flex items-center border border-gray-300 dark:border-gray-700 bg-background rounded-xl p-2 shadow-sm">
        <input
          className="flex-1 h-[48px] rounded-lg px-4 text-foreground placeholder-gray-500 bg-background border-none focus:outline-none font-sans text-base"
          type="text"
          placeholder="Wikipedia article URL..."
          value={wikiUrl}
          onChange={(e) => onChange(e.target.value)}
          disabled={scraping}
        />
        <button
          onClick={onSubmit}
          disabled={!wikiUrl || disabled || !!warning}
          className="h-[40px] w-[40px] rounded-full bg-brand hover:bg-[--color-brand-dark] text-white text-sm font-bold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {scraping ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            '➤'
          )}
        </button>
      </div>
      {warning && <p className="text-sm text-red-500 font-medium italic mt-1 pl-1 font-sans">{warning}</p>}
    </section>
  );
}