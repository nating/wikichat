import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ScrapedList } from '@/components/ScrapedList';

describe('ScrapedList', () => {
  it('renders list and calls onDelete', () => {
    const onDelete = vi.fn();
    const urls = ['https://en.wikipedia.org/wiki/Wola'];

    const { getByText } = render(<ScrapedList urls={urls} onDelete={onDelete} />);

    fireEvent.click(getByText('Delete'));
    expect(getByText('Delete this article?')).toBeInTheDocument();
  });
});
