import { sanitizeWikipediaUrl } from '@/lib/utils';

describe('sanitizeWikipediaUrl', () => {
  it('returns null for invalid URLs', () => {
    expect(sanitizeWikipediaUrl('not a url')).toBe(null);
    expect(sanitizeWikipediaUrl('https://example.com')).toBe(null);
  });

  it('normalizes URLs by stripping parameters and anchors', () => {
    const dirty = 'https://en.wikipedia.org/wiki/Wola?ref=something#History';
    const clean = 'https://en.wikipedia.org/wiki/Wola';
    expect(sanitizeWikipediaUrl(dirty)).toBe(clean);
  });

  it('treats mobile and desktop as equal', () => {
    expect(sanitizeWikipediaUrl('https://en.m.wikipedia.org/wiki/Wola'))
      .toBe('https://en.wikipedia.org/wiki/Wola');
  });

  it('supports non-English Wikipedia domains', () => {
    expect(sanitizeWikipediaUrl('https://ja.wikipedia.org/wiki/東京'))
      .toBe('https://ja.wikipedia.org/wiki/%E6%9D%B1%E4%BA%AC');
  });
});
