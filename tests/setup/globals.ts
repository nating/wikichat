import { NextRequest } from 'next/server';

export function createNextRequest(url: string, options: object): NextRequest {
  return new NextRequest(url, options);
}
