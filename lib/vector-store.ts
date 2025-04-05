import { pineconeIndex } from './pinecone';
import { ChunkData } from './types';

/**
 * Store chunks in Pinecone, tagged by `url`
 */
export async function storeChunks(userId: string, chunks: ChunkData[]) {
  const vectors = chunks.map((chunk, i) => ({
    id: `${userId}-${chunk.url}-${i}`,
    values: chunk.embedding,
    metadata: {
      content: chunk.content,
      userId,
      url: chunk.url,
    },
  }));
  await pineconeIndex.upsert(vectors);
}

/**
 * Retrieve top-N relevant chunks from Pinecone for a given query
 */
export async function queryChunks(userId: string, queryEmbedding: number[], topK = 3) {
  const { matches } = await pineconeIndex.query({
    topK,
    vector: queryEmbedding,
    filter: { userId },
    includeMetadata: true,
  });

  return matches.map((match) => ({
    content: match.metadata?.content || '',
    embedding: queryEmbedding,
  }));
}