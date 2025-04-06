import { embedSections } from '@/lib/embeddings';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  logger.info('[embed] Embed request received');

  try {
    const { userId, url, sections } = await req.json();

    if (!userId || !url || !Array.isArray(sections)) {
      logger.warn('[embed] Missing userId, url, or sections');
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    await embedSections(sections, userId, url);
    logger.info({ userId, url }, '[embed] Successfully embedded content');

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    logger.error({ err }, '[embed] Error during embedding');
    return new Response(JSON.stringify({ error: 'Failed to embed content.' }), { status: 500 });
  }
}
