import { useState, FormEvent } from 'react';
import { subscribeEmail, type EmailSubscriber } from '../logic/emailService';

interface EmailCaptureProps {
  source: EmailSubscriber['source'];
  topModelId?: string;
  topModelTitle?: string;
  confidenceLabel?: string;
  planSummary?: string;
  variant?: 'card' | 'inline';
}

const BULLETS = [
  'Your top matches with fit scores and explanations',
  'A 7-day action plan for your best-fit model',
  'Early access to new features and deeper analysis tools',
];

export function EmailCapture({
  source,
  topModelId,
  topModelTitle,
  confidenceLabel,
  planSummary,
  variant = 'card',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[EmailCapture] submit handler fired');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    console.log('[EmailCapture] calling subscribeEmail for:', trimmed);
    const result = await subscribeEmail(trimmed, source, {
      topModelId,
      topModelTitle,
      confidenceLabel,
      planSummary,
    });
    if (result.ok) {
      setStatus('success');
    } else {
      setErrorMsg(result.error || 'Something went wrong.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-center ${variant === 'card' ? 'p-6' : 'p-4'}`}>
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-base font-bold text-emerald-800">You're in.</p>
        <p className="mt-1 text-sm text-emerald-700">
          Check your inbox &mdash; your personalized results and action plan are on the way.
        </p>
        <div className="mt-3 rounded-xl bg-emerald-100/60 px-4 py-2.5 text-xs text-emerald-700 leading-relaxed">
          <strong>What happens next:</strong> We&rsquo;ll send your top matches, scoring breakdown,
          and step-by-step plan &mdash; plus early access when premium features launch.
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${variant === 'card' ? 'p-5' : 'p-4'}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">
          Get your personalized action plan
        </h3>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
          We&rsquo;ll email you everything you need to take the first step &mdash; for free.
        </p>
      </div>

      <ul className="mb-4 space-y-2">
        {BULLETS.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="you@example.com"
          className="tap-target min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:bg-white"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="tap-target shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60 active:scale-[0.97]"
        >
          {status === 'loading' ? 'Sending\u2026' : 'Send it'}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
      )}

      <p className="mt-3 text-[10px] text-slate-400">
        No spam. Unsubscribe anytime. We never share your email.
      </p>
    </div>
  );
}
