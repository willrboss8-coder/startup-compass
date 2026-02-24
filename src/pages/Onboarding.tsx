import { Link } from 'react-router-dom';
import { LayoutShell } from '../components/LayoutShell';
import { resetState } from '../logic/storage';

export function Onboarding() {
  const handleStart = () => {
    resetState();
  };

  return (
    <LayoutShell>
      <div className="py-4 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Before we begin</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            A few things to set expectations so you get real value from this.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="text-sm font-bold text-emerald-800 mb-2">What you will get</h3>
            <ul className="space-y-1.5 text-sm text-emerald-700">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                3–6 business models matched to your specific situation
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Honest reality checks on your goals and constraints
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                A concrete 7-day action plan for each recommendation
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Ability to tweak goals and see results update instantly
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-bold text-amber-800 mb-2">What this cannot do</h3>
            <ul className="space-y-1.5 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
                Guarantee income or success
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
                Replace proper market research and validation
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
                Account for your unique personal circumstances
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-2">How long it takes</h3>
            <p className="text-sm text-slate-600">
              <span className="font-semibold">4–6 minutes</span> depending on your answers.
              Questions adapt to your responses — you will only see what is relevant to you.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Disclaimer:</span> Educational guidance only. No guarantees.
            This tool uses deterministic scoring — no AI, no network calls, no data collection.
            Everything runs in your browser and stays on your device.
          </p>
        </div>

        <Link
          to="/quiz"
          onClick={handleStart}
          className="tap-target flex w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700 active:scale-[0.97]"
        >
          Let's Go
        </Link>
      </div>
    </LayoutShell>
  );
}
