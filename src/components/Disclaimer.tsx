interface DisclaimerProps {
  variant?: 'full' | 'compact';
}

export function Disclaimer({ variant = 'compact' }: DisclaimerProps) {
  if (variant === 'full') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-700">Disclaimer</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Startup Compass provides educational guidance only. It does not guarantee income, success,
          or any particular outcome. This tool is not financial, legal, or professional advice.
          Always do your own research and consider consulting with a qualified professional before
          making business decisions.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          All scoring is deterministic &mdash; no AI, no machine learning, no guessing. Same inputs
          always produce the same results. Your data stays in your browser and is never sent to any
          server (except your email if you opt in).
        </p>
      </div>
    );
  }

  return (
    <p className="text-center text-[10px] text-slate-400 leading-relaxed">
      Startup Compass is educational guidance, not financial advice.
      Deterministic scoring &mdash; no AI, no tracking. Your data stays on your device.
    </p>
  );
}
