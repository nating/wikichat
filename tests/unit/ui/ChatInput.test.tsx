import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/ChatInput';
import React from 'react';

describe('ChatInput', () => {
  it('calls handleSubmit on form submission', () => {
    const handleInputChange = vi.fn();
    const handleSubmit = vi.fn((e) => e.preventDefault());

    const { getByPlaceholderText, getByTestId } = render(
      <ChatInput
        input="Hello"
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    );

    const input = getByPlaceholderText('Ask a question about the article...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test' } });

    const form = getByTestId('chat-form')
    fireEvent.submit(form);

    expect(handleInputChange).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalled();
  });
});
