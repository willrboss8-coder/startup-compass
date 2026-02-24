import { useState, useEffect } from 'react';

interface SavedIndicatorProps {
  trigger: unknown;
}

export function SavedIndicator({ trigger }: SavedIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === undefined) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 right-4 z-50 animate-fade-in">
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Saved
      </div>
    </div>
  );
}
