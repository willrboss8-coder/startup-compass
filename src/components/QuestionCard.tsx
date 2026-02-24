import { useState } from 'react';
import { Question, AnswerState } from '../types';
import { SliderField } from './SliderField';
import { OptionSelect } from './OptionSelect';
import { MultiSelectChips } from './MultiSelectChips';

interface QuestionCardProps {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  answers: AnswerState;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const [showHelper, setShowHelper] = useState(false);

  const renderInput = () => {
    switch (question.type) {
      case 'slider':
        return (
          <SliderField
            value={typeof value === 'number' ? value : question.min ?? 1}
            min={question.min ?? 1}
            max={question.max ?? 5}
            step={question.step ?? 1}
            unit={question.unit}
            onChange={onChange}
          />
        );
      case 'number':
        return (
          <div className="flex items-center gap-2">
            {question.unit === '$' && (
              <span className="text-lg font-medium text-slate-500">$</span>
            )}
            <input
              type="number"
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
              min={question.min}
              max={question.max}
              step={question.step}
              placeholder="0"
              className="tap-target w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {question.unit && question.unit !== '$' && (
              <span className="text-sm text-slate-500">{question.unit}</span>
            )}
          </div>
        );
      case 'select':
      case 'boolean':
        return (
          <OptionSelect
            options={question.options ?? []}
            value={value as string | undefined}
            onChange={(v) => onChange(v)}
          />
        );
      case 'multi-select':
        return (
          <MultiSelectChips
            options={question.options ?? []}
            value={Array.isArray(value) ? value : []}
            onChange={(v) => onChange(v)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          {question.title}
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 leading-tight">
          {question.prompt}
        </h2>
      </div>

      <button
        onClick={() => setShowHelper(!showHelper)}
        className="tap-target flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {showHelper ? 'Hide explanation' : 'How this affects your plan'}
      </button>

      {showHelper && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-600 leading-relaxed">
          {question.helperText}
        </div>
      )}

      <div className="pt-2">{renderInput()}</div>
    </div>
  );
}
