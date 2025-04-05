import { pineconeIndex } from './pinecone';
import { ChunkData } from './types';

/**
 * Make sure vector ID will be allowed by Pinecone
 * Only alphanumeric, hyphen, underscore, and dot are allowed for vector IDs in Pinecone
 */
function isValidVectorId(id: string): boolean {
  return /^[a-zA-Z0-9_.-]+$/.test(id);
}

/**
 * Store chunks in Pinecone, tagged by `url`
 */
export async function storeChunks(userId: string, chunks: ChunkData[]) {
  const vectors = chunks.map((chunk) => {
    if (!isValidVectorId(chunk.vectorId)) {
      throw new Error(`Invalid vector ID format: ${chunk.vectorId}`);
    }
    return {
      id: chunk.vectorId,
      values: chunk.embedding,
      metadata: {
        content: chunk.content,
        userId,
        url: chunk.url,
      },
    };
  });
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