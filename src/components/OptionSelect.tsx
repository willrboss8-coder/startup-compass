import { QuestionOption } from '../types';

interface OptionSelectProps {
  options: QuestionOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export function OptionSelect({ options, value, onChange }: OptionSelectProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`tap-target flex w-full flex-col rounded-xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${
            value === opt.value
              ? 'border-brand-500 bg-brand-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`text-sm font-medium ${value === opt.value ? 'text-brand-700' : 'text-slate-900'}`}>
            {opt.label}
          </span>
          {opt.description && (
            <span className="mt-0.5 text-xs text-slate-500">{opt.description}</span>
          )}
        </button>
      ))}
    </div>
  );
}
