import { z } from 'zod';

export type QuestionType = 'slider' | 'number' | 'select' | 'multi-select' | 'boolean';

export type QuestionPhase =
  | 'capacity'
  | 'constraints'
  | 'preferences'
  | 'skills'
  | 'distribution'
  | 'goals_refinement';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  title: string;
  prompt: string;
  helperText: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  validation: z.ZodType<unknown>;
  visibility: (answers: AnswerState) => boolean;
  priority: number;
  phase: QuestionPhase;
  dependsOn: string[];
  skipAllowed?: boolean;
}

export type AnswerState = Record<string, unknown>;

export interface BusinessModel {
  id: string;
  title: string;
  description: string;
  typicalHours: { min: number; max: number };
  budget: { min: number; max: number };
  timeToFirstDollar: { minWeeks: number; maxWeeks: number };
  complexity: number;
  risk: number;
  scalabilityType: 'linear' | 'leverage';
  requiresOutreach: boolean;
  requiresConsistency: boolean;
  requiresPublicPresence: boolean;
  skillTags: string[];
  goodFor: string[];
  badFor: string[];
  distributionChannels: string[];
  offerFormats: string[];
  first7DaysPlan: string[];
  antiPatterns: string[];
  exampleOffers: string[];
}

export type WarningSeverity = 'info' | 'warn' | 'blocker';

export interface RealityWarning {
  id: string;
  severity: WarningSeverity;
  title: string;
  triggeredBecause: string;
  whyItMatters: string;
  whatWouldNeedToBeTrue: string[];
  waysToFix: string[];
}

export interface FitBreakdown {
  timeFit: number;
  budgetFit: number;
  timelineRealism: number;
  preferenceAlignment: number;
  distributionMatch: number;
  salesMarketingFit: number;
  skillAssetMatch: number;
}

export interface ScoredResult {
  model: BusinessModel;
  score: number;
  fitBreakdown: FitBreakdown;
  explanation: string;
  mismatches: string[];
  confidenceAdjustment: number;
  confidence: 'Low' | 'Medium' | 'High';
  topReasons: string[];
  topMismatches: string[];
}

export interface AppState {
  answers: AnswerState;
  currentQuestionId: string | null;
  history: string[];
  lastResults: ScoredResult[] | null;
  lastRealityWarnings: RealityWarning[] | null;
  schemaVersion: number;
  lastSavedAt: string | null;
}

export interface DemoPreset {
  name: string;
  description: string;
  answers: AnswerState;
}
