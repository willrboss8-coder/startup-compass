import { RealityWarning } from '../types';
import { realityMeterColor } from '../logic/realityChecks';

interface ProgressHeaderProps {
  percent: number;
  answered: number;
  total: number;
  warnings: RealityWarning[];
}

const colorMap = {
  green: { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'On track' },
  yellow: { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Concerns' },
  red: { bg: 'bg-red-500', text: 'text-red-700', label: 'Blockers found' },
};

export function ProgressHeader({ percent, answered, total, warnings }: ProgressHeaderProps) {
  const meter = realityMeterColor(warnings);
  const color = colorMap[meter];

  const phaseLabel =
    percent < 25 ? 'Your capacity'
    : percent < 45 ? 'Your constraints'
    : percent < 65 ? 'Your preferences'
    : percent < 80 ? 'Your skills'
    : percent < 95 ? 'Distribution'
    : 'Fine-tuning';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-700">
            {answered} of {total}
          </span>
          <span className="ml-2 text-xs text-slate-400">{phaseLabel}</span>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${color.text}`}>
          <span className={`h-2 w-2 rounded-full ${color.bg}`} />
          {color.label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
