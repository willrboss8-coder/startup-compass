import { RealityWarning } from '../types';

interface RealityPanelProps {
  warnings: RealityWarning[];
  onApplyFix?: (fix: string) => void;
}

const severityBadge = {
  blocker: 'bg-red-100 text-red-700 ring-red-200',
  warn: 'bg-amber-100 text-amber-700 ring-amber-200',
  info: 'bg-blue-100 text-blue-700 ring-blue-200',
};

export function RealityPanel({ warnings, onApplyFix }: RealityPanelProps) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-emerald-800">Your goals look realistic</p>
        <p className="mt-1 text-xs text-emerald-600">No major contradictions detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Reality Check</h3>
      {warnings.map((w) => (
        <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${severityBadge[w.severity]}`}>
              {w.severity === 'blocker' ? 'Blocker' : w.severity === 'warn' ? 'Warning' : 'Info'}
            </span>
            <h4 className="text-sm font-bold text-slate-900">{w.title}</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{w.triggeredBecause}</p>
          <p className="mt-2 text-xs text-slate-500 italic">{w.whyItMatters}</p>

          {w.whatWouldNeedToBeTrue.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">What would need to be true:</p>
              <ul className="space-y-1">
                {w.whatWouldNeedToBeTrue.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {w.waysToFix.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">Ways to adjust:</p>
              <div className="flex flex-wrap gap-1.5">
                {w.waysToFix.map((fix, i) => (
                  <button
                    key={i}
                    onClick={() => onApplyFix?.(fix)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                  >
                    {fix}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
