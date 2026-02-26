import { useState, FormEvent } from 'react';
import { subscribeEmail, type EmailSubscriber } from '../logic/emailService';

interface EmailCaptureProps {
  source: EmailSubscriber['source'];
  topModelId?: string;
  variant?: 'card' | 'inline';
}

export function EmailCapture({ source, topModelId, variant = 'card' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    const result = await subscribeEmail(trimmed, source, topModelId);
    if (result.ok) {
      setStatus('success');
    } else {
      setErrorMsg(result.error || 'Something went wrong.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center ${variant === 'inline' ? 'p-4' : ''}`}>
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-emerald-800">You're in.</p>
        <p className="mt-1 text-xs text-emerald-600">
          We'll send your execution plan and product updates.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${variant === 'card' ? 'p-5' : 'p-4'}`}>
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-900">
          Get your execution plan
        </h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          We'll email your top matches and action plans — plus early access when new features drop.
        </p>
      </div>
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
          {status === 'loading' ? '...' : 'Send'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
      )}
      <p className="mt-2 text-[10px] text-slate-400">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
