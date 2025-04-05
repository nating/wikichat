import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { storeChunks, queryChunks } from './vector-store';
import { db } from './db';
import { vectorMetadata } from './db/schema';
import { toUrlSafeBase64 } from './utils';

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '4000', 10);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
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
  url: string,
  userId: string
): Promise<void> {
  const chunks = chunkSections(sections);
  const { embeddings } = await embedMany({
    model,
    values: chunks,
  });

  const safeUrl = toUrlSafeBase64(url);

  const chunkData = chunks.map((chunk, i) => ({
    content: chunk,
    embedding: embeddings[i],
    url,
    vectorId: `${userId}-${safeUrl}-${i}`,
  }));

  await storeChunks(userId, chunkData);
  await db.insert(vectorMetadata).values(
    chunkData.map((chunk) => ({
      userId,
      url,
      vectorId: chunk.vectorId,
    }))
  )
}

export async function getRelevantChunks(query: string, userId: string, numberOfResults = 3) {
  const { embedding } = await embed({ model, value: query });
  return await queryChunks(userId, embedding, numberOfResults);
}
