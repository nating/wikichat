export function toUrlSafeBase64(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-') // replace + with -
    .replace(/\//g, '_') // replace / with _
    .replace(/=+$/, ''); // remove trailing =
}

export function sanitizeWikipediaUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);

    // Must be something like en.wikipedia.org, ja.wikipedia.org, fr.m.wikipedia.org, etc.
    const isValidHost = /^[a-z]{2,3}(\.m)?\.wikipedia\.org$/.test(parsed.hostname);
    if (!isValidHost) return null;

    // Normalize m.wikipedia.org → wikipedia.org
    const hostname = parsed.hostname.replace('.m.wikipedia.org', '.wikipedia.org');

    // Strip query params and fragments
    const pathname = parsed.pathname;

    // Must be a valid article path: /wiki/Some_Title
    const isWikiArticle = /^\/wiki\/[^\/#?]+$/.test(pathname);
    if (!isWikiArticle) return null;

    // Reject common non-article pages
    const disallowedTitles = ['Main_Page', 'Special:', 'Help:', 'Wikipedia:'];
    const title = decodeURIComponent(pathname.replace(/^\/wiki\//, ''));
    if (disallowedTitles.some((disallowed) => title.startsWith(disallowed))) return null;

    return `https://${hostname}${pathname}`;
  } catch {
    return null;
  }
}

export function sanitizeWikipediaUrlOrThrow(rawUrl: string): string {
  const clean = sanitizeWikipediaUrl(rawUrl);
  if (!clean) throw new Error('Invalid Wikipedia article URL');
  return clean;
}