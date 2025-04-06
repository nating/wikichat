import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as trackUrlHandler } from '@/app/api/track-url/route';
import * as db from '@/lib/db';
import { createNextRequest } from '../../setup/globals'

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      scrapedUrls: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockReturnThis(),
  },
}));

vi.mock('@/lib/utils', () => ({
  sanitizeWikipediaUrlOrThrow: vi.fn((url) => url),
}));

describe('POST /api/track-url', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if missing url or userId', async () => {
    const req = createNextRequest('https://localhost/api/track-url', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await trackUrlHandler(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 if URL already exists', async () => {
    vi.mocked(db.db.query.scrapedUrls.findFirst).mockResolvedValueOnce({  id: 0, userId: 'string', url: 'string', scrapedAt: null, });

    const req = createNextRequest('https://localhost/api/track-url', {
      method: 'POST',
      body: JSON.stringify({ url: 'url', userId: 'abc' }),
    });

    const res = await trackUrlHandler(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.alreadyExists).toBe(true);
  });
});
