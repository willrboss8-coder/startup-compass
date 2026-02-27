import { useState, useMemo, useCallback } from 'react';
import type { ScoredResult } from '../types';

interface ShareResultsProps {
  results: ScoredResult[];
}

function scoreTag(score: number): string {
  if (score >= 80) return 'Excellent fit';
  if (score >= 65) return 'Strong fit';
  if (score >= 50) return 'Moderate fit';
  return 'Weak fit';
}

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function ShareResults({ results }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);
  const [shareCode] = useState(() => generateShareCode());

  const summary = useMemo(() => {
    const lines = [
      'My Startup Compass Results',
      '=' .repeat(30),
      '',
    ];

    const top = results.slice(0, 5);
    top.forEach((r, i) => {
      const sc = r.score % 1 === 0 ? String(r.score) : r.score.toFixed(1);
      lines.push(
        `${i + 1}. ${r.model.title}  —  ${sc}/100 (${scoreTag(r.score)}, ${r.confidence} confidence)`
      );
      if (r.topReasons.length > 0) {
        lines.push(`   Why: ${r.topReasons[0]}`);
      }
      lines.push(
        `   ${r.model.typicalHours.min}–${r.model.typicalHours.max} hrs/wk · First $ in ${r.model.timeToFirstDollar.minWeeks}–${r.model.timeToFirstDollar.maxWeeks} weeks`
      );
      lines.push('');
    });

    lines.push('---');
    lines.push(`Share code: ${shareCode}`);
    lines.push('Take the quiz: startupcompass.app');

    return lines.join('\n');
  }, [results, shareCode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = summary;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [summary]);

  if (results.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Share your results</h3>
          <p className="mt-0.5 text-xs text-slate-500">Copy a plain-text summary to share anywhere.</p>
        </div>
        <button
          onClick={handleCopy}
          className="tap-target flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97]"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="max-h-48 overflow-auto rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
        {summary}
      </pre>

      <p className="mt-2 text-[10px] text-slate-400">
        Share code: <span className="font-mono font-semibold text-slate-500">{shareCode}</span>
        <span className="ml-1">&mdash; saved locally for your reference</span>
      </p>
    </div>
  );
}
