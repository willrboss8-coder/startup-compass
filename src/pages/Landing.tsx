import { Link } from 'react-router-dom';
import { hasSavedProgress } from '../logic/storage';
import { LayoutShell } from '../components/LayoutShell';

export function Landing() {
  const hasProgress = hasSavedProgress();

  return (
    <LayoutShell>
      <div className="flex min-h-[75vh] flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg shadow-brand-200">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12,2 15,11 12,9 9,11" />
            <polygon points="12,22 9,13 12,15 15,13" />
            <polygon points="2,12 11,9 9,12 11,15" />
            <polygon points="22,12 13,15 15,12 13,9" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Startup<br />
          <span className="text-brand-600">Compass</span>
        </h1>

        <p className="mt-4 max-w-md text-base text-slate-600 leading-relaxed">
          Find the business model that actually fits your time, budget, skills, and goals — not someone else's fantasy.
        </p>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Honest, no-hype guidance in 4–6 minutes. Works entirely offline.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            to="/onboarding"
            className="tap-target flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700 active:scale-[0.97]"
          >
            Start Fresh
          </Link>
          {hasProgress && (
            <Link
              to="/quiz"
              className="tap-target flex items-center justify-center rounded-xl border-2 border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100 active:scale-[0.97]"
            >
              Resume Where You Left Off
            </Link>
          )}
        </div>

        <div className="mt-12 grid max-w-sm grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-900">24+</div>
            <div className="text-xs text-slate-500">Business models</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">4–6</div>
            <div className="text-xs text-slate-500">Minutes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">100%</div>
            <div className="text-xs text-slate-500">Private & offline</div>
          </div>
        </div>

        <p className="mt-12 text-xs text-slate-400">
          Educational guidance only. No guarantees.
        </p>
      </div>
    </LayoutShell>
  );
}
