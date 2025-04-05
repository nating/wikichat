'use client';

import { useTheme } from '@/lib/hooks/useTheme';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="fixed top-4 right-4 z-50 text-2xl p-2 bg-background border border-gray-300 dark:border-gray-700 rounded-full shadow hover:scale-105 transition"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
