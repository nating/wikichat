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
  alreadyScraped,
}: UrlInputProps) {
  return (
    <section className="w-full flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <input
          className="flex-1 h-[48px] rounded-lg border border-gray-300 dark:border-gray-700 bg-background px-4 text-foreground placeholder-gray-500 shadow-inner focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand font-sans text-base"
          type="text"
          placeholder="Wikipedia article URL..."
          value={wikiUrl}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          onClick={onSubmit}
          disabled={!wikiUrl || disabled}
          className={`h-[48px] rounded-lg px-6 text-sm font-semibold font-sans shadow transition duration-150 transform active:scale-[0.97] ${
            !wikiUrl || disabled
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-brand text-white hover:bg-[--color-brand-dark]'
          }`}
        >
          {scraping ? 'Scraping...' : alreadyScraped ? 'Already Scraped' : 'Scrape'}
        </button>
      </div>
      {warning && <p className="text-sm text-red-500 font-medium italic mt-1 pl-1 font-sans">{warning}</p>}
    </section>
  );
}