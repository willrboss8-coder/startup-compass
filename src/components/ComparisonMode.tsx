import { ScoredResult } from '../types';

interface ComparisonModeProps {
  results: ScoredResult[];
}

const breakdownLabels: Record<string, string> = {
  timeFit: 'Time Fit',
  budgetFit: 'Budget Fit',
  timelineRealism: 'Timeline',
  preferenceAlignment: 'Preferences',
  distributionMatch: 'Distribution',
  salesMarketingFit: 'Sales/Marketing',
  skillAssetMatch: 'Skills/Assets',
};

export function ComparisonMode({ results }: ComparisonModeProps) {
  if (results.length < 2) return null;
  const [a, b] = results;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div className="p-4 text-center">
          <h4 className="text-sm font-bold text-slate-900 truncate">{a.model.title}</h4>
          <p className="text-2xl font-bold text-brand-600 mt-1">{a.score}</p>
        </div>
        <div className="p-4 text-center">
          <h4 className="text-sm font-bold text-slate-900 truncate">{b.model.title}</h4>
          <p className="text-2xl font-bold text-brand-600 mt-1">{b.score}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 space-y-3">
        {Object.keys(a.fitBreakdown).map((key) => {
          const aVal = a.fitBreakdown[key as keyof typeof a.fitBreakdown];
          const bVal = b.fitBreakdown[key as keyof typeof b.fitBreakdown];
          return (
            <div key={key}>
              <p className="text-xs font-medium text-slate-600 mb-1 text-center">{breakdownLabels[key]}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${aVal >= 70 ? 'bg-emerald-500' : aVal >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${aVal}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-6 text-right">{Math.round(aVal)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 w-6">{Math.round(bVal)}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${bVal >= 70 ? 'bg-emerald-500' : bVal >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${bVal}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 grid grid-cols-2 divide-x divide-slate-200">
        <div className="p-4">
          <p className="text-xs text-slate-500 mb-1">Time to first $</p>
          <p className="text-sm font-semibold text-slate-800">
            {a.model.timeToFirstDollar.minWeeks}–{a.model.timeToFirstDollar.maxWeeks} weeks
          </p>
          <p className="text-xs text-slate-500 mt-2 mb-1">Complexity</p>
          <p className="text-sm font-semibold text-slate-800">
            {'●'.repeat(a.model.complexity)}{'○'.repeat(5 - a.model.complexity)}
          </p>
          <p className="text-xs text-slate-500 mt-2 mb-1">Scalability</p>
          <p className="text-sm font-semibold text-slate-800 capitalize">{a.model.scalabilityType}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-slate-500 mb-1">Time to first $</p>
          <p className="text-sm font-semibold text-slate-800">
            {b.model.timeToFirstDollar.minWeeks}–{b.model.timeToFirstDollar.maxWeeks} weeks
          </p>
          <p className="text-xs text-slate-500 mt-2 mb-1">Complexity</p>
          <p className="text-sm font-semibold text-slate-800">
            {'●'.repeat(b.model.complexity)}{'○'.repeat(5 - b.model.complexity)}
          </p>
          <p className="text-xs text-slate-500 mt-2 mb-1">Scalability</p>
          <p className="text-sm font-semibold text-slate-800 capitalize">{b.model.scalabilityType}</p>
        </div>
      </div>
    </div>
  );
}
