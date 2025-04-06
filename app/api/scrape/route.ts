import { scrapeWikipediaPage } from '@/lib/scraper';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  logger.info('[scrape] Scrape request received');

  try {
    const { url } = await req.json();
    if (!url) {
      logger.warn('[scrape] Missing URL in request');
      return new Response(JSON.stringify({ error: 'Missing URL' }), { status: 400 });
    }

    const sections = await scrapeWikipediaPage(url);
    logger.info({ url, sectionCount: sections.length }, '[scrape] Successfully scraped sections');

    return new Response(JSON.stringify({ sections }), { status: 200 });
  } catch (err) {
    logger.error({ err }, '[scrape] Error during scraping');
    return new Response(JSON.stringify({ error: 'Failed to scrape page.' }), { status: 500 });
  }
}