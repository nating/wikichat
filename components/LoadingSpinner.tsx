'use client';

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-t-2 border-l-2 border-white/60 animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
