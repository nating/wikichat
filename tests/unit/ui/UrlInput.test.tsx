import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { UrlInput } from '@/components/UrlInput';

describe('UrlInput', () => {
  it('displays warning and calls onSubmit', () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();

    const { getByPlaceholderText, getByText } = render(
      <UrlInput
        wikiUrl="https://en.wikipedia.org/wiki/Wola"
        warning="Some warning"
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={false}
        scraping={false}
        alreadyScraped={false}
      />
    );

    const input = getByPlaceholderText('Wikipedia article URL...');
    fireEvent.change(input, { target: { value: 'test-url' } });
    fireEvent.click(getByText('Scrape'));

    expect(onChange).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
    expect(getByText('Some warning')).toBeInTheDocument();
  });
});
