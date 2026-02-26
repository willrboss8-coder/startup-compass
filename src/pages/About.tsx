import { LayoutShell } from '../components/LayoutShell';
import { Disclaimer } from '../components/Disclaimer';

export function About() {
  return (
    <LayoutShell>
      <div className="space-y-8 py-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">How This Works</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            A plain-language explanation of what happens behind the scenes &mdash; and why you can trust it.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Deterministic Scoring Engine</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every recommendation is produced by a rule-based scoring engine. There is no AI,
            no machine learning, and no randomness. Given the same inputs, you will always get
            the exact same results &mdash; on any device, at any time, even offline.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Each of the 24+ business models is scored against your answers across
            <strong> 7 weighted dimensions:</strong>
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            {[
              { label: 'Time Fit', weight: '20%', desc: 'Do your available hours match what this model needs?' },
              { label: 'Budget Fit', weight: '15%', desc: 'Can you afford the typical startup costs?' },
              { label: 'Timeline Realism', weight: '15%', desc: 'Can you realistically reach first revenue within your timeframe?' },
              { label: 'Preference Alignment', weight: '15%', desc: 'Does the work style and offer format match what you want?' },
              { label: 'Sales & Marketing Fit', weight: '15%', desc: 'Does the model match your comfort with outreach and sales?' },
              { label: 'Distribution Match', weight: '10%', desc: 'Do the growth channels align with where you can reach customers?' },
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
            The final score is a weighted average (0&ndash;100). Models are ranked by score,
            and your top 3&ndash;6 matches are displayed with confidence levels (Low, Medium, High)
            based on how many relevant questions you answered.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Reality Check System</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Before showing results, the engine cross-validates your inputs against each other
            to detect contradictions and unrealistic expectations. This is not a generic warning
            &mdash; it is specific to your numbers.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="h-2 w-2 rounded-full bg-red-500" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Implied hourly rate</p>
                <p className="text-xs text-slate-500">
                  Your target income &divide; available hours. If this exceeds $150/hr, we flag it.
                  Above $400/hr is extremely rare for new businesses.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="h-2 w-2 rounded-full bg-red-500" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Impossible timeline</p>
                <p className="text-xs text-slate-500">
                  Wanting $10k+ in month 1 with no assets and low sales comfort triggers
                  a blocker &mdash; because that combination has near-zero probability.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Passive income fantasy</p>
                <p className="text-xs text-slate-500">
                  Wanting passive income with low hours, low budget, and a short timeframe
                  is flagged because that combination does not exist for new businesses.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Budget &amp; skill mismatches</p>
                <p className="text-xs text-slate-500">
                  Detected when your constraints conflict with your income goals.
                  Each warning includes severity, explanation, and suggested adjustments.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Adaptive Questions</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The quiz adapts in real time based on your answers. Questions that are not relevant
            to you are never shown, keeping the experience short and focused.
          </p>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                Low hours &rarr; asks about side-hustle pace and passive income preference
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                Low sales comfort &rarr; asks about outreach willingness and partnerships
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                High tech comfort &rarr; asks about building software products
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                High income goal &rarr; asks about high-ticket offer comfort
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                Local scope &rarr; asks about physical labor and transportation
              </li>
            </ul>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you change an answer, follow-up questions that are no longer relevant
            are automatically removed &mdash; keeping your results accurate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Privacy &amp; Data</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your answers are stored only in your browser&rsquo;s localStorage. Nothing leaves
            your device unless you explicitly submit your email. No analytics, no tracking pixels,
            no cookies beyond what your browser provides natively.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
              <p className="text-lg font-bold text-emerald-800">0</p>
              <p className="text-[10px] text-emerald-600">Trackers</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center">
              <p className="text-lg font-bold text-emerald-800">0</p>
              <p className="text-[10px] text-emerald-600">Server-side data stored</p>
            </div>
          </div>
        </section>

        <Disclaimer variant="full" />
      </div>
    </LayoutShell>
  );
}
