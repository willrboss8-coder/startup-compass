import { AnswerState } from '../types';

interface AdjustGoalsPanelProps {
  answers: AnswerState;
  onChange: (key: string, value: unknown) => void;
}

export function AdjustGoalsPanel({ answers, onChange }: AdjustGoalsPanelProps) {
  const hours = Number(answers.hours_per_week) || 10;
  const budget = Number(answers.budget_upfront) || 0;
  const profit = Number(answers.desired_monthly_profit) || 2000;
  const timeframe = String(answers.timeframe_months || '6');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4">Adjust Your Goals</h3>
      <p className="text-xs text-slate-500 mb-4">
        Drag the sliders to see how results change in real time.
      </p>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <label className="font-medium text-slate-700">Hours per week</label>
            <span className="font-bold text-slate-900">{hours}</span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={hours}
            onChange={(e) => onChange('hours_per_week', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <label className="font-medium text-slate-700">Upfront budget</label>
            <span className="font-bold text-slate-900">${budget.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20000}
            step={100}
            value={budget}
            onChange={(e) => onChange('budget_upfront', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <label className="font-medium text-slate-700">Monthly income goal</label>
            <span className="font-bold text-slate-900">${profit.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={profit}
            onChange={(e) => onChange('desired_monthly_profit', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <label className="font-medium text-slate-700">Timeframe</label>
          </div>
          <div className="flex gap-2">
            {['1', '3', '6', '12', '24'].map((m) => (
              <button
                key={m}
                onClick={() => onChange('timeframe_months', m)}
                className={`tap-target flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                  timeframe === m
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}mo
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
