import { NextRequest } from 'next/server';
import { getRelevantChunks } from '@/lib/embeddings';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

const MODEL = process.env.MODEL || 'gpt-4o-mini';
const model = openai(MODEL);

/**
 * Chat endpoint that takes messages from the user's chat with the LLM. It returns a generated text stream response
 * using the Vercel AI SDK's streamText function.
 *
 * Before sending the user's latest message to the LLM, the function uses RAG to get the most relevant sections of
 * Wikipedia information that we have stored. The most relevant sections of the Wikipedia page are added to the system
 * prompt so that the LLM has additional context and can answer the user's query using the Wikipedia page's info.
 */
export async function POST(req: NextRequest) {
  const requestId = uuidv4();
  try {
    const { messages, userId } = await req.json();
    logger.info({ requestId, userId }, '[chat] Request received');

    if (!messages || !Array.isArray(messages)) {
      logger.warn({ requestId }, '[chat] No messages provided');
      return new Response(JSON.stringify({ error: 'No messages provided.' }), { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.content) {
      logger.warn({ requestId }, '[chat] Invalid user message');
      return new Response(JSON.stringify({ error: 'No valid user message found.' }), { status: 400 });
    }

    const query = lastMessage.content;
    const relevantChunks = await getRelevantChunks(query, userId, 3);
    logger.info({ requestId, matches: relevantChunks.length }, '[chat] Retrieved relevant chunks');

    const context = relevantChunks.map((c) => c.content).join('\n---\n');
    const system = [
      "You are a friendly, helpful and eager AI assistant. Please answer the user's queries using only the context of these sections from the Wikipedia page they submitted earlier:",
      context,
      "Use ONLY those sections as your context to answer. If unsure of the answer, just tell the user that."
    ].join("\n\n");

    const result = streamText({
      model,
      system,
      messages,
    });

    logger.info({ requestId }, '[chat] Streaming response');
    return result.toDataStreamResponse();
  } catch (err: any) {
    logger.error({ requestId, err }, '[chat] Failed to handle chat request');
    return new Response(JSON.stringify({ error: 'Failed to chat.' }), { status: 500 });
  }
}
