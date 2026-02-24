import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnswerState } from '../types';
import {
  getVisibleQuestions,
  getNextQuestionId,
  getQuestionById,
  getProgress,
  isQuizComplete,
  demoPresets,
} from '../logic/questionEngine';
import { evaluateReality } from '../logic/realityChecks';
import { loadState, saveState } from '../logic/storage';
import { LayoutShell } from '../components/LayoutShell';
import { ProgressHeader } from '../components/ProgressHeader';
import { QuestionCard } from '../components/QuestionCard';
import { RealityBanner } from '../components/RealityBanner';
import { SavedIndicator } from '../components/SavedIndicator';

export function Quiz() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [saveTrigger, setSaveTrigger] = useState(0);

  useEffect(() => {
    const state = loadState();
    setAnswers(state.answers);
    setHistory(state.history);
    if (state.currentQuestionId) {
      setCurrentId(state.currentQuestionId);
    } else {
      const firstId = getNextQuestionId(null, state.answers);
      setCurrentId(firstId);
    }
  }, []);

  const persist = useCallback(
    (newAnswers: AnswerState, newCurrentId: string | null, newHistory: string[]) => {
      const state = loadState();
      saveState({
        ...state,
        answers: newAnswers,
        currentQuestionId: newCurrentId,
        history: newHistory,
      });
      setSaveTrigger((p) => p + 1);
    },
    []
  );

  const warnings = useMemo(() => evaluateReality(answers), [answers]);
  const progress = useMemo(() => getProgress(answers), [answers]);
  const currentQuestion = currentId ? getQuestionById(currentId) : null;
  const quizDone = useMemo(() => isQuizComplete(answers), [answers]);

  const handleAnswer = useCallback(
    (value: unknown) => {
      if (!currentId) return;
      const newAnswers = { ...answers, [currentId]: value };

      const visibleIds = new Set(getVisibleQuestions(newAnswers).map((q) => q.id));
      const cleaned: AnswerState = {};
      for (const [key, val] of Object.entries(newAnswers)) {
        if (visibleIds.has(key)) {
          cleaned[key] = val;
        }
      }

      setAnswers(cleaned);
      persist(cleaned, currentId, history);
    },
    [currentId, answers, history, persist]
  );

  const goNext = useCallback(() => {
    if (!currentId) return;
    const nextId = getNextQuestionId(currentId, answers);
    if (nextId) {
      setHistory((prev) => {
        const updated = [...prev, currentId];
        setCurrentId(nextId);
        persist(answers, nextId, updated);
        return updated;
      });
    } else if (quizDone) {
      navigate('/results');
    }
  }, [currentId, answers, history, quizDone, navigate, persist]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prevId = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setCurrentId(prevId);
    persist(answers, prevId, newHistory);
  }, [history, answers, persist]);

  const skipQuestion = useCallback(() => {
    if (!currentId) return;
    goNext();
  }, [currentId, goNext]);

  const loadPreset = useCallback(
    (presetIndex: number) => {
      const preset = demoPresets[presetIndex];
      if (!preset) return;
      setAnswers(preset.answers);
      const visible = getVisibleQuestions(preset.answers);
      const unanswered = visible.find((q) => preset.answers[q.id] === undefined);
      const nextId = unanswered?.id ?? visible[visible.length - 1]?.id ?? null;
      setCurrentId(nextId);
      setHistory([]);
      persist(preset.answers, nextId, []);
    },
    [persist]
  );

  const hasAnswer = currentId ? answers[currentId] !== undefined : false;

  return (
    <LayoutShell>
      <SavedIndicator trigger={saveTrigger} />
      <div className="space-y-5 pb-28">
        <ProgressHeader
          percent={progress.percent}
          answered={progress.answered}
          total={progress.total}
          warnings={warnings}
        />

        <div>
          <select
            onChange={(e) => {
              if (e.target.value) loadPreset(Number(e.target.value));
            }}
            defaultValue=""
            className="tap-target w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none focus:border-brand-400"
          >
            <option value="" disabled>
              Load demo preset...
            </option>
            {demoPresets.map((p, i) => (
              <option key={i} value={i}>
                {p.name} — {p.description}
              </option>
            ))}
          </select>
        </div>

        {warnings.length > 0 && <RealityBanner warnings={warnings} />}

        {currentQuestion && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={handleAnswer}
              answers={answers}
            />
          </div>
        )}

        {!currentQuestion && quizDone && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-emerald-900">All done!</h3>
            <p className="mt-1 text-sm text-emerald-700">
              Your answers are ready. Let's see your results.
            </p>
            <button
              onClick={() => navigate('/results')}
              className="tap-target mt-4 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-[0.97]"
            >
              View Results
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            className="tap-target rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-30 active:scale-95"
          >
            Back
          </button>

          <div className="flex gap-2">
            {currentQuestion?.skipAllowed && !hasAnswer && (
              <button
                onClick={skipQuestion}
                className="tap-target rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 active:scale-95"
              >
                Skip
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!hasAnswer && !quizDone}
              className="tap-target rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-700 disabled:opacity-40 active:scale-[0.97]"
            >
              {quizDone && !getNextQuestionId(currentId, answers) ? 'See Results' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
