import { type ReactNode } from 'react';
import { isFeatureLocked, type FeatureAccess } from '../logic/featureGating';

interface PremiumLockProps {
  feature: keyof FeatureAccess;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PremiumLock({ feature, children, fallback }: PremiumLockProps) {
  if (!isFeatureLocked(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative select-none">
      <div className="pointer-events-none opacity-25 blur-[3px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl border border-brand-200 bg-white/95 px-6 py-5 text-center shadow-lg backdrop-blur-sm max-w-xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
            <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-900">Compass Pro</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Unlock deeper analysis, 30-day roadmaps, and premium tools.
          </p>
          <button
            className="mt-3 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.97]"
            onClick={() => {}}
          >
            Unlock (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
