interface SliderFieldProps {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SliderField({ value, min, max, step, unit, onChange }: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {unit && <span className="ml-1 text-sm text-slate-500">{unit}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
