import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as scrapeHandler } from '@/app/api/scrape/route';
import { scrapeWikipediaPage } from '@/lib/scraper';

vi.mock('@/lib/scraper', () => ({
  scrapeWikipediaPage: vi.fn(),
}));

describe('POST /api/scrape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if missing required fields', async () => {
    const req = new Request('http://localhost/api/scrape', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await scrapeHandler(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 if scraping fails', async () => {
    vi.mocked(scrapeWikipediaPage).mockRejectedValueOnce(new Error('fail'));

    const req = new Request('http://localhost/api/scrape', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://en.wikipedia.org/wiki/Example', userId: '123' }),
    });

    const res = await scrapeHandler(req);
    expect(res.status).toBe(500);
  });
});
