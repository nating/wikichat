import { and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { scrapedUrls, users } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { sanitizeWikipediaUrlOrThrow } from '@/lib/utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const requestId = uuidv4();
  try {
    const { url, userId } = await request.json();
    logger.info({ requestId, userId, url }, '[track-url] Tracking URL');

    if (!url || !userId) {
      logger.warn({ requestId }, '[track-url] Missing url or userId');
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const sanitizedUrl = sanitizeWikipediaUrlOrThrow(url);

    await db.insert(users).values({ id: userId }).onConflictDoNothing();

    const exists = await db.query.scrapedUrls.findFirst({
      where: (fields, { eq }) => and(eq(fields.userId, userId), eq(fields.url, sanitizedUrl)),
    });

    if (exists) {
      logger.info({ requestId, exists }, '[track-url] URL already exists');
      return NextResponse.json({ success: true, alreadyExists: true });
    }

    await db.insert(scrapedUrls).values({ url: sanitizedUrl, userId });
    logger.info({ requestId }, '[track-url] URL inserted');

    return NextResponse.json({ success: true, alreadyExists: false });
  } catch (err: unknown) {
    logger.error({ requestId, err }, '[track-url] Failed to track URL');
    return NextResponse.json({ error: 'Failed to track URL.' }, { status: 500 });
  }
}
