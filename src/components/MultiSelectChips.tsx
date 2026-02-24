import { QuestionOption } from '../types';

interface MultiSelectChipsProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelectChips({ options, value, onChange }: MultiSelectChipsProps) {
  const toggle = (optValue: string) => {
    if (optValue === 'none') {
      onChange(['none']);
      return;
    }
    const without = value.filter((v) => v !== 'none');
    if (without.includes(optValue)) {
      const next = without.filter((v) => v !== optValue);
      onChange(next.length > 0 ? next : []);
    } else {
      onChange([...without, optValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`tap-target rounded-full border-2 px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
              selected
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
