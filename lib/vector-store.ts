/**
 * A chunk, which represents one section of a Wikipedia page (or one part of a long section)
 */
export interface ChunkData {
  content: string;
  embedding: number[];
}

/**
 * This is the database that holds all our chunks and embeddings.
 */
export const vectorStore: Array<ChunkData> = [];
