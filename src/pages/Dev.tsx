import { useState, useEffect, useMemo } from 'react';
import { AnswerState } from '../types';
import { loadState, resetState, saveState } from '../logic/storage';
import { getVisibleQuestions, demoPresets, questions as allQuestions } from '../logic/questionEngine';
import { evaluateReality, impliedHourlyRate } from '../logic/realityChecks';
import { scoreModels } from '../logic/scoring';
import { businessModels } from '../data/businessModels';
import { LayoutShell } from '../components/LayoutShell';

export function Dev() {
  const [state, setState] = useState(loadState());
  const [activeTab, setActiveTab] = useState<'answers' | 'questions' | 'history' | 'warnings' | 'scores'>('answers');

  useEffect(() => {
    setState(loadState());
  }, []);

  const refresh = () => setState(loadState());

  const warnings = useMemo(() => evaluateReality(state.answers), [state.answers]);
  const visibleQuestions = useMemo(() => getVisibleQuestions(state.answers), [state.answers]);
  const results = useMemo(
    () => scoreModels(state.answers, businessModels, warnings),
    [state.answers, warnings]
  );
  const hourly = useMemo(() => impliedHourlyRate(state.answers), [state.answers]);

  const handleReset = () => {
    resetState();
    refresh();
  };

  const handleLoadPreset = (index: number) => {
    const preset = demoPresets[index];
    if (!preset) return;
    const newState = {
      ...state,
      answers: preset.answers,
      currentQuestionId: null,
      history: [],
    };
    saveState(newState);
    refresh();
  };

  const tabs = [
    { id: 'answers' as const, label: 'Answers', count: Object.keys(state.answers).length },
    { id: 'questions' as const, label: 'Questions', count: visibleQuestions.length },
    { id: 'history' as const, label: 'History', count: state.history.length },
    { id: 'warnings' as const, label: 'Warnings', count: warnings.length },
    { id: 'scores' as const, label: 'Scores', count: results.length },
  ];

  return (
    <LayoutShell>
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Dev Harness</h1>
          <button
            onClick={refresh}
            className="tap-target rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="tap-target rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Reset All State
          </button>
          {demoPresets.map((p, i) => (
            <button
              key={i}
              onClick={() => handleLoadPreset(i)}
              className="tap-target rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs text-slate-500">Schema</p>
              <p className="text-sm font-bold text-slate-900">v{state.schemaVersion}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Implied $/hr</p>
              <p className="text-sm font-bold text-slate-900">${Math.round(hourly)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Current Q</p>
              <p className="text-sm font-bold text-slate-900 truncate">{state.currentQuestionId || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Saved</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {state.lastSavedAt ? new Date(state.lastSavedAt).toLocaleTimeString() : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tap-target whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          {activeTab === 'answers' && (
            <div className="p-4">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono overflow-auto max-h-96">
                {JSON.stringify(state.answers, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="divide-y divide-slate-100">
              {visibleQuestions.map((q) => {
                const answered = state.answers[q.id] !== undefined;
                return (
                  <div key={q.id} className="flex items-center justify-between px-4 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{q.id}</p>
                      <p className="text-[10px] text-slate-500">
                        {q.phase} · priority {q.priority} · {q.type}
                        {q.dependsOn.length > 0 && ` · depends: ${q.dependsOn.join(', ')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {answered && (
                        <span className="text-[10px] font-mono text-slate-500 max-w-[80px] truncate">
                          {String(state.answers[q.id])}
                        </span>
                      )}
                      <span className={`h-2 w-2 rounded-full ${answered ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
              <div className="px-4 py-2 text-xs text-slate-500">
                {allQuestions.length - visibleQuestions.length} questions hidden by branching logic
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4">
              {state.history.length === 0 ? (
                <p className="text-xs text-slate-500">No history yet.</p>
              ) : (
                <ol className="space-y-1">
                  {state.history.map((id, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-mono w-4">{i + 1}</span>
                      <span className="font-medium text-slate-700">{id}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {activeTab === 'warnings' && (
            <div className="divide-y divide-slate-100">
              {warnings.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">No warnings.</p>
              ) : (
                warnings.map((w) => (
                  <div key={w.id} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        w.severity === 'blocker'
                          ? 'bg-red-100 text-red-700'
                          : w.severity === 'warn'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {w.severity}
                      </span>
                      <span className="text-xs font-medium text-slate-800">{w.title}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">{w.triggeredBecause}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="divide-y divide-slate-100">
              {results.map((r, i) => (
                <div key={r.model.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{i + 1}</span>
                      <span className="text-xs font-medium text-slate-800">{r.model.title}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{r.score}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {Object.entries(r.fitBreakdown).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className="h-1 rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <p className="text-[8px] text-slate-400 mt-0.5">{Math.round(val)}</p>
                      </div>
                    ))}
                  </div>
                  {r.mismatches.length > 0 && (
                    <p className="mt-1 text-[10px] text-red-500">
                      Mismatches: {r.mismatches.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  );
}
