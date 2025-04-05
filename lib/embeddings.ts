import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { vectorStore } from '@/lib/vector-store';
import similarity from 'compute-cosine-similarity';

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '4000', 10);
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'
const model = openai.embedding(EMBEDDING_MODEL);

/**
 * Splits up a Wikipedia page's section into sub chunks if it is longer than our desired chunk size
 */
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

/**
 * Creates chunks from the sections of a Wikipedia page
 */
function chunkSections(sections: Array<{ heading: string; content: string }>): string[] {
  const allChunks: string[] = [];
  for (const section of sections) {
    const sectionChunks = chunkSection(section.heading, section.content);
    sectionChunks.forEach((chunk) => allChunks.push(chunk));
  }
  return allChunks;
}

/**
 * Creates embeddings from the sections of a Wikipedia page and stores them in our vector store
 */
export async function embedSections(sections: Array<{ heading: string; content: string }>): Promise<void> {
  const chunks = chunkSections(sections);
  const { embeddings } = await embedMany({
    model,
    values: chunks,
  });
  chunks.map((chunk, i) => {
    vectorStore.push({ content: chunk, embedding: embeddings[i] });
  });
}

/**
 * Takes a user's query string and the desired number of relevant chunks. Returns the desired number of relevant chunks
 * from our vector storage.
 *
 * The function makes an embedding of the user's query and uses that to do a cosine similarity check on the embeddings
 * we have stored in our database.
 */
export async function getRelevantChunks(query: string, numberOfResults = 3) {
  if (vectorStore.length < 1) {
    return [];
  }
  const { embedding } = await embed({ model, value: query });
  const queryEmbedding = embedding;
  const scoredChunks = vectorStore.map((item: any) => ({
    ...item,
    score: similarity(queryEmbedding, item.embedding),
  }));
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, numberOfResults);
}
