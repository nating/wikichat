import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ChatBox } from '@/components/ChatBox';
import { UIMessage } from 'ai';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: () => {},
  });
});

describe('ChatBox', () => {
  it('renders user and assistant messages correctly', () => {
    const messages: UIMessage[] = [
      { id: 'msg-1', role: 'user', createdAt: new Date(), parts: [{ type: 'text', text: 'Hello!' }], content: 'Hello!' },
      { id: 'msg-2', role: 'assistant', createdAt: new Date(), parts: [{ type: 'text', text: 'Hi there!' }], content: 'Hi there!'},
    ];

    const { getByText } = render(<ChatBox messages={messages} />);
    expect(getByText('Hello!')).toBeInTheDocument();
    expect(getByText('Hi there!')).toBeInTheDocument();
  });
});
