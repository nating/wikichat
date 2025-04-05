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
      <h2 className="text-lg font-semibold text-gray-900 font-sans">Scraped Articles</h2>
      <ul className="space-y-2">
        {urls.map((url) => (
          <li
            key={url}
            className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 shadow-sm hover:bg-gray-50"
          >
            <span className="break-all flex-1 mr-4 font-sans">{url}</span>
            <button
              onClick={() => setModalUrl(url)}
              className="text-xs font-medium text-red-600 hover:text-red-800 transition font-sans"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {modalUrl && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">Delete this article?</h3>
            <p className="text-sm text-gray-600 break-words mb-4 font-sans leading-snug">{modalUrl}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalUrl(null)}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md font-sans border border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(modalUrl);
                  setModalUrl(null);
                }}
                className="text-sm font-semibold text-white bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-6 py-3 rounded-lg font-sans shadow"
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