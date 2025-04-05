// This is the modernized, clean, and componentized version of your HomePage
// with world-class UI/UX and best practices baked in

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { sanitizeWikipediaUrl } from '@/lib/utils';
import { UrlInput } from '@/components/UrlInput';
import { ScrapedList } from '@/components/ScrapedList';
import { ChatBox } from '@/components/ChatBox';
import { ChatInput } from '@/components/ChatInput';
import { DarkModeToggle } from '@/components/DarkModeToggle';

type ScrapedUrl = { url: string };

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
        setWarning('Please enter a valid Wikipedia article URL.');
        return;
      }

      if (urls.includes(sanitizedUrl)) {
        setWarning('You’ve already scraped this page.');
        return;
      }

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

  useEffect(() => {
    const checkHistory = async () => {
      try {
        const res = await fetch(`/api/user-history?userId=${userId.current}`);
        if (!res.ok) return;

        const { urls } = await res.json();
        if (urls?.length > 0) {
          setIsScraped(true);
          setUrls((urls as ScrapedUrl[]).map((u) => u.url));
        }
      } catch (err) {
        console.warn('Failed to fetch user history:', err);
      }
    };
    checkHistory();
  }, []);

  useEffect(() => {
    if (!wikiUrl) {
      setWarning('');
      return;
    }
    const sanitized = sanitizeWikipediaUrl(wikiUrl);
    setWarning(!sanitized ? 'Please enter a valid Wikipedia article URL.' : '');
  }, [wikiUrl]);

  return (
    <div className="w-full min-h-screen bg-background">
      <main className="mx-auto max-w-2xl p-6 flex flex-col gap-8">
        <DarkModeToggle />
        <header className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground-base">Wikipedia RAG Chatbot</h1>
          <p className="text-sm text-foreground-base-500">
            Your ID: <code className="font-mono">{userId.current}</code>
          </p>
        </header>

        <UrlInput
          wikiUrl={wikiUrl}
          warning={warning}
          onChange={(val) => setWikiUrl(val)}
          onSubmit={submitUrl}
          disabled={scraping || alreadyScraped}
          scraping={scraping}
          alreadyScraped={alreadyScraped}
        />

        <ScrapedList urls={urls} onDelete={deleteUrl} />

        {isScraped ? (
          <>
            <ChatBox messages={messages} />
            <ChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          </>
        ) : (
          <p className="text-foreground-base-700 italic text-sm text-center">
            Please scrape a Wikipedia page to begin chatting.
          </p>
        )}
      </main>
    </div>
  );
}