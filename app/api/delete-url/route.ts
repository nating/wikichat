import { db } from '@/lib/db';
import { scrapedUrls, vectorMetadata } from '@/lib/db/schema';
import { pineconeIndex } from '@/lib/pinecone';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const { userId, url } = await req.json();
    if (!userId || !url) {
      return NextResponse.json({ error: 'Missing userId or url' }, { status: 400 });
    }

    // Get all vector IDs tied to this user + URL
    const vectors = await db.select().from(vectorMetadata).where(
      and(eq(vectorMetadata.userId, userId), eq(vectorMetadata.url, url))
    );
    const vectorIds = vectors.map((v) => v.vectorId);

    // Delete from Pinecone
    if (vectorIds.length > 0) {
      await pineconeIndex.deleteMany(vectorIds);
    }

    // Delete from Neon
    await db.delete(scrapedUrls).where(
      and(eq(scrapedUrls.userId, userId), eq(scrapedUrls.url, url))
    );

    await db.delete(vectorMetadata).where(
      and(eq(vectorMetadata.userId, userId), eq(vectorMetadata.url, url))
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting URL and vectors:', err);
    return NextResponse.json({ error: 'Failed to delete URL.' }, { status: 500 });
  }
}
