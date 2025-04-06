import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE as deleteHandler } from '@/app/api/delete-url/route';
import { pineconeIndex } from '@/lib/pinecone';
import { createNextRequest } from '../../setup/globals'



vi.mock('@/lib/pinecone', () => ({
  pineconeIndex: {
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

describe('DELETE /api/delete-url', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if userId or url is missing', async () => {
    const req = createNextRequest('http://localhost/api/delete-url', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });

    const res = await deleteHandler(req);
    expect(res.status).toBe(400);
  });

  it.skip('returns 200 on successful delete', async () => {
    vi.mocked(pineconeIndex.deleteMany).mockResolvedValueOnce(undefined);

    const req = createNextRequest('http://localhost/api/delete-url', {
      method: 'DELETE',
      body: JSON.stringify({ userId: 'abc', url: 'url' }),
    });

    const res = await deleteHandler(req);
    expect(res.status).toBe(200);
  });
});
