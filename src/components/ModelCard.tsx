import { useState } from 'react';
import { ScoredResult } from '../types';

interface ModelCardProps {
  result: ScoredResult;
  rank: number;
  onCompare?: (id: string) => void;
  isComparing?: boolean;
}

const confidenceColor = {
  Low: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-emerald-100 text-emerald-700',
};

const breakdownLabels: Record<string, string> = {
  timeFit: 'Time Fit',
  budgetFit: 'Budget Fit',
  timelineRealism: 'Timeline',
  preferenceAlignment: 'Preferences',
  distributionMatch: 'Distribution',
  salesMarketingFit: 'Sales/Marketing',
  skillAssetMatch: 'Skills/Assets',
};

export function ModelCard({ result, rank, onCompare, isComparing }: ModelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const { model, score, fitBreakdown, explanation, confidence, topReasons, topMismatches } = result;

  return (
    <div className={`rounded-2xl border-2 bg-white shadow-sm transition-all ${
      rank === 1 ? 'border-brand-300 shadow-brand-100/50' : 'border-slate-200'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                rank === 1 ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {rank}
              </span>
              <h3 className="text-base font-bold text-slate-900 truncate">{model.title}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{model.description}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="text-2xl font-bold text-slate-900">{score}</div>
            <span className={`mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${confidenceColor[confidence]}`}>
              {confidence}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-500">Hours/week</p>
            <p className="text-sm font-semibold text-slate-800">{model.typicalHours.min}–{model.typicalHours.max}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">First $</p>
            <p className="text-sm font-semibold text-slate-800">{model.timeToFirstDollar.minWeeks}–{model.timeToFirstDollar.maxWeeks}w</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Complexity</p>
            <p className="text-sm font-semibold text-slate-800">{'●'.repeat(model.complexity)}{'○'.repeat(5 - model.complexity)}</p>
          </div>
        </div>

        {topReasons.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-emerald-700 mb-1.5">Why it fits:</p>
            <ul className="space-y-1">
              {topReasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <svg className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {topMismatches.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-red-700 mb-1.5">Watch out:</p>
            <ul className="space-y-1">
              {topMismatches.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <svg className="mt-0.5 h-3 w-3 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full tap-target flex items-center justify-center gap-1 rounded-lg bg-slate-50 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          {expanded ? 'Hide breakdown' : 'Show fit breakdown'}
          <svg className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="m19 9-7 7-7-7" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          {Object.entries(fitBreakdown).map(([key, val]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">{breakdownLabels[key] || key}</span>
                <span className="font-medium text-slate-800">{Math.round(val)}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 italic leading-relaxed pt-1">{explanation}</p>
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3">
        <button
          onClick={() => setShowPlan(!showPlan)}
          className="w-full tap-target flex items-center justify-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
        >
          {showPlan ? 'Hide' : 'Show'} First 7 Days Plan
        </button>
      </div>

      {showPlan && (
        <div className="border-t border-slate-100 px-5 py-4">
          <ol className="space-y-2">
            {model.first7DaysPlan.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-600">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3">
        <button
          onClick={() => onCompare?.(model.id)}
          className={`w-full tap-target rounded-lg py-2 text-xs font-medium transition-all active:scale-[0.98] ${
            isComparing
              ? 'bg-brand-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isComparing ? 'Selected for comparison' : 'Compare'}
        </button>
      </div>
    </div>
  );
}
