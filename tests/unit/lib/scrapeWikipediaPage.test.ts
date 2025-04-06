import { describe, it, expect, vi } from 'vitest';
import { scrapeWikipediaPage } from '@/lib/scraper';

vi.stubGlobal('process', {
  env: { NODE_ENV: 'development' },
});

vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn(),
        evaluate: vi.fn().mockResolvedValue([
          { heading: 'Intro', content: 'Test content' }
        ]),
        close: vi.fn()
      }),
      close: vi.fn()
    }),
  }
}));

describe('scrapeWikipediaPage', () => {
  it.skip('scrapes and returns sections', async () => {
    const sections = await scrapeWikipediaPage('https://en.wikipedia.org/wiki/Wola');
    expect(sections).toHaveLength(1);
    expect(sections[0]).toHaveProperty('heading', 'Intro');
    expect(sections[0]).toHaveProperty('content', 'Test content');
  });
});
