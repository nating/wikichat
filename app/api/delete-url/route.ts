import { NextRequest, NextResponse } from 'next/server';
import { pineconeIndex } from '@/lib/pinecone';
import { db } from '@/lib/db';
import { scrapedUrls, vectorMetadata } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { getAllVectorIdsForUrl } from '@/lib/embeddings';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  const requestId = uuidv4();
  try {
    const { userId, url } = await request.json();
    logger.info({ requestId, userId, url }, '[delete-url] Delete request received');

    if (!userId || !url) {
      logger.warn({ requestId }, '[delete-url] Missing userId or url');
      return NextResponse.json({ error: 'Missing userId or url.' }, { status: 400 });
    }

    const vectorIds = await getAllVectorIdsForUrl(userId, url);
    logger.info({ requestId, count: vectorIds.length }, '[delete-url] Deleting vectors from Pinecone');

    if (vectorIds.length > 0) {
      await pineconeIndex.deleteMany(vectorIds);
    }

    await db.delete(scrapedUrls).where(
      and(eq(scrapedUrls.userId, userId), eq(scrapedUrls.url, url))
    );

    await db.delete(vectorMetadata).where(
      and(eq(vectorMetadata.userId, userId), eq(vectorMetadata.url, url))
    );

    logger.info({ requestId }, '[delete-url] URL deleted from database');

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error({ requestId, err }, '[delete-url] Failed to delete URL');
    return NextResponse.json({ error: 'Failed to delete URL.' }, { status: 500 });
  }
}
