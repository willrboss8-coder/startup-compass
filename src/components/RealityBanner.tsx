import { RealityWarning } from '../types';

interface RealityBannerProps {
  warnings: RealityWarning[];
  onViewDetails?: () => void;
}

const severityStyles = {
  blocker: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    text: 'text-red-800',
  },
  warn: {
    bg: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    text: 'text-amber-800',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    text: 'text-blue-800',
  },
};

export function RealityBanner({ warnings, onViewDetails }: RealityBannerProps) {
  const blockers = warnings.filter((w) => w.severity === 'blocker');
  const warns = warnings.filter((w) => w.severity === 'warn');

  const topWarning = blockers[0] || warns[0];
  if (!topWarning) return null;

  const style = severityStyles[topWarning.severity];

  return (
    <div className={`rounded-xl border ${style.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${style.icon}`}>
          {topWarning.severity === 'blocker' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.text}`}>{topWarning.title}</p>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{topWarning.triggeredBecause}</p>
          {warnings.length > 1 && (
            <p className="mt-2 text-xs text-slate-500">
              +{warnings.length - 1} more {warnings.length - 1 === 1 ? 'concern' : 'concerns'}
            </p>
          )}
        </div>
      </div>
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-3 w-full tap-target rounded-lg bg-white/60 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-white"
        >
          View all reality checks
        </button>
      )}
    </div>
  );
}
