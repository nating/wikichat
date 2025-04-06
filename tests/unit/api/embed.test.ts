import { describe, it, expect, vi } from 'vitest';
import { createNextRequest } from '@/tests/setup/globals';

// ✅ Mocks BEFORE imports that use them
vi.mock('@/lib/embeddings', () => ({
  embedSections: vi.fn().mockResolvedValue(undefined),
}));

// 👇 You may also mock db or logger if needed
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ✅ Import AFTER mocks
import { POST as embedHandler } from '@/app/api/embed/route';

describe('POST /api/embed', () => {
  it.skip('calls embedSections and returns 200', async () => {
    const req = createNextRequest('https://localhost:3000/api/embed', {
      method: 'POST',
      body: {
        url: 'https://en.wikipedia.org/wiki/Wola',
        userId: 'user-id',
        sections: [
          {heading: 'Intro', content: 'Test content'},
          {heading: 'History', content: 'More test content'},
        ],
      }
    },
  );

    const res = await embedHandler(req);
    expect(res.status).toBe(200);

    // 👇 Optional: Verify the mock was called with expected args
    const { embedSections } = await import('@/lib/embeddings');
    expect(embedSections).toHaveBeenCalledOnce();
  });
});
