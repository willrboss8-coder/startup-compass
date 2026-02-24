import { AppState, AnswerState, ScoredResult, RealityWarning } from '../types';

const STORAGE_KEY = 'startup-compass-state';
const CURRENT_SCHEMA_VERSION = 1;

function defaultState(): AppState {
  return {
    answers: {},
    currentQuestionId: null,
    history: [],
    lastResults: null,
    lastRealityWarnings: null,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastSavedAt: null,
  };
}

function migrate(raw: Record<string, unknown>): AppState {
  const version = (raw.schemaVersion as number) ?? 0;
  if (version < 1) {
    return {
      ...defaultState(),
      answers: (raw.answers as AnswerState) ?? {},
      history: (raw.history as string[]) ?? [],
    };
  }
  return raw as unknown as AppState;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    const toSave: AppState = {
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function resetState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

export function saveAnswers(answers: AnswerState): void {
  const state = loadState();
  state.answers = answers;
  saveState(state);
}

export function saveProgress(currentQuestionId: string | null, history: string[]): void {
  const state = loadState();
  state.currentQuestionId = currentQuestionId;
  state.history = history;
  saveState(state);
}

export function saveResults(results: ScoredResult[], warnings: RealityWarning[]): void {
  const state = loadState();
  state.lastResults = results;
  state.lastRealityWarnings = warnings;
  saveState(state);
}

export function hasSavedProgress(): boolean {
  const state = loadState();
  return Object.keys(state.answers).length > 0;
}

export function exportStateJSON(): string {
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

export function importStateJSON(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json);
    const migrated = migrate(parsed);
    saveState(migrated);
    return migrated;
  } catch {
    return null;
  }
}
