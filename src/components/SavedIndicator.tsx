import { useState, useEffect } from 'react';
import { loadState } from '../logic/storage';

interface SavedIndicatorProps {
  trigger?: number;
}

export function SavedIndicator({ trigger }: SavedIndicatorProps) {
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const state = loadState();
      setSavedAt(state.lastSavedAt);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [trigger]);

  if (!savedAt) return null;

  const date = new Date(savedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  let timeAgo: string;
  if (diffMin < 1) timeAgo = 'just now';
  else if (diffMin < 60) timeAgo = `${diffMin}m ago`;
  else if (diffMin < 1440) timeAgo = `${Math.floor(diffMin / 60)}h ago`;
  else timeAgo = date.toLocaleDateString();

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200/60">
      <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <span>Saved {timeAgo}</span>
    </div>
  );
}
