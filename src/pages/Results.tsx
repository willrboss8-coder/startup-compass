import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnswerState, ScoredResult, FitBreakdown } from '../types';
import { businessModels } from '../data/businessModels';
import { scoreModels } from '../logic/scoring';
import { evaluateReality, impliedHourlyRate } from '../logic/realityChecks';
import { simulateOutcome } from '../logic/simulation';
import { loadState, saveResults, saveState } from '../logic/storage';
import { LayoutShell } from '../components/LayoutShell';
import { RealityPanel } from '../components/RealityPanel';
import { AdjustGoalsPanel } from '../components/AdjustGoalsPanel';
import { ComparisonMode } from '../components/ComparisonMode';
import { ExportPanel } from '../components/ExportPanel';
import { EmailCapture } from '../components/EmailCapture';
import { ShareResults } from '../components/ShareResults';
import { Disclaimer } from '../components/Disclaimer';
import { SavedIndicator } from '../components/SavedIndicator';

/* ── helpers ─────────────────────────────────────────── */

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: 'Excellent fit', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 65) return { text: 'Strong fit', color: 'text-brand-700 bg-brand-50 border-brand-200' };
  if (score >= 50) return { text: 'Moderate fit', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { text: 'Weak fit', color: 'text-slate-600 bg-slate-50 border-slate-200' };
}

function displayScore(score: number): string {
  return score % 1 === 0 ? String(score) : score.toFixed(1);
}

function tieLabel(result: ScoredResult, all: ScoredResult[]): string | null {
  const tied = all.filter((r) => r.model.id !== result.model.id && r.score === result.score);
  if (tied.length > 0) return 'tie';
  return null;
}

function buildPlanSummary(top: ScoredResult, all: ScoredResult[]): string {
  const parts = [
    `#1 ${top.model.title} (${displayScore(top.score)}/100, ${top.confidence} confidence)`,
  ];
  if (all.length > 1) {
    parts.push(`#2 ${all[1].model.title} (${displayScore(all[1].score)}/100)`);
  }
  if (top.topReasons.length > 0) {
    parts.push(`Why: ${top.topReasons[0]}`);
  }
  return parts.join(' | ');
}

const BREAKDOWN_LABELS: Record<string, string> = {
  timeFit: 'Time Fit',
  budgetFit: 'Budget Fit',
  timelineRealism: 'Timeline',
  preferenceAlignment: 'Preferences',
  distributionMatch: 'Distribution',
  salesMarketingFit: 'Sales/Marketing',
  skillAssetMatch: 'Skills/Assets',
};

/* ── main component ──────────────────────────────────── */

export function Results() {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [checkedDays, setCheckedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const state = loadState();
    setAnswers(state.answers);
  }, []);

  const warnings = useMemo(() => evaluateReality(answers), [answers]);
  const results = useMemo(() => scoreModels(answers, businessModels, warnings), [answers, warnings]);

  useEffect(() => {
    if (results.length > 0) saveResults(results, warnings);
  }, [results, warnings]);

  const handleGoalChange = useCallback((key: string, value: unknown) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      const state = loadState();
      saveState({ ...state, answers: next });
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const comparisonResults = useMemo(() => {
    return compareIds
      .map((id) => results.find((r) => r.model.id === id))
      .filter(Boolean) as ScoredResult[];
  }, [compareIds, results]);

  const handleImport = useCallback(() => {
    const state = loadState();
    setAnswers(state.answers);
  }, []);

  const toggleDay = useCallback((i: number) => {
    setCheckedDays((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const hasBlockers = warnings.some((w) => w.severity === 'blocker');
  const hasWarnings = warnings.some((w) => w.severity === 'warn');
  const topResult = results[0];
  const alternatives = results.slice(1, 3);

  /* ── empty state ─── */
  if (Object.keys(answers).length === 0) {
    return (
      <LayoutShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-slate-900">No results yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Complete the quiz to see your personalized recommendations.
          </p>
          <Link
            to="/quiz"
            className="tap-target mt-4 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-700 active:scale-[0.97]"
          >
            Take the Quiz
          </Link>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="space-y-6 pb-10">

        {/* ─── A) Header ─── */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-slate-900">Your Results</h1>
            <SavedIndicator />
          </div>
          {topResult && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Your best match is <span className="font-semibold text-slate-900">{topResult.model.title}</span>
              {' '}&mdash; a {scoreLabel(topResult.score).text.toLowerCase()} at{' '}
              <span className="font-semibold">{displayScore(topResult.score)}/100</span>
              {' '}({topResult.confidence} confidence).
              {hasBlockers && (
                <span className="text-red-600 font-medium"> Some of your goals may not be realistic &mdash; see reality checks below.</span>
              )}
              {!hasBlockers && hasWarnings && (
                <span className="text-amber-600"> A few constraints are tight &mdash; review the warnings below.</span>
              )}
            </p>
          )}
        </div>

        {/* ─── B) Best Match ─── */}
        {topResult && (
          <section className="rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-brand-50/80 to-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Best match
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scoreLabel(topResult.score).color}`}>
                {scoreLabel(topResult.score).text}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">{topResult.model.title}</h2>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{topResult.model.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-3xl font-extrabold text-slate-900 leading-none">
                  {displayScore(topResult.score)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  /100{tieLabel(topResult, results) && <span className="ml-1 text-amber-600">(tie)</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/70 border border-slate-100 py-2">
                <p className="text-[10px] text-slate-500">Hours/week</p>
                <p className="text-sm font-bold text-slate-800">{topResult.model.typicalHours.min}&ndash;{topResult.model.typicalHours.max}</p>
              </div>
              <div className="rounded-lg bg-white/70 border border-slate-100 py-2">
                <p className="text-[10px] text-slate-500">First revenue</p>
                <p className="text-sm font-bold text-slate-800">{topResult.model.timeToFirstDollar.minWeeks}&ndash;{topResult.model.timeToFirstDollar.maxWeeks}w</p>
              </div>
              <div className="rounded-lg bg-white/70 border border-slate-100 py-2">
                <p className="text-[10px] text-slate-500">Complexity</p>
                <p className="text-sm font-bold text-slate-800">{'●'.repeat(topResult.model.complexity)}{'○'.repeat(5 - topResult.model.complexity)}</p>
              </div>
            </div>

            {topResult.topReasons.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">Why it fits</p>
                <ul className="space-y-1">
                  {topResult.topReasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topResult.topMismatches.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1.5">Watch out</p>
                <ul className="space-y-1">
                  {topResult.topMismatches.slice(0, 2).map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                      </svg>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ─── C) Your First 7 Days ─── */}
        {topResult && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Your First 7 Days</h3>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                {topResult.model.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Check off each step as you go. This is your launch checklist.
            </p>
            <ol className="space-y-2.5">
              {topResult.model.first7DaysPlan.map((step, i) => {
                const done = checkedDays.has(i);
                return (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDay(i)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                        done
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white hover:border-brand-400'
                      }`}
                      aria-label={`Mark day ${i + 1} ${done ? 'incomplete' : 'complete'}`}
                    >
                      {done && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm leading-relaxed ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-600">{checkedDays.size}/{topResult.model.first7DaysPlan.length}</span>
              completed
              {checkedDays.size === topResult.model.first7DaysPlan.length && (
                <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Week 1 done!
                </span>
              )}
            </div>
          </section>
        )}

        {/* ─── D) Alternatives ─── */}
        {alternatives.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Also worth considering</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {alternatives.map((alt, i) => (
                <div key={alt.model.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                          {i + 2}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{alt.model.title}</h4>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-bold text-slate-900">{displayScore(alt.score)}</span>
                      {tieLabel(alt, results) && (
                        <span className="ml-0.5 text-[10px] text-amber-600">(tie)</span>
                      )}
                      <div className={`mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${scoreLabel(alt.score).color}`}>
                        {scoreLabel(alt.score).text}
                      </div>
                    </div>
                  </div>

                  {alt.topReasons[0] && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-1">
                      <span className="font-semibold text-emerald-700">Best for:</span> {alt.topReasons[0]}
                    </p>
                  )}
                  {alt.topMismatches[0] && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <span className="font-semibold text-amber-700">Tradeoff:</span> {alt.topMismatches[0]}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => toggleCompare(alt.model.id)}
                      className={`flex-1 tap-target rounded-lg py-1.5 text-[10px] font-medium transition-all active:scale-[0.98] ${
                        compareIds.includes(alt.model.id)
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {compareIds.includes(alt.model.id) ? 'Comparing' : 'Compare'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── E) Explain the Match (collapsed) ─── */}
        {topResult && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full tap-target flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">Explain the match</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  7-dimension scoring breakdown for {topResult.model.title}
                </p>
              </div>
              <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="m19 9-7 7-7-7" />
              </svg>
            </button>

            {showBreakdown && (
              <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                {(Object.entries(topResult.fitBreakdown) as [keyof FitBreakdown, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, val]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{BREAKDOWN_LABELS[key] || key}</span>
                      <span className="font-semibold text-slate-800">{Math.round(val)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-500 italic leading-relaxed pt-2">{topResult.explanation}</p>
              </div>
            )}
          </section>
        )}

        {/* ─── F) Compass Pro ─── */}
        <section className="rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compass Pro</h3>
              <p className="text-[10px] text-slate-500">Go deeper. Move faster.</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5">
            {[
              { label: '30-day execution roadmap', desc: 'Week-by-week plan personalized to your top model' },
              { label: 'Deeper scoring breakdown', desc: '7-dimension analysis with strength/weakness labels' },
              { label: 'Advanced comparisons + scenario sliders', desc: 'Side-by-side models with adjustable goal parameters' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <svg className="h-3 w-3 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <button
            className="mt-5 w-full tap-target rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-700 active:scale-[0.97]"
            onClick={() => {}}
          >
            Join the Pro waitlist
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Coming soon &mdash; no payment required today.
          </p>
        </section>

        {/* ─── Email capture ─── */}
        {topResult && (
          <EmailCapture
            source="results"
            topModelId={topResult.model.id}
            topModelTitle={topResult.model.title}
            confidenceLabel={scoreLabel(topResult.score).text}
            planSummary={buildPlanSummary(topResult, results)}
          />
        )}

        {/* ─── Share ─── */}
        <ShareResults results={results} />

        {/* ─── Comparison ─── */}
        {comparisonResults.length === 2 && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Side-by-side comparison</h3>
            <ComparisonMode results={comparisonResults} />
          </section>
        )}

        {/* ─── Reality checks ─── */}
        <RealityPanel warnings={warnings} />

        {/* ─── Adjust goals ─── */}
        <AdjustGoalsPanel answers={answers} onChange={handleGoalChange} />

        {/* ─── Export / import ─── */}
        <ExportPanel
          results={results}
          warnings={warnings}
          answers={answers}
          onImport={handleImport}
        />

        <div className="pt-4">
          <Disclaimer variant="compact" />
        </div>
      </div>
    </LayoutShell>
  );
}
