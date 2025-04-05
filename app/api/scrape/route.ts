import { NextRequest, NextResponse } from 'next/server';
import { scrapeWikipediaPage } from '@/lib/scraper';
import { embedSections } from '@/lib/embeddings';
import { sanitizeWikipediaUrlOrThrow } from '@/lib/utils';

/**
 * Scrape endpoint that takes a URL for a Wikipedia page and creates embeddings of the sections of the page
 */
export async function POST(request: NextRequest) {
  try {
    const { url, userId } = await request.json();
    if (!url || !userId) {
      return NextResponse.json({ error: 'Missing url or userId' }, { status: 400 });
    }

    const sanitizedUrl = sanitizeWikipediaUrlOrThrow(url);

    const wikiSections = await scrapeWikipediaPage(sanitizedUrl);
    if (!wikiSections || wikiSections.length === 0) {
      return NextResponse.json({ error: 'No content found on page' }, { status: 422 });
    }

    await embedSections(wikiSections, sanitizedUrl, userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in /api/scrape:', err);
    return NextResponse.json({ error: err.message || 'Failed to scrape page.' }, { status: 500 });
  }
}