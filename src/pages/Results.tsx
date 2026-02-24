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
      const profit = Number(answers.desired_monthly_profit) || 0;
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
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Results</h1>
          <p className="mt-1 text-sm text-slate-600">
            Based on your answers, here are the business models that fit best.
          </p>
          {hasBlockers && (
            <p className="mt-2 text-xs font-medium text-red-600">
              Some results may not meet your stated goals. See reality checks below.
            </p>
          )}
        </div>

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
          Educational guidance only. No guarantees.
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
