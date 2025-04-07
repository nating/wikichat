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
  const [embedding, setEmbedding] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
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
      setWarning('');

      const sanitizedUrl = sanitizeWikipediaUrl(wikiUrl);
      if (!wikiUrl.trim() || !sanitizedUrl) {
        setWarning('Please enter a valid Wikipedia article URL.');
        return;
      }
      if (urls.includes(sanitizedUrl)) {
        setWarning('You’ve already scraped this page.');
        return;
      }

      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sanitizedUrl }),
      });
      const scrapeJson = await scrapeRes.json();
      if (!scrapeRes.ok || !scrapeJson.sections) {
        setWarning(scrapeJson.error || 'Failed to scrape the page.');
        return;
      }

      setEmbedding(true);
      const embedRes = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sanitizedUrl, userId: userId.current, sections: scrapeJson.sections }),
      });
      const embedJson = await embedRes.json();
      if (!embedRes.ok || !embedJson.success) {
        setWarning(embedJson.error || 'Failed to embed the page.');
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
      setWikiUrl('');
    } catch (err) {
      console.error('Scrape/embed error:', err);
      setWarning('Something went wrong while scraping and embedding.');
    } finally {
      setScraping(false);
      setEmbedding(false);
    }
  };

  const deleteUrl = async (urlToDelete: string) => {
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
      } finally {
        setLoadingHistory(false);
      }
    };
    checkHistory();
  }, []);

  useEffect(() => {
    if (!wikiUrl) return setWarning('');
    const sanitized = sanitizeWikipediaUrl(wikiUrl);
    setWarning(!sanitized ? 'Please enter a valid Wikipedia article URL.' : '');
  }, [wikiUrl]);

  return (
    <div className="w-full h-screen bg-background flex flex-col overflow-hidden">
      <main className="mx-auto w-full max-w-2xl p-4 sm:p-6 flex flex-col gap-6 sm:gap-8 h-screen overflow-hidden">
        <DarkModeToggle />
        <header className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-brand font-sans">Wikichat</h1>
          <p className="text-xs text-foreground-base-500 break-all">
            <code className="font-mono text-[10px] text-gray-400">{userId.current}</code>
          </p>
        </header>

        <UrlInput
          wikiUrl={wikiUrl}
          warning={warning}
          onChange={(val) => setWikiUrl(val)}
          onSubmit={submitUrl}
          disabled={scraping || embedding || alreadyScraped}
          scraping={scraping || embedding}
          alreadyScraped={alreadyScraped}
        />

        <ScrapedList urls={urls} onDelete={deleteUrl} />

        <div className="flex flex-col flex-grow min-h-0 gap-2 sm:gap-3 gap-y-6">
          <ChatBox messages={messages} isEmpty={!isScraped} loading={loadingHistory} />
          <ChatInput disabled={!isScraped} input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isLoading={scraping || embedding} />
        </div>

      </main>
    </div>
  );
}