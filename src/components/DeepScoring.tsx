import type { ScoredResult, FitBreakdown } from '../types';
import { PremiumLock } from './PremiumLock';

interface DeepScoringProps {
  result: ScoredResult;
}

const DIMENSION_INFO: Record<keyof FitBreakdown, { label: string; description: string }> = {
  timeFit: {
    label: 'Time Fit',
    description: 'How well this model fits your available weekly hours',
  },
  budgetFit: {
    label: 'Budget Fit',
    description: 'Whether your startup budget covers typical launch costs',
  },
  timelineRealism: {
    label: 'Timeline Realism',
    description: 'How realistic your income timeline expectations are for this model',
  },
  preferenceAlignment: {
    label: 'Preference Alignment',
    description: 'Match between your work style preferences and what this model demands',
  },
  distributionMatch: {
    label: 'Distribution Match',
    description: 'Whether you can reach customers through this model\u2019s primary channels',
  },
  salesMarketingFit: {
    label: 'Sales & Marketing Fit',
    description: 'How comfortable you\u2019d be with the outreach this model requires',
  },
  skillAssetMatch: {
    label: 'Skill & Asset Match',
    description: 'How well your existing skills and assets map to what this model needs',
  },
};

function barColor(val: number): string {
  if (val >= 75) return 'bg-emerald-500';
  if (val >= 50) return 'bg-amber-500';
  if (val >= 25) return 'bg-orange-500';
  return 'bg-red-400';
}

function strengthLabel(val: number): { text: string; color: string } {
  if (val >= 75) return { text: 'Strong', color: 'text-emerald-700' };
  if (val >= 50) return { text: 'Fair', color: 'text-amber-700' };
  if (val >= 25) return { text: 'Weak', color: 'text-orange-700' };
  return { text: 'Gap', color: 'text-red-700' };
}

export function DeepScoring({ result }: DeepScoringProps) {
  const { fitBreakdown, model } = result;
  const entries = Object.entries(fitBreakdown) as [keyof FitBreakdown, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <PremiumLock feature="deepScoring">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deeper Scoring Breakdown</h3>
            <p className="text-[10px] text-slate-500">7-dimension analysis for {model.title}</p>
          </div>
        </div>

        <div className="space-y-3">
          {sorted.map(([key, val]) => {
            const info = DIMENSION_INFO[key];
            const label = strengthLabel(val);
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{info.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold ${label.color}`}>{label.text}</span>
                    <span className="font-semibold text-slate-800 w-7 text-right">{Math.round(val)}</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(val)}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400 leading-relaxed">{info.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Strongest dimension</p>
            <p className="text-xs font-bold text-emerald-900">{DIMENSION_INFO[strongest[0]].label}</p>
            <p className="text-xs text-emerald-700">{Math.round(strongest[1])}/100</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Needs attention</p>
            <p className="text-xs font-bold text-amber-900">{DIMENSION_INFO[weakest[0]].label}</p>
            <p className="text-xs text-amber-700">{Math.round(weakest[1])}/100</p>
          </div>
        </div>
      </div>
    </PremiumLock>
  );
}
