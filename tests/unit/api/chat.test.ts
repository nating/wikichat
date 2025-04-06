import { POST } from '@/app/api/chat/route';
import { getRelevantChunks } from '@/lib/embeddings';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

function createMockReadableStream(content: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(content));
      controller.close();
    }
  });
}

vi.mock('@/lib/embeddings', () => ({
  getRelevantChunks: vi.fn()
}));

vi.mock('ai', async () => {
  const actual = await vi.importActual('ai');
  return {
    ...actual,
    streamText: vi.fn()
  };
});

function createMockRequest(body: Record<string, any>) {
  return new NextRequest('https://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('POST /api/chat', () => {
  it.skip('returns streamed AI response based on relevant chunks', async () => {
    const mockChunks = [
      { content: 'First chunk', embedding: [0.1, 0.2] },
      { content: 'Second chunk', embedding: [0.3, 0.4] }
    ];
    const mockStream = createMockReadableStream('Hello from AI!');

    vi.mocked(getRelevantChunks).mockResolvedValue(mockChunks);
    vi.mocked(streamText).mockResolvedValue({
      toAIStreamResponse: () => new Response(mockStream)
    } as any);

    const req = createMockRequest({ messages: [{ role: 'user', content: 'Hi' }], userId: 'user123' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(getRelevantChunks).toHaveBeenCalledWith('Hi', 'user123', 3);

    const body = await res.text();
    expect(body).toContain('Hello from AI!');
  });

  it('returns 500 if something fails', async () => {
    vi.mocked(getRelevantChunks).mockRejectedValue(new Error('Mock failure'));

    const req = createMockRequest({ messages: [{ role: 'user', content: 'Hi' }], userId: 'user123' });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to chat.');
  });
});
