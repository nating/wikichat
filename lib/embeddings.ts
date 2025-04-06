import { db } from '@/lib/db';
import { vectorMetadata } from '@/lib/db/schema';
import { toUrlSafeBase64 } from '@/lib/utils';
import { pineconeIndex } from '@/lib/pinecone';
import { logger } from '@/lib/logger';
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '4000', 10);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const model = openai.embedding(EMBEDDING_MODEL);

function chunkSection(heading: string, content: string): string[] {
  const sectionLength = heading.length + content.length;
  if (sectionLength <= CHUNK_SIZE) {
    return [`===${heading}===\n${content}`.trim()];
  }
  const numberOfChunks = Math.ceil(sectionLength / CHUNK_SIZE);
  const chunkSize = Math.ceil(sectionLength / numberOfChunks);
  const result: string[] = [];
  let start = 0;
  while (start < sectionLength) {
    const end = Math.min(start + chunkSize, sectionLength);
    const chunkContent = content.slice(start, end);
    const chunk = `===${heading}===\n${chunkContent}`.trim();
    result.push(chunk);
    start = end;
  }
  return result;
}

function chunkSections(sections: Array<{ heading: string; content: string }>): string[] {
  const allChunks: string[] = [];
  for (const section of sections) {
    const sectionChunks = chunkSection(section.heading, section.content);
    sectionChunks.forEach((chunk) => allChunks.push(chunk));
  }
  return allChunks;
}

export async function embedSections(
  sections: Array<{ heading: string; content: string }>,
  userId: string,
  url: string
): Promise<void> {
  const chunks = chunkSections(sections);
  logger.info({ userId, url, chunkCount: chunks.length }, '[embedding] Preparing to embed sections');

  const { embeddings } = await embedMany({
    model,
    values: chunks,
  });

  const safeUrl = toUrlSafeBase64(url);

  const pineconeVectors = chunks.map((content, i) => ({
    id: `${userId}-${safeUrl}-${i}`,
    values: embeddings[i],
    metadata: { userId, url, content },
  }));

  const dbEntries = chunks.map((content, i) => ({
    userId,
    url,
    vectorId: `${userId}-${safeUrl}-${i}`,
  }));

  logger.info({ userId, url }, '[embedding] Upserting into Pinecone');
  await pineconeIndex.upsert(pineconeVectors);

  logger.info({ userId, url }, '[embedding] Inserting into Neon');
  await db.insert(vectorMetadata).values(dbEntries);

  logger.info({ userId, url }, '[embedding] Embedding process complete');
}

export async function getRelevantChunks(query: string, userId: string, numberOfResults = 3) {
  const { embedding } = await embed({ model, value: query });

  const result = await pineconeIndex.query({
    topK: numberOfResults,
    vector: embedding,
    filter: { userId },
    includeMetadata: true,
  });

  logger.info({ userId, query, matches: result.matches.length }, '[embedding] Retrieved relevant chunks');

  return result.matches.map((match) => ({
    content: match.metadata?.content as string,
    embedding: match.values as number[],
  }));
}

export async function getAllVectorIdsForUrl(userId: string, url: string): Promise<string[]> {
  const dummyVector = Array(1536).fill(0);

  const result = await pineconeIndex.query({
    topK: 1000,
    vector: dummyVector,
    filter: { userId, url },
    includeMetadata: false,
  });

  const ids = result.matches.map((match) => match.id);
  logger.info({ userId, url, count: ids.length }, '[embedding] Retrieved vector IDs for deletion');
  return ids;
}