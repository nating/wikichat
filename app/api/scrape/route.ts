import { NextRequest, NextResponse } from 'next/server';
import { scrapeWikipediaPage } from '@/lib/scraper';
import { embedSections } from '@/lib/embeddings';

/**
 * Scrape endpoint that takes a URL for a Wikipedia page and creates embeddings of the sections of the page
 */
export async function POST(request: NextRequest) {
  try {
    const { url, userId } = await request.json();
    if (!url || !userId) {
      return NextResponse.json({ error: 'URL and userId required.' }, { status: 400 });
    }
    const wikiSections = await scrapeWikipediaPage(url);
    await embedSections(wikiSections, url, userId);
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/track-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, url }),
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Error in /api/scrape:', err);
    return NextResponse.json({ error: 'Failed to scrape page.' }, { status: 500 });
  }
}
