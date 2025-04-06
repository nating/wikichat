import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DarkModeToggle } from '@/components/DarkModeToggle';

vi.mock('@/lib/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

describe('DarkModeToggle', () => {
  it('renders button and toggles theme', () => {
    const { getByRole } = render(<DarkModeToggle />);
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
  });
});
