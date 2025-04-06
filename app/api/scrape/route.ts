import { NextRequest, NextResponse } from 'next/server';
import { scrapeWikipediaPage } from '@/lib/scraper';
import { embedSections } from '@/lib/embeddings';
import { logger } from '@/lib/logger';
import { sanitizeWikipediaUrlOrThrow } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Scrape endpoint that takes a URL for a Wikipedia page and creates embeddings of the sections of the page
 */
export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  try {
    const { url, userId } = await request.json();
    logger.info({ requestId, userId, url }, '[scrape] Scrape request received');

    if (!url || !userId) {
      logger.warn({ requestId }, '[scrape] Missing url or userId');
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const sanitizedUrl = sanitizeWikipediaUrlOrThrow(url);

    const wikiSections = await scrapeWikipediaPage(sanitizedUrl);
    logger.info({ requestId, sectionCount: wikiSections.length }, '[scrape] Scraped page sections');

    await embedSections(wikiSections, userId, sanitizedUrl);
    logger.info({ requestId }, '[scrape] Embedding complete');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    logger.error({ requestId, err }, '[scrape] Error during scraping');
    return NextResponse.json({ error: 'Failed to scrape page.' }, { status: 500 });
  }
}