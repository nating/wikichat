import { db } from '@/lib/db';
import { scrapedUrls, users } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, url } = await req.json();
  if (!userId || !url) {
    return NextResponse.json({ error: 'Missing userId or url' }, { status: 400 });
  }

  // Create user if not exists
  await db.insert(users).values({ id: userId }).onConflictDoNothing();

  // Add URL
  await db.insert(scrapedUrls).values({ userId, url }).onConflictDoNothing();

  return NextResponse.json({ success: true });
}
