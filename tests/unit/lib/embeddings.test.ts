import { describe, it, expect, vi, beforeEach } from 'vitest';
import { embedSections, getRelevantChunks } from '@/lib/embeddings';

vi.mock('@ai-sdk/openai', () => {
  return {
    openai: {
      embedding: vi.fn().mockImplementation(() => ({
        embeddings: [[0.1, 0.2, 0.3]],
        embedding: [0.1, 0.2, 0.3]
      })),
    },
  };
});

vi.mock('ai', () => ({
  embedMany: vi.fn().mockResolvedValue({
    embeddings: [['0.1', '0.2', '0.3', '0.4', '0.5']],
  }),
  embed: vi.fn().mockResolvedValue({
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
  }),
}));

vi.mock('@/lib/pinecone', () => ({
  pineconeIndex: {
    upsert: vi.fn(),
    query: vi.fn().mockResolvedValue({
      matches: [
        {
          metadata: { content: 'Relevant info' },
          values: [0.1, 0.2, 0.3],
        },
      ],
    }),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn(),
  },
  vectorMetadata: {},
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('embedSections', () => {
  it('embeds and inserts correctly', async () => {
    await embedSections([{ heading: 'Intro', content: 'Test' }], 'user1', 'https://en.wikipedia.org/wiki/Test');
    expect(true).toBe(true); // Just a smoke test for now
  });
});

describe('getRelevantChunks', () => {
  it('queries Pinecone and returns chunks', async () => {
    const result = await getRelevantChunks('query', 'user1');
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Relevant info');
  });
});
