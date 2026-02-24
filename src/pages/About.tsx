import { LayoutShell } from '../components/LayoutShell';

export function About() {
  return (
    <LayoutShell>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">How This Works</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            A plain-language explanation of what happens behind the scenes.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Scoring</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Each business model is scored against your answers using weighted criteria:
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            {[
              { label: 'Time Fit', weight: '20%', desc: 'Do your available hours match what this model needs?' },
              { label: 'Budget Fit', weight: '15%', desc: 'Can you afford the startup costs?' },
              { label: 'Timeline Realism', weight: '15%', desc: 'Can you reach first revenue within your timeframe?' },
              { label: 'Preference Alignment', weight: '15%', desc: 'Does the work style and offer format match?' },
              { label: 'Sales & Marketing Fit', weight: '15%', desc: 'Does the model match your comfort with sales and marketing?' },
              { label: 'Distribution Match', weight: '10%', desc: 'Do the growth channels align with your preference?' },
              { label: 'Skill & Asset Match', weight: '10%', desc: 'Do your existing skills and assets give you an advantage?' },
            ].map(({ label, weight, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="shrink-0 rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                  {weight}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            The final score is a weighted average (0–100). Models are ranked by score and the top 3–6 are shown.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Reality Checks</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Before showing results, the system checks for contradictions in your inputs:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <span>
                <strong>Implied hourly rate:</strong> Your target income divided by your available hours.
                If this exceeds $150/hr, we flag it as ambitious. Above $400/hr, it is extremely rare.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <span>
                <strong>Timeline vs income:</strong> Wanting $10k+ in month 1 with no assets and
                low sales comfort triggers a blocker.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <span>
                <strong>Passive income fantasy:</strong> Wanting passive income with low hours, low budget,
                and a short timeframe is flagged because that combination does not exist.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <span>
                <strong>Budget mismatch, skill gaps, risk mismatch:</strong> Detected when your constraints
                conflict with your income goals.
              </span>
            </li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            Each warning includes severity (info, warn, blocker), an explanation,
            what would need to be true, and suggested adjustments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Deterministic Approach</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This tool uses no AI, no machine learning, and no network calls. Every calculation is
            deterministic — given the same inputs, you get the same outputs every time.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your answers are stored only in your browser's localStorage. Nothing leaves your device.
            No analytics, no tracking, no cookies beyond what your browser provides.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Adaptive Questions</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The quiz adapts based on your answers. For example:
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• Low hours → asks about side-hustle pace and passive income preference</li>
            <li>• Low sales comfort → asks about outreach willingness and partnerships</li>
            <li>• High tech comfort → asks about building software</li>
            <li>• High income goal → asks about high-ticket offer comfort</li>
            <li>• Local scope → asks about physical labor and transportation</li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you change an answer, follow-up questions that are no longer relevant are
            automatically removed.
          </p>
        </section>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Disclaimer:</span> Educational guidance only.
            No guarantees. This tool is not financial advice and should not be treated as such.
            Always do your own research and consider consulting with a professional before
            starting a business.
          </p>
        </div>
      </div>
    </LayoutShell>
  );
}
