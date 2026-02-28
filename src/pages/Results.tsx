import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnswerState, ScoredResult, FitBreakdown } from '../types';
import { businessModels } from '../data/businessModels';
import { scoreModels } from '../logic/scoring';
import { evaluateReality } from '../logic/realityChecks';
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

/* ── constants ───────────────────────────────────────── */

const STEP_KEY = 'startup-compass-results-step';
const CHECKLIST_KEY = 'startup-compass-checklist';

const BREAKDOWN_LABELS: Record<string, string> = {
  timeFit: 'Time Fit',
  budgetFit: 'Budget Fit',
  timelineRealism: 'Timeline',
  preferenceAlignment: 'Preferences',
  distributionMatch: 'Distribution',
  salesMarketingFit: 'Sales/Marketing',
  skillAssetMatch: 'Skills/Assets',
};

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

function isTied(result: ScoredResult, all: ScoredResult[]): boolean {
  return all.some((r) => r.model.id !== result.model.id && r.score === result.score);
}

function buildPlanSummary(top: ScoredResult, all: ScoredResult[]): string {
  const parts = [`#1 ${top.model.title} (${displayScore(top.score)}/100, ${top.confidence} confidence)`];
  if (all.length > 1) parts.push(`#2 ${all[1].model.title} (${displayScore(all[1].score)}/100)`);
  if (top.topReasons.length > 0) parts.push(`Why: ${top.topReasons[0]}`);
  return parts.join(' | ');
}

function buildIntrigueBullets(result: ScoredResult, answers: AnswerState) {
  const { model, fitBreakdown } = result;
  const hours = Number(answers.hours_per_week) || 10;

  const fastest = model.distributionChannels[0]
    ? `Start with ${model.distributionChannels[0]} — it's the fastest channel for this model`
    : `Launch your first offer within ${model.timeToFirstDollar.minWeeks} weeks`;

  const avoid = model.antiPatterns[0] || 'Overplanning before getting your first customer';

  const dims = Object.entries(fitBreakdown) as [keyof FitBreakdown, number][];
  const weakest = [...dims].sort((a, b) => a[1] - b[1])[0];
  const weekOne = weakest[1] < 50
    ? `Shore up your ${BREAKDOWN_LABELS[weakest[0]].toLowerCase()} — it's your weakest dimension`
    : hours >= model.typicalHours.min
      ? `Commit ${model.typicalHours.min}+ hours this week and follow the plan`
      : `Find at least ${model.typicalHours.min} hours this week to dedicate`;

  return { fastest, avoid, weekOne };
}

function loadCheckedDays(modelId: string): Set<number> {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const arr = parsed[modelId];
    return Array.isArray(arr) ? new Set(arr as number[]) : new Set();
  } catch { return new Set(); }
}

function saveCheckedDays(modelId: string, days: Set<number>) {
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[modelId] = [...days];
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(parsed));
  } catch { /* silently fail */ }
}

function loadStep(): 'summary' | 'plan' {
  try {
    const v = localStorage.getItem(STEP_KEY);
    return v === 'plan' ? 'plan' : 'summary';
  } catch { return 'summary'; }
}

function persistStep(step: 'summary' | 'plan') {
  try { localStorage.setItem(STEP_KEY, step); } catch { /* */ }
}

function checkMicrocopy(count: number, total: number): string | null {
  if (count === 0) return null;
  if (count >= total) return "Week 1 done. Don\u2019t break the streak.";
  if (count >= 4) return "You\u2019re ahead of most people.";
  return 'Momentum started.';
}

/* ── Compass Pro bullets ─────────────────────────────── */

const PRO_FEATURES = [
  { label: '30-day execution roadmap', desc: 'Week-by-week plan personalized to your top model' },
  { label: 'Deeper scoring breakdown', desc: '7-dimension analysis with strength/weakness labels' },
  { label: 'Advanced comparisons + scenario sliders', desc: 'Side-by-side models with adjustable goal parameters' },
];

/* ── main component ──────────────────────────────────── */

export function Results() {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [step, setStep] = useState<'summary' | 'plan'>(loadStep);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [checkedDays, setCheckedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const state = loadState();
    setAnswers(state.answers);
  }, []);

  const warnings = useMemo(() => evaluateReality(answers), [answers]);
  const results = useMemo(() => scoreModels(answers, businessModels, warnings), [answers, warnings]);

  const topResult = results[0];

  useEffect(() => {
    if (topResult) setCheckedDays(loadCheckedDays(topResult.model.id));
  }, [topResult]);

  useEffect(() => {
    if (results.length > 0) saveResults(results, warnings);
  }, [results, warnings]);

  const goToPlan = useCallback(() => {
    setStep('plan');
    persistStep('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToSummary = useCallback(() => {
    setStep('summary');
    persistStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleDay = useCallback((i: number) => {
    setCheckedDays((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      if (topResult) saveCheckedDays(topResult.model.id, next);
      return next;
    });
  }, [topResult]);

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
    return compareIds.map((id) => results.find((r) => r.model.id === id)).filter(Boolean) as ScoredResult[];
  }, [compareIds, results]);

  const handleImport = useCallback(() => {
    const state = loadState();
    setAnswers(state.answers);
  }, []);

  const hasBlockers = warnings.some((w) => w.severity === 'blocker');
  const hasWarnings = warnings.some((w) => w.severity === 'warn');
  const worthConsidering = results.slice(1, 3);
  const moreOptions = results.slice(3, 5);

  /* ── empty state ─── */
  if (Object.keys(answers).length === 0) {
    return (
      <LayoutShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-slate-900">No results yet</h2>
          <p className="mt-2 text-sm text-slate-600">Complete the quiz to see your personalized recommendations.</p>
          <Link to="/quiz" className="tap-target mt-4 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-700 active:scale-[0.97]">
            Take the Quiz
          </Link>
        </div>
      </LayoutShell>
    );
  }

  /* ════════════════════════════════════════════════════ */
  /*  STEP 1: SUMMARY (Diagnosis)                       */
  /* ════════════════════════════════════════════════════ */
  if (step === 'summary' && topResult) {
    const intrigue = buildIntrigueBullets(topResult, answers);
    return (
      <LayoutShell>
        <div className="space-y-6 pb-28">

          {/* A) Header */}
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-slate-900">Your Best Path Forward</h1>
              <SavedIndicator />
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Based on your answers, <span className="font-semibold text-slate-900">{topResult.model.title}</span> is
              your strongest path to building real income.
            </p>
            <p className="mt-1 text-xs text-slate-500 italic">
              The edge now is consistency &mdash; not finding a perfect idea.
            </p>
            {hasBlockers && (
              <p className="mt-2 text-xs font-medium text-red-600">
                Some goals may not be realistic yet &mdash; see the reality checks on the next step.
              </p>
            )}
            {!hasBlockers && hasWarnings && (
              <p className="mt-2 text-xs text-amber-600">
                A few constraints are tight &mdash; review the warnings on the next step.
              </p>
            )}
          </div>

          {/* B) Best Match */}
          <section className="rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-brand-50/80 to-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Best match</span>
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
                <div className="text-3xl font-extrabold text-slate-900 leading-none">{displayScore(topResult.score)}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  /100{isTied(topResult, results) && <span className="ml-1 text-amber-600">(tie)</span>}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="Hours/week" value={`${topResult.model.typicalHours.min}\u2013${topResult.model.typicalHours.max}`} />
              <Stat label="First revenue" value={`${topResult.model.timeToFirstDollar.minWeeks}\u2013${topResult.model.timeToFirstDollar.maxWeeks}w`} />
              <Stat label="Complexity" value={'\u25CF'.repeat(topResult.model.complexity) + '\u25CB'.repeat(5 - topResult.model.complexity)} />
            </div>
            {topResult.topReasons.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">Why this fits you</p>
                <BulletList items={topResult.topReasons.slice(0, 3)} color="emerald" />
              </div>
            )}
            {topResult.topMismatches.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1.5">Main tradeoffs</p>
                <MismatchList items={topResult.topMismatches.slice(0, 2)} />
              </div>
            )}
            {isTied(topResult, results) && (
              <p className="mt-3 text-[10px] text-amber-600 italic leading-relaxed">
                Some options are closely matched. Choose the one you&rsquo;ll execute consistently.
              </p>
            )}
          </section>

          {/* C) Intrigue panel */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">What will make this work for you</h3>
            <div className="space-y-3">
              <IntrigueBullet emoji="⚡" label="Your fastest route to a first win" text={intrigue.fastest} />
              <IntrigueBullet emoji="🚫" label="The biggest thing to avoid" text={intrigue.avoid} />
              <IntrigueBullet emoji="🎯" label="What matters most in week 1" text={intrigue.weekOne} />
            </div>
          </section>

          {/* E) Compass Pro teaser */}
          <section className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ProIcon size="sm" />
              <div>
                <span className="text-sm font-bold text-slate-900">Compass Pro</span>
                <span className="ml-2 text-[10px] text-slate-500">Coming soon</span>
              </div>
            </div>
            <ul className="space-y-1 mb-3">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-brand-400 shrink-0" />
                  {f.label}
                </li>
              ))}
            </ul>
            <button className="w-full tap-target rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.97]" onClick={() => {}}>
              Join the Pro waitlist
            </button>
          </section>

          <Disclaimer variant="compact" />
        </div>

        {/* D) Sticky CTA */}
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-3 safe-bottom">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-[10px] text-slate-500 mb-2">
              Most people never reach this step. You will if you stay consistent.
            </p>
            <button
              onClick={goToPlan}
              className="w-full tap-target rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700 active:scale-[0.97]"
            >
              Show my free 7-day plan
            </button>
          </div>
        </div>
      </LayoutShell>
    );
  }

  /* ════════════════════════════════════════════════════ */
  /*  STEP 2: PLAN (Prescription)                       */
  /* ════════════════════════════════════════════════════ */
  const micro = topResult ? checkMicrocopy(checkedDays.size, topResult.model.first7DaysPlan.length) : null;

  return (
    <LayoutShell>
      <div className="space-y-6 pb-10">

        {/* A) Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-slate-900">Your 7-Day Plan</h1>
            <SavedIndicator />
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Finish this week and you&rsquo;ll have real momentum.
          </p>
          <button onClick={goToSummary} className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-800 transition-colors">
            &larr; Back to summary
          </button>
        </div>

        {/* B) 7-day checklist */}
        {topResult && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Your First 7 Days</h3>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                {topResult.model.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Check off each step as you go.</p>
            <ol className="space-y-2.5">
              {topResult.model.first7DaysPlan.map((step, i) => {
                const done = checkedDays.has(i);
                return (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDay(i)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                        done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white hover:border-brand-400'
                      }`}
                      aria-label={`Mark day ${i + 1} ${done ? 'incomplete' : 'complete'}`}
                    >
                      {done && <CheckSvg />}
                    </button>
                    <span className={`text-sm leading-relaxed ${done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{step}</span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-semibold text-slate-600">{checkedDays.size}/{topResult.model.first7DaysPlan.length}</span>
                completed
              </div>
              {micro && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  checkedDays.size >= topResult.model.first7DaysPlan.length
                    ? 'bg-emerald-50 text-emerald-700'
                    : checkedDays.size >= 4
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {micro}
                </span>
              )}
            </div>
          </section>
        )}

        {/* C) Worth Considering */}
        {worthConsidering.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Worth considering</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {worthConsidering.map((alt, i) => (
                <AltCard key={alt.model.id} result={alt} rank={i + 2} allResults={results} onCompare={toggleCompare} isComparing={compareIds.includes(alt.model.id)} />
              ))}
            </div>
          </section>
        )}

        {/* D) See more options */}
        {moreOptions.length > 0 && !showMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowMore(true)}
              className="tap-target rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.97]"
            >
              See more options ({moreOptions.length})
            </button>
          </div>
        )}
        {showMore && moreOptions.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Alternative paths</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {moreOptions.map((alt, i) => (
                <AltCard key={alt.model.id} result={alt} rank={i + 4} allResults={results} onCompare={toggleCompare} isComparing={compareIds.includes(alt.model.id)} />
              ))}
            </div>
          </section>
        )}

        {/* E) Explain the match (collapsed) */}
        {topResult && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full tap-target flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">Explain the match</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">7-dimension scoring breakdown for {topResult.model.title}</p>
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
                      <div className={`h-full rounded-full transition-all ${val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-500 italic leading-relaxed pt-2">{topResult.explanation}</p>
              </div>
            )}
          </section>
        )}

        {/* F) Compass Pro (full) */}
        <section className="rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ProIcon size="md" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Compass Pro</h3>
              <p className="text-[10px] text-slate-500">Go deeper. Move faster.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {PRO_FEATURES.map((item, i) => (
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
          <button className="mt-5 w-full tap-target rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-700 active:scale-[0.97]" onClick={() => {}}>
            Join the Pro waitlist
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400">Coming soon &mdash; no payment required today.</p>
        </section>

        {/* G) Email capture */}
        {topResult && (
          <EmailCapture
            source="results"
            topModelId={topResult.model.id}
            topModelTitle={topResult.model.title}
            confidenceLabel={scoreLabel(topResult.score).text}
            planSummary={buildPlanSummary(topResult, results)}
          />
        )}

        <ShareResults results={results} />

        {comparisonResults.length === 2 && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Side-by-side comparison</h3>
            <ComparisonMode results={comparisonResults} />
          </section>
        )}

        <RealityPanel warnings={warnings} />
        <AdjustGoalsPanel answers={answers} onChange={handleGoalChange} />
        <ExportPanel results={results} warnings={warnings} answers={answers} onImport={handleImport} />

        <div className="pt-4"><Disclaimer variant="compact" /></div>
      </div>
    </LayoutShell>
  );
}

/* ── sub-components ──────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 border border-slate-100 py-2">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color: 'emerald' | 'brand' }) {
  const cls = color === 'emerald' ? 'text-emerald-500' : 'text-brand-500';
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
          <svg className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${cls}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

function MismatchList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

function IntrigueBullet({ emoji, label, text }: { emoji: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-base shrink-0" aria-hidden>{emoji}</span>
      <div>
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function CheckSvg() {
  return <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M4.5 12.75l6 6 9-13.5" /></svg>;
}

function ProIcon({ size }: { size: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-8 w-8 rounded-lg' : 'h-6 w-6 rounded-md';
  const svg = size === 'md' ? 'h-4 w-4' : 'h-3 w-3';
  return (
    <div className={`flex items-center justify-center bg-brand-600 shadow-sm ${cls}`}>
      <svg className={`text-white ${svg}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    </div>
  );
}

function AltCard({ result, rank, allResults, onCompare, isComparing }: {
  result: ScoredResult; rank: number; allResults: ScoredResult[];
  onCompare: (id: string) => void; isComparing: boolean;
}) {
  const tied = isTied(result, allResults);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">{rank}</span>
            <h4 className="text-sm font-bold text-slate-900 truncate">{result.model.title}</h4>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-lg font-bold text-slate-900">{displayScore(result.score)}</span>
          {tied && <span className="ml-0.5 text-[10px] text-amber-600">(tie)</span>}
          <div className={`mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${scoreLabel(result.score).color}`}>
            {scoreLabel(result.score).text}
          </div>
        </div>
      </div>
      {result.topReasons[0] && (
        <p className="text-xs text-slate-600 leading-relaxed mb-1">
          <span className="font-semibold text-emerald-700">Best for:</span> {result.topReasons[0]}
        </p>
      )}
      {result.topMismatches[0] && (
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-amber-700">Tradeoff:</span> {result.topMismatches[0]}
        </p>
      )}
      <div className="mt-3">
        <button
          onClick={() => onCompare(result.model.id)}
          className={`w-full tap-target rounded-lg py-1.5 text-[10px] font-medium transition-all active:scale-[0.98] ${
            isComparing ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isComparing ? 'Comparing' : 'Compare'}
        </button>
      </div>
    </div>
  );
}
