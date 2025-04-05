import { db } from '@/lib/db';
import { scrapedUrls, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, url } = await req.json();
  if (!userId || !url) {
    return NextResponse.json({ error: 'Missing userId or url' }, { status: 400 });
  }

  // Create user if not exists
  await db.insert(users).values({ id: userId }).onConflictDoNothing();

  // Check if URL already exists for this user
  const existing = await db
    .select()
    .from(scrapedUrls)
    .where(eq(scrapedUrls.userId, userId))
    .then((rows) => rows.find((r) => r.url === url));

  if (existing) {
    return NextResponse.json({ success: true, alreadyExists: true }, { status: 200 });
  }

  // Add new URL
  await db.insert(scrapedUrls).values({ userId, url });
  return NextResponse.json({ success: true });
}
