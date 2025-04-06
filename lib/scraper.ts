import type { Page } from 'puppeteer-core';
import { logger } from '@/lib/logger';

export async function scrapeWikipediaPage(
  url: string
): Promise<Array<{ heading: string; content: string }>> {
  const isDev = process.env.NODE_ENV === 'development';

  const puppeteer = isDev
    ? await import('puppeteer')
    : await import('puppeteer-core');

  let chromium: typeof import('chrome-aws-lambda') | null = null;
  if (!isDev) {
    chromium = (await import('chrome-aws-lambda')).default;
  }

  const browser = await puppeteer.launch({
    headless: chromium?.headless ?? true,
    args: chromium?.args ?? ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: chromium?.defaultViewport ?? null,
    executablePath: isDev ? undefined : await chromium!.executablePath,
  });

  try {
    const page = (await browser.newPage()) as Page;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const sections = await page.evaluate(() => {
      try {
        const mainPageContent = document.querySelector('#mw-content-text');
        if (!mainPageContent) return [];

        mainPageContent.querySelectorAll(
          'style, script, noscript, sup, #External_links, #References, #See_also, #Further_reading, .geo-inline-hidden'
        ).forEach((el) => el.remove());

        const infoElements = Array.from(mainPageContent.querySelectorAll('h2, p'));
        const results: { heading: string; content: string }[] = [];

        let currentHeading = 'Introduction';
        let currentContent: string[] = [];

        infoElements.forEach((el) => {
          const tag = el.tagName.toUpperCase();
          if (tag === 'H2') {
            if (currentContent.length > 0) {
              results.push({
                heading: currentHeading,
                content: currentContent.join('\n').trim(),
              });
            }
            currentHeading = el.textContent?.trim() || '(no section heading)';
            currentContent = [];
          } else if (tag === 'P') {
            const text = el.textContent?.trim();
            if (text) currentContent.push(text);
          }
        });

        if (currentContent.length > 0) {
          results.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
        }

        return results;
      } catch (e) {
        console.error('Scraping failed in page.evaluate:', e);
        return [];
      }
    }) as { heading: string; content: string }[];

    logger.info({ url, sectionCount: sections.length }, '[scraper] Extracted sections from Wikipedia');
    return sections;
  } finally {
    await browser.close();
  }
}
