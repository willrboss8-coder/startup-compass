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
      <div className="pointer-events-none opacity-30 blur-[2px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl border border-brand-200 bg-white/95 px-5 py-3 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-50">
            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-800">Compass Pro</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Available soon</p>
        </div>
      </div>
    </div>
  );
}
