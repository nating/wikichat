import { db } from '@/lib/db';
import { scrapedUrls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const urls = await db.select().from(scrapedUrls).where(eq(scrapedUrls.userId, userId));
  return NextResponse.json({ urls });
}
