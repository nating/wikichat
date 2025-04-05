import { db } from '@/lib/db';
import { scrapedUrls, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeWikipediaUrlOrThrow } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { userId, url } = await req.json();

    if (!userId || !url) {
      return NextResponse.json({ error: 'Missing userId or url' }, { status: 400 });
    }

    const sanitizedUrl = sanitizeWikipediaUrlOrThrow(url);

    await db.insert(users).values({ id: userId }).onConflictDoNothing();

    const existing = await db
      .select()
      .from(scrapedUrls)
      .where(eq(scrapedUrls.userId, userId))
      .then((rows) => rows.find((r) => r.url === sanitizedUrl));

    if (existing) {
      return NextResponse.json({ success: true, alreadyExists: true }, { status: 200 });
    }

    await db.insert(scrapedUrls).values({ userId, url: sanitizedUrl });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in /api/track-url:', err);
    return NextResponse.json({ error: err.message || 'Failed to track scraped URL.' }, { status: 500 });
  }
}
