import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnswerState, ScoredResult } from '../types';
import { businessModels } from '../data/businessModels';
import { scoreModels } from '../logic/scoring';
import { evaluateReality, impliedHourlyRate } from '../logic/realityChecks';
import { simulateOutcome } from '../logic/simulation';
import { loadState, saveResults, saveState } from '../logic/storage';
import { LayoutShell } from '../components/LayoutShell';
import { ModelCard } from '../components/ModelCard';
import { RealityPanel } from '../components/RealityPanel';
import { AdjustGoalsPanel } from '../components/AdjustGoalsPanel';
import { ComparisonMode } from '../components/ComparisonMode';
import { ExportPanel } from '../components/ExportPanel';
import { EmailCapture } from '../components/EmailCapture';
import { ShareResults } from '../components/ShareResults';
import { ThirtyDayRoadmap } from '../components/ThirtyDayRoadmap';
import { DeepScoring } from '../components/DeepScoring';

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: 'Excellent fit', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= 65) return { text: 'Strong fit', color: 'text-brand-700 bg-brand-50 border-brand-200' };
  if (score >= 50) return { text: 'Moderate fit', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { text: 'Weak fit', color: 'text-slate-600 bg-slate-50 border-slate-200' };
}

function buildPlanSummary(top: ScoredResult, all: ScoredResult[]): string {
  const parts = [
    `#1 ${top.model.title} (${top.score}/100, ${top.confidence} confidence)`,
  ];
  if (all.length > 1) {
    parts.push(`#2 ${all[1].model.title} (${all[1].score}/100)`);
  }
  if (top.topReasons.length > 0) {
    parts.push(`Why: ${top.topReasons[0]}`);
  }
  return parts.join(' | ');
}

export function Results() {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'closest' | 'meets-goal'>('closest');
  const [showSimulation, setShowSimulation] = useState<string | null>(null);

  useEffect(() => {
    const state = loadState();
    setAnswers(state.answers);
  }, []);

  const warnings = useMemo(() => evaluateReality(answers), [answers]);
  const results = useMemo(() => scoreModels(answers, businessModels, warnings), [answers, warnings]);

  useEffect(() => {
    if (results.length > 0) {
      saveResults(results, warnings);
    }
  }, [results, warnings]);

  const displayResults = useMemo(() => {
    if (viewMode === 'meets-goal') {
      return results.filter((r) => {
        const hourly = impliedHourlyRate(answers);
        return hourly <= 200 || r.score >= 50;
      });
    }
    return results;
  }, [results, viewMode, answers]);

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

  const hasBlockers = warnings.some((w) => w.severity === 'blocker');
  const topResult = displayResults[0];
  const restResults = displayResults.slice(1);

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
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Results</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ranked by fit to your time, budget, skills, and goals.
          </p>
          {hasBlockers && (
            <p className="mt-2 text-xs font-medium text-red-600">
              Some of your goals may not be realistic yet. See reality checks below.
            </p>
          )}
        </div>

        {/* Top pick callout */}
        {topResult && (
          <div className="rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-brand-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Best match
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scoreLabel(topResult.score).color}`}>
                {scoreLabel(topResult.score).text}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{topResult.model.title}</h2>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{topResult.model.description}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span>{topResult.model.typicalHours.min}–{topResult.model.typicalHours.max} hrs/wk</span>
              <span>First $ in {topResult.model.timeToFirstDollar.minWeeks}–{topResult.model.timeToFirstDollar.maxWeeks}w</span>
              <span className="font-semibold text-brand-700">{topResult.score}/100</span>
            </div>
          </div>
        )}

        {/* View mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('closest')}
            className={`tap-target flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
              viewMode === 'closest'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Closest matches
          </button>
          <button
            onClick={() => setViewMode('meets-goal')}
            className={`tap-target flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
              viewMode === 'meets-goal'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Can meet income goal
          </button>
        </div>

        {/* All result cards */}
        <div className="space-y-4">
          {displayResults.map((result, i) => (
            <div key={result.model.id}>
              <ModelCard
                result={result}
                rank={i + 1}
                onCompare={toggleCompare}
                isComparing={compareIds.includes(result.model.id)}
              />
              {showSimulation === result.model.id && (
                <SimulationBlock answers={answers} result={result} />
              )}
              <button
                onClick={() =>
                  setShowSimulation((prev) =>
                    prev === result.model.id ? null : result.model.id
                  )
                }
                className="mt-1 w-full text-center text-xs font-medium text-brand-600 hover:text-brand-800 py-1"
              >
                {showSimulation === result.model.id
                  ? 'Hide simulation'
                  : 'Show timeline simulation'}
              </button>
            </div>
          ))}
        </div>

        {/* Email capture — placed after results for maximum intent */}
        <EmailCapture
          source="results"
          topModelId={topResult?.model.id}
          topModelTitle={topResult?.model.title}
          confidenceLabel={topResult ? scoreLabel(topResult.score).text : undefined}
          planSummary={topResult ? buildPlanSummary(topResult, displayResults) : undefined}
        />

        {/* Share results */}
        <ShareResults results={displayResults} />

        {/* Premium sections — locked for free users */}
        {topResult && (
          <>
            <ThirtyDayRoadmap result={topResult} />
            <DeepScoring result={topResult} />
          </>
        )}

        {/* Comparison */}
        {comparisonResults.length === 2 && (
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Comparison</h3>
            <ComparisonMode results={comparisonResults} />
          </div>
        )}

        <RealityPanel warnings={warnings} />

        <AdjustGoalsPanel answers={answers} onChange={handleGoalChange} />

        <ExportPanel
          results={results}
          warnings={warnings}
          answers={answers}
          onImport={handleImport}
        />

        <p className="text-center text-xs text-slate-400 pt-4">
          Startup Compass is educational guidance, not financial advice.
        </p>
      </div>
    </LayoutShell>
  );
}

function SimulationBlock({
  answers,
  result,
}: {
  answers: AnswerState;
  result: ScoredResult;
}) {
  const sim = useMemo(() => simulateOutcome(answers, result), [answers, result]);

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-bold text-slate-800 mb-2">Timeline Simulation</h4>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">{sim.rampDescription}</p>
      <div className="space-y-2">
        {sim.weeklyMilestones.map((m, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}
