import { embedSections } from '@/lib/embeddings';
import { pineconeIndex } from '@/lib/pinecone';
import { db } from '@/lib/db';

vi.mock('@/lib/pinecone', () => ({
  pineconeIndex: {
    upsert: vi.fn()
  }
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn()
  }
}));

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils');
  return {
    ...actual,
    chunkSections: (sections: any[]) => sections.map((s) => s.content)
  };
});

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

vi.mock('ai', async () => {
  return {
    embedMany: vi.fn().mockResolvedValue({
      embeddings: [[1, 2, 3], [4, 5, 6]], // fake vectors
    }),
  };
});

describe('embedSections', () => {
  it('embeds and stores sections correctly', async () => {
    await embedSections(
      [
        { heading: 'Intro', content: 'This is section one' },
        { heading: 'Details', content: 'This is section two' }
      ],
      'user-id',
      'https://en.wikipedia.org/wiki/Wola'
    );

    expect(pineconeIndex.upsert).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
  });
});
