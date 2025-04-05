'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { sanitizeWikipediaUrl } from '@/lib/utils';

/**
 * Get the user's ID or create one for them if none exists
 */
function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem('user-id');
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem('user-id', newId);
  return newId;
}

export default function HomePage() {
  const userId = useRef(getOrCreateUserId());
  const [wikiUrl, setWikiUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [warning, setWarning] = useState('');
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: { userId: userId.current },
  });

  const alreadyScraped = (() => {
    const cleanInput = sanitizeWikipediaUrl(wikiUrl);
    if (!cleanInput) return false;
    return urls.includes(cleanInput);
  })();

  /**
   * Submit the Wikipedia page URL entered by the user to the scrape endpoint
   */
  const submitUrl = async () => {
    try {
      setScraping(true);
      setIsScraped(false);

      if (!wikiUrl.trim()) {
        setWarning('Please enter a Wikipedia URL.');
        return;
      }

      const sanitizedUrl = sanitizeWikipediaUrl(wikiUrl);
      if (!sanitizedUrl) {
        setWarning('Please enter a valid Wikipedia URL (e.g. en.wikipedia.org, ja.wikipedia.org)');
        return;
      }

      if (urls.includes(sanitizedUrl)) {
        setWarning('You’ve already scraped this page.');
        return;
      }

      // Scrape request
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sanitizedUrl, userId: userId.current }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setWarning(error || 'Failed to scrape the page.');
        return;
      }

      // Track URL
      const trackRes = await fetch('/api/track-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sanitizedUrl, userId: userId.current }),
      });

      const trackJson = await trackRes.json();
      if (!trackRes.ok || !trackJson.success) {
        setWarning(trackJson.error || 'Failed to track URL.');
        return;
      }

      if (!trackJson.alreadyExists) {
        setUrls((prev) => [...prev, sanitizedUrl]);
      }

      setIsScraped(true);
      setWikiUrl(sanitizedUrl);
      setWarning('');
    } catch (err) {
      console.error('Scrape error:', err);
      setWarning('Something went wrong while scraping.');
    } finally {
      setScraping(false);
    }
  };


  /**
   * Delete a Wikipedia page URL previously entered by the user
   */
  const deleteUrl = async (urlToDelete: string) => {
    const confirmed = confirm(`Delete:\n\n${urlToDelete}?`);
    if (!confirmed) return;

    try {
      const res = await fetch('/api/delete-url', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.current, url: urlToDelete }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.error || 'Delete failed.');
        return;
      }
      setUrls((prev) => prev.filter((u) => u !== urlToDelete));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Could not delete. Try again later.');
    }
  };

  // Scroll chat box to latest messages whenever messages are updated
  const chatBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Check if the user has already scraped some Wikipedia URLs :)
  useEffect(() => {
    const checkHistory = async () => {
      try {
        const res = await fetch(`/api/user-history?userId=${userId.current}`);
        if (!res.ok) {
          return;
        }
        const { urls } = await res.json();
        if (urls?.length > 0) {
          setIsScraped(true);
          setUrls(urls.map((u: any) => u.url));
        }
      } catch (err) {
        console.warn('Failed to fetch user history:', err);
      }
    };
    checkHistory();
  }, []);

  // Set a warning if the wikipedia url input value is invalid
  useEffect(() => {
    if (!wikiUrl) {
      setWarning('');
      return;
    }

    const sanitized = sanitizeWikipediaUrl(wikiUrl);
    if (!sanitized) {
      setWarning('Please enter a valid Wikipedia article URL.');
    } else {
      setWarning('');
    }
  }, [wikiUrl]);

  return (
    <div className="w-full min-h-screen bg-white">
      <main className="mx-auto max-w-2xl p-6 flex flex-col gap-8">
        <h1 className="text-3xl font-semibold text-center tracking-tight text-black">
          Wikipedia RAG Chatbot
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Your ID: <code className="font-mono">{userId.current}</code>
        </p>
        <section className="w-full flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:border-gray-500 placeholder-gray-500 transition-colors"
            type="text"
            placeholder="Enter Wikipedia URL"
            value={wikiUrl}
            onChange={(e) => setWikiUrl(e.target.value)}
          />
          <button
            onClick={submitUrl}
            disabled={!wikiUrl || scraping || alreadyScraped}
            className={`border border-black rounded-md px-4 py-2 text-white transition-colors ${
              scraping || alreadyScraped ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {scraping ? 'Scraping...' : alreadyScraped ? 'Already Scraped' : 'Scrape'}
          </button>
        </section>
        {warning && (
          <p className="text-sm text-red-600 italic">{warning}</p>
        )}
        {urls.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-black">Scraped Pages</h2>
            <ul className="space-y-2">
              {urls.map((url) => (
                <li
                  key={url}
                  className="flex justify-between items-center bg-gray-100 rounded-md px-3 py-2 text-sm text-black break-all"
                >
                  <span>{url}</span>
                  <button
                    onClick={() => deleteUrl(url)}
                    className="ml-2 text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {isScraped ? (
          <section className="w-full flex flex-col gap-4">
            <div
              ref={chatBoxRef}
              className="border border-gray-300 rounded-md p-4 overflow-y-auto flex flex-col gap-2"
              style={{ height: '65vh' }}
            >
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`max-w-[80%] rounded-md px-3 py-2 whitespace-pre-wrap leading-relaxed text-black ${
                      isUser ? 'ml-auto bg-gray-300' : 'mr-auto bg-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:border-gray-500 placeholder-gray-500 transition-colors"
                type="text"
                placeholder="Ask a question about the article..."
                value={input}
                onChange={handleInputChange}
              />
              <button
                type="submit"
                className="border border-black rounded-md px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Send
              </button>
            </form>
          </section>
        ) : (
          <p className="text-gray-700 italic text-sm">
            Please scrape a Wikipedia page to begin chatting.
          </p>
        )}
      </main>
    </div>
  );
}
