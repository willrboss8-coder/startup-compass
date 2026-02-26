import { Link } from 'react-router-dom';
import { hasSavedProgress } from '../logic/storage';
import { LayoutShell } from '../components/LayoutShell';

const BENEFITS = [
  {
    title: 'Finally, options that fit you',
    body: 'We match you to 24+ business models based on your time, budget, skills, and goals \u2014 so you stop scrolling and start choosing.',
  },
  {
    title: 'No more \u201cnothing fits\u201d',
    body: 'Built for people who\u2019ve searched and searched. Answer a few questions and get a shortlist tailored to your situation, not a generic list.',
  },
  {
    title: 'Honest about what fits \u2014 and what doesn\u2019t',
    body: 'Clear tradeoffs and reality checks. We tell you when your goals are unrealistic and exactly what to change. No hype.',
  },
  {
    title: 'Private and low-pressure',
    body: 'Everything runs in your browser. No account, no data collection, no tracking. Explore at your own pace.',
  },
  {
    title: 'A clear next step',
    body: 'Your results come with a 7-day action plan for each recommendation. Not just \u201cwhat\u201d \u2014 but \u201chere\u2019s day 1 through 7.\u201d',
  },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Answer 15 questions', desc: 'About your hours, budget, skills, and goals. The quiz adapts to your answers.' },
  { step: '2', title: 'Get scored matches', desc: 'Each of 24+ business models is ranked against 7 dimensions of fit.' },
  { step: '3', title: 'See reality checks', desc: 'If your goals conflict with your constraints, we tell you \u2014 and show what to adjust.' },
];

export function Landing() {
  const hasProgress = hasSavedProgress();

  return (
    <LayoutShell>
      {/* Hero */}
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-2 text-center">
        <div className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg shadow-brand-200" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="currentColor" aria-hidden>
            <polygon points="12,2 9,10 15,10" />
            <polygon points="12,22 15,14 9,14" />
            <polygon points="22,12 14,15 14,9" />
            <polygon points="2,12 10,9 10,15" />
            <circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.95" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Stop searching.<br />
          <span className="text-brand-600">Start building.</span>
        </h1>

        <p className="mt-4 max-w-md text-base text-slate-600 leading-relaxed">
          Find the one business model that actually fits your life &mdash; your time, your budget, your skills. Not someone else&rsquo;s fantasy.
        </p>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          One short quiz. Honest guidance. 4&ndash;6 minutes. No sign-up.
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-sm">
          <Link
            to="/onboarding"
            className="tap-target flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700 active:scale-[0.97]"
          >
            Find my fit
          </Link>
          {hasProgress && (
            <Link
              to="/quiz"
              className="tap-target flex items-center justify-center rounded-xl border-2 border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100 active:scale-[0.97]"
            >
              Resume where you left off
            </Link>
          )}
        </div>
      </div>

      {/* How it works */}
      <section className="border-t border-slate-200/80 py-10">
        <h2 className="text-center text-lg font-bold text-slate-900 mb-6">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-slate-200/80 bg-slate-50/60 py-10" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="text-center text-lg font-bold text-slate-900 mb-6">
          Built for people who haven&rsquo;t started yet
        </h2>
        <div className="space-y-4">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <svg className="h-3 w-3 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0 text-left">
                <h3 className="font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{benefit.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/onboarding"
            className="tap-target inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-700 active:scale-[0.97]"
          >
            Take the quiz &mdash; it&rsquo;s free
          </Link>
        </div>
      </section>

      {/* Trust bar */}
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="grid max-w-md grid-cols-4 gap-4">
          <div>
            <div className="text-lg font-bold text-slate-900">24+</div>
            <div className="text-xs text-slate-500">Models analyzed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">7</div>
            <div className="text-xs text-slate-500">Fit dimensions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">4&ndash;6</div>
            <div className="text-xs text-slate-500">Minutes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">0</div>
            <div className="text-xs text-slate-500">Data collected</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
          <span>No AI hallucinations</span>
          <span>&middot;</span>
          <span>Deterministic scoring</span>
          <span>&middot;</span>
          <span>Same inputs = same results</span>
          <span>&middot;</span>
          <span>Works offline</span>
        </div>
      </div>
    </LayoutShell>
  );
}
