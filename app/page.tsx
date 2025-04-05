'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';

export default function HomePage() {
  const [wikiUrl, setWikiUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [isScraped, setIsScraped] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  /**
   * Submit the Wikipedia page URL entered by the user to the scrape endpoint
   */
  const submitUrl = async () => {
    try {
      setScraping(true);
      setIsScraped(false);
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: wikiUrl }),
      });
      if (!res.ok) throw new Error('Failed to scrape page');
      setIsScraped(true);
    } catch (err) {
      alert('Failed to scrape the page.');
    } finally {
      setScraping(false);
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

  return (
    <div className="w-full min-h-screen bg-white">
      <main className="mx-auto max-w-2xl p-6 flex flex-col gap-8">
        <h1 className="text-3xl font-semibold text-center tracking-tight text-black">
          Wikipedia RAG Chatbot
        </h1>
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
            disabled={!wikiUrl || scraping}
            className="border border-black rounded-md px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            {scraping ? 'Scraping...' : 'Scrape'}
          </button>
        </section>
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
