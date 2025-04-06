import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapedUrls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const requestId = uuidv4();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    logger.info({ requestId, userId }, '[user-history] Fetching URLs');
    if (!userId) {
      logger.warn({ requestId }, '[user-history] No userId provided');
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }

    const urls = await db.select().from(scrapedUrls).where(eq(scrapedUrls.userId, userId));
    logger.info({ requestId, count: urls.length }, '[user-history] URLs fetched');

    return NextResponse.json({ urls });
  } catch (err: unknown) {
    logger.error({ requestId, err }, '[user-history] Failed to fetch user history');
    return NextResponse.json({ error: 'Failed to fetch user history.' }, { status: 500 });
  }
}
