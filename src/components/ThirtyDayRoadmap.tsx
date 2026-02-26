import type { ScoredResult } from '../types';
import { PremiumLock } from './PremiumLock';

interface ThirtyDayRoadmapProps {
  result: ScoredResult;
}

const WEEK_THEMES = [
  { week: 'Week 1', theme: 'Validate & launch', icon: '🚀' },
  { week: 'Week 2', theme: 'Get first feedback', icon: '💬' },
  { week: 'Week 3', theme: 'Iterate & optimize', icon: '🔧' },
  { week: 'Week 4', theme: 'Scale what works', icon: '📈' },
];

function buildRoadmap(result: ScoredResult) {
  const { model } = result;
  const plan = model.first7DaysPlan;

  return [
    {
      ...WEEK_THEMES[0],
      tasks: plan.slice(0, 4).map((s) => s.replace(/^Day \d+:\s*/, '')),
    },
    {
      ...WEEK_THEMES[1],
      tasks: [
        plan.length > 4 ? plan[4].replace(/^Day \d+:\s*/, '') : 'Follow up with first contacts',
        'Collect feedback from early interactions',
        `Refine your offer based on responses`,
        model.requiresOutreach ? 'Double your outreach volume' : 'Improve your content or listing',
      ],
    },
    {
      ...WEEK_THEMES[2],
      tasks: [
        'Analyze what got the best response',
        'Drop what isn\u2019t working',
        model.requiresConsistency
          ? 'Build a daily routine around your best channel'
          : 'Test a second distribution channel',
        'Set a weekly revenue target',
      ],
    },
    {
      ...WEEK_THEMES[3],
      tasks: [
        'Document your working process',
        model.scalabilityType === 'leverage'
          ? 'Start building assets that compound (templates, content, automations)'
          : 'Explore hiring help or raising prices',
        'Set 60-day goals based on Week 1\u20134 data',
        'Decide: double down or pivot',
      ],
    },
  ];
}

export function ThirtyDayRoadmap({ result }: ThirtyDayRoadmapProps) {
  const roadmap = buildRoadmap(result);

  return (
    <PremiumLock feature="thirtyDayRoadmap">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50">
            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">30-Day Roadmap</h3>
            <p className="text-[10px] text-slate-500">Personalized for {result.model.title}</p>
          </div>
        </div>

        <div className="space-y-4">
          {roadmap.map((week) => (
            <div key={week.week} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{week.icon}</span>
                <span className="text-xs font-bold text-slate-800">{week.week}</span>
                <span className="text-xs text-slate-500">&mdash; {week.theme}</span>
              </div>
              <ul className="space-y-1.5">
                {week.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PremiumLock>
  );
}
