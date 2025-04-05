'use client';
import React, { useState } from 'react';

interface ScrapedListProps {
  urls: string[];
  onDelete: (url: string) => void;
}

export function ScrapedList({ urls, onDelete }: ScrapedListProps) {
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  if (!urls.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground font-sans">Scraped Articles</h2>
      <ul className="space-y-2">
        {urls.map((url) => (
          <li
            key={url}
            className="flex justify-between items-center bg-background hover:bg-brand/10 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-foreground shadow-sm"
          >
            <span className="break-all flex-1 mr-4 font-sans">{url}</span>
            <button
              onClick={() => setModalUrl(url)}
              className="text-xs font-medium text-red-600 hover:text-red-700 transition font-sans"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {modalUrl && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-bold text-foreground mb-2 font-sans">Delete this article?</h3>
            <p className="text-sm text-gray-400 break-words mb-4 font-sans leading-snug">{modalUrl}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalUrl(null)}
                className="h-[48px] rounded-lg px-6 text-sm font-medium font-sans border border-gray-300 dark:border-gray-700 bg-background text-foreground hover:bg-brand/5 transform active:scale-[0.97] transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(modalUrl);
                  setModalUrl(null);
                }}
                className="h-[48px] rounded-lg px-6 text-sm font-semibold font-sans shadow bg-red-500 text-white hover:bg-red-600 transform active:scale-[0.97] transition duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}