import { useState, useRef } from 'react';
import { ScoredResult, RealityWarning, AnswerState } from '../types';
import { exportStateJSON, importStateJSON } from '../logic/storage';

interface ExportPanelProps {
  results: ScoredResult[];
  warnings: RealityWarning[];
  answers: AnswerState;
  onImport: () => void;
}

export function ExportPanel({ results, warnings, answers, onImport }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePlainText = (): string => {
    const lines: string[] = [];
    lines.push('═══ STARTUP COMPASS RESULTS ═══');
    lines.push('');
    lines.push(`Generated: ${new Date().toLocaleDateString()}`);
    lines.push('');

    if (warnings.length > 0) {
      lines.push('── REALITY CHECKS ──');
      warnings.forEach((w) => {
        lines.push(`  [${w.severity.toUpperCase()}] ${w.title}`);
        lines.push(`  ${w.triggeredBecause}`);
        lines.push('');
      });
    }

    lines.push('── TOP RECOMMENDATIONS ──');
    results.forEach((r, i) => {
      lines.push('');
      lines.push(`#${i + 1} ${r.model.title} (Score: ${r.score}, Confidence: ${r.confidence})`);
      lines.push(`   ${r.model.description}`);
      lines.push(`   Hours: ${r.model.typicalHours.min}–${r.model.typicalHours.max}/week`);
      lines.push(`   First revenue: ${r.model.timeToFirstDollar.minWeeks}–${r.model.timeToFirstDollar.maxWeeks} weeks`);
      if (r.topReasons.length > 0) {
        lines.push('   Why it fits:');
        r.topReasons.forEach((reason) => lines.push(`     ✓ ${reason}`));
      }
      if (r.topMismatches.length > 0) {
        lines.push('   Watch out:');
        r.topMismatches.forEach((m) => lines.push(`     ⚠ ${m}`));
      }
      lines.push('   First 7 days:');
      r.model.first7DaysPlan.forEach((step) => lines.push(`     ${step}`));
    });

    lines.push('');
    lines.push('── YOUR INPUTS ──');
    Object.entries(answers).forEach(([key, val]) => {
      lines.push(`  ${key}: ${Array.isArray(val) ? val.join(', ') : String(val)}`);
    });

    lines.push('');
    lines.push('Disclaimer: Educational guidance only. No guarantees.');
    return lines.join('\n');
  };

  const copyText = async (type: 'plain' | 'json') => {
    try {
      const text = type === 'plain' ? generatePlainText() : exportStateJSON();
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleImportJSON = () => {
    setImportError('');
    const result = importStateJSON(importText);
    if (result) {
      setShowImport(false);
      setImportText('');
      onImport();
    } else {
      setImportError('Invalid JSON. Please paste a valid Startup Compass export.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importStateJSON(text);
      if (result) {
        setShowImport(false);
        onImport();
      } else {
        setImportError('Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-3">Export & Import</h3>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => copyText('plain')}
          className="tap-target flex-1 rounded-lg bg-slate-100 py-2.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.98]"
        >
          {copied === 'plain' ? '✓ Copied!' : 'Copy Plain Text'}
        </button>
        <button
          onClick={() => copyText('json')}
          className="tap-target flex-1 rounded-lg bg-slate-100 py-2.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-200 active:scale-[0.98]"
        >
          {copied === 'json' ? '✓ Copied!' : 'Copy JSON'}
        </button>
        <button
          onClick={() => setShowImport(!showImport)}
          className="tap-target flex-1 rounded-lg bg-brand-50 py-2.5 text-xs font-medium text-brand-700 transition-all hover:bg-brand-100 active:scale-[0.98]"
        >
          Import JSON
        </button>
      </div>

      {showImport && (
        <div className="mt-4 space-y-3">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your Startup Compass JSON export here..."
            className="w-full rounded-lg border border-slate-200 p-3 text-xs font-mono text-slate-700 h-32 resize-none outline-none focus:border-brand-500"
          />
          {importError && <p className="text-xs text-red-600">{importError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleImportJSON}
              disabled={!importText.trim()}
              className="tap-target flex-1 rounded-lg bg-brand-500 py-2.5 text-xs font-medium text-white transition-all hover:bg-brand-600 disabled:opacity-50 active:scale-[0.98]"
            >
              Import
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="tap-target rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-200"
            >
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
