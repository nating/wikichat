import puppeteer from 'puppeteer';

/**
 * Scrapes a Wikipedia page and returns an array of the page's sections
 */
export async function scrapeWikipediaPage(url: string): Promise<Array<{ heading: string; content: string }>> {
  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']}, // For Tiago's machine just in case!
  );
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const sections = await page.evaluate(() => {
    const mainPageContent = document.querySelector('#mw-content-text');
    if (!mainPageContent) return [];

    // Remove certain tags with text we want to ignore
    mainPageContent.querySelectorAll(
        'style, script, noscript, sup, #External_links, #References, #See_also, #Further_reading, .geo-inline-hidden'
    ).forEach((element: Element) => element.remove());

    // Get just the tags with the information that we want
    const infoElements = Array.from(mainPageContent.querySelectorAll('h2, p'));

    // Create an array of sections. Create each section from a header and the contents that follows it.
    const results: { heading: string; content: string }[] = [];
    let currentHeading = 'Introduction';
    let currentContent: string[] = [];
    infoElements.forEach((element) => {
      const tagName = element.tagName.toUpperCase();
      if (tagName === 'H2') {
        if (currentContent.length > 0) {
          results.push({
            heading: currentHeading,
            content: currentContent.join('\n').trim(),
          });
        }
        currentHeading = element.textContent?.trim() || '(no section heading)';
        currentContent = [];
      } else if (tagName === 'P') {
        const text = element.textContent?.trim();
        if (text) {
          currentContent.push(text);
        }
      }
    });
    if (currentContent.length > 0) {
      results.push({ heading: currentHeading, content: currentContent.join('\n').trim() });
    }
    return results;
  });
  await browser.close();
  return sections;
}