import { z } from 'zod';
import { Question, AnswerState, QuestionPhase, DemoPreset } from '../types';

const alwaysVisible = () => true;

function impliedHourlyRate(answers: AnswerState): number {
  const hours = Number(answers.hours_per_week) || 0;
  const profit = Number(answers.desired_monthly_profit) || 0;
  if (hours <= 0) return 0;
  return profit / (hours * 4.33);
}

export const questions: Question[] = [
  // ── CAPACITY PHASE ──
  {
    id: 'hours_per_week',
    title: 'Available Hours',
    prompt: 'How many hours per week can you realistically dedicate?',
    helperText:
      'Be honest — overestimating leads to burnout. Include all time: learning, building, selling, admin.',
    type: 'slider',
    min: 1,
    max: 60,
    step: 1,
    unit: 'hrs/week',
    validation: z.number().min(1).max(60),
    visibility: alwaysVisible,
    priority: 1,
    phase: 'capacity',
    dependsOn: [],
  },
  {
    id: 'budget_upfront',
    title: 'Upfront Budget',
    prompt: 'How much can you invest upfront (in dollars)?',
    helperText:
      'This is money you can afford to lose. Do not count rent or emergency savings.',
    type: 'number',
    min: 0,
    max: 100000,
    step: 50,
    unit: '$',
    validation: z.number().min(0),
    visibility: alwaysVisible,
    priority: 2,
    phase: 'capacity',
    dependsOn: [],
  },
  {
    id: 'desired_monthly_profit',
    title: 'Income Goal',
    prompt: 'What monthly profit are you targeting?',
    helperText:
      'After all costs. We will reality-check this against your time and budget.',
    type: 'number',
    min: 0,
    max: 200000,
    step: 100,
    unit: '$/month',
    validation: z.number().min(0),
    visibility: alwaysVisible,
    priority: 3,
    phase: 'capacity',
    dependsOn: [],
  },
  {
    id: 'timeframe_months',
    title: 'Timeframe',
    prompt: 'By when do you want to reach this income?',
    helperText:
      'Shorter timeframes limit your options. Longer ones open up slower but more leveraged models.',
    type: 'select',
    options: [
      { value: '1', label: '1 month', description: 'Very aggressive — limits options significantly' },
      { value: '3', label: '3 months', description: 'Ambitious but achievable for simple models' },
      { value: '6', label: '6 months', description: 'Reasonable for most approaches' },
      { value: '12', label: '12 months', description: 'Good for building leverage' },
      { value: '24', label: '24 months', description: 'Allows for audience/product building' },
    ],
    validation: z.string().refine((v) => ['1', '3', '6', '12', '24'].includes(v)),
    visibility: alwaysVisible,
    priority: 4,
    phase: 'capacity',
    dependsOn: [],
  },

  // ── CONSTRAINTS PHASE ──
  {
    id: 'difficulty_tolerance',
    title: 'Difficulty Tolerance',
    prompt: 'How hard are you willing to work on complex problems?',
    helperText:
      'Higher tolerance opens high-leverage models (SaaS, agencies). Lower prefers simpler execution.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: alwaysVisible,
    priority: 5,
    phase: 'constraints',
    dependsOn: [],
  },
  {
    id: 'risk_tolerance',
    title: 'Risk Tolerance',
    prompt: 'How much financial and time risk are you okay with?',
    helperText:
      '1 = I cannot afford to lose anything. 5 = I am comfortable with significant risk for larger upside.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: alwaysVisible,
    priority: 6,
    phase: 'constraints',
    dependsOn: [],
  },

  // ── PREFERENCES PHASE ──
  {
    id: 'work_preference',
    title: 'Work Style',
    prompt: 'What kind of work environment do you prefer?',
    helperText:
      'People-facing = lots of calls and client interaction. Solo = heads-down, independent work.',
    type: 'select',
    options: [
      { value: 'people-facing', label: 'People-facing', description: 'Calls, meetings, client work' },
      { value: 'mixed', label: 'Mixed', description: 'Some interaction, some solo time' },
      { value: 'mostly-solo', label: 'Mostly solo', description: 'Independent, minimal meetings' },
    ],
    validation: z.string(),
    visibility: alwaysVisible,
    priority: 7,
    phase: 'preferences',
    dependsOn: [],
  },
  {
    id: 'sales_comfort',
    title: 'Sales Comfort',
    prompt: 'How comfortable are you with selling and persuasion?',
    helperText:
      '1 = Terrified. 5 = Natural closer. Most business models need some selling.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: alwaysVisible,
    priority: 8,
    phase: 'preferences',
    dependsOn: [],
  },
  {
    id: 'marketing_comfort',
    title: 'Marketing Comfort',
    prompt: 'How comfortable are you with marketing and content creation?',
    helperText:
      'Includes writing, social media, video, email marketing. Essential for most models.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: alwaysVisible,
    priority: 9,
    phase: 'preferences',
    dependsOn: [],
  },
  {
    id: 'tech_comfort',
    title: 'Technical Comfort',
    prompt: 'How comfortable are you with technology and tools?',
    helperText:
      '1 = Basic computer use only. 5 = Can build apps and automate workflows.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: alwaysVisible,
    priority: 10,
    phase: 'preferences',
    dependsOn: [],
  },

  // ── SKILLS PHASE ──
  {
    id: 'existing_skills',
    title: 'Existing Skills',
    prompt: 'Which skills do you already have?',
    helperText:
      'Be honest. These boost your score for models that leverage them.',
    type: 'multi-select',
    options: [
      { value: 'sales', label: 'Sales' },
      { value: 'writing', label: 'Writing' },
      { value: 'design', label: 'Design' },
      { value: 'coding', label: 'Coding / Programming' },
      { value: 'ops', label: 'Operations / Project Management' },
      { value: 'finance', label: 'Finance / Accounting' },
      { value: 'customer support', label: 'Customer Support' },
      { value: 'video', label: 'Video / Photography' },
      { value: 'leadership', label: 'Leadership / Management' },
      { value: 'none', label: 'None of the above' },
    ],
    validation: z.array(z.string()).min(1),
    visibility: alwaysVisible,
    priority: 11,
    phase: 'skills',
    dependsOn: [],
  },
  {
    id: 'existing_assets',
    title: 'Existing Assets',
    prompt: 'What assets do you already have?',
    helperText:
      'These are things that give you a head start.',
    type: 'multi-select',
    options: [
      { value: 'audience', label: 'Online audience (followers, subscribers)' },
      { value: 'email list', label: 'Email list' },
      { value: 'local network', label: 'Strong local network' },
      { value: 'portfolio', label: 'Portfolio / Case studies' },
      { value: 'capital', label: 'Significant capital to invest' },
      { value: 'niche expertise', label: 'Deep niche expertise' },
      { value: 'none', label: 'None of the above' },
    ],
    validation: z.array(z.string()).min(1),
    visibility: alwaysVisible,
    priority: 12,
    phase: 'skills',
    dependsOn: [],
  },

  // ── DISTRIBUTION PHASE ──
  {
    id: 'location_scope',
    title: 'Location Scope',
    prompt: 'Where do you want to operate?',
    helperText:
      'Local limits your market but enables in-person services. Online opens global reach.',
    type: 'select',
    options: [
      { value: 'local', label: 'Local only', description: 'Within your city or area' },
      { value: 'online', label: 'Online only', description: 'Remote, global reach' },
      { value: 'both', label: 'Both', description: 'Flexible — local and online' },
    ],
    validation: z.string(),
    visibility: alwaysVisible,
    priority: 13,
    phase: 'distribution',
    dependsOn: [],
  },
  {
    id: 'distribution_style',
    title: 'Growth Channel Preference',
    prompt: 'How do you prefer to get customers?',
    helperText:
      'This affects which models will work best for you.',
    type: 'select',
    options: [
      { value: 'outbound', label: 'Direct outreach', description: 'Cold email, DMs, networking' },
      { value: 'content', label: 'Content & SEO', description: 'Blog, YouTube, social media' },
      { value: 'ads', label: 'Paid advertising', description: 'Facebook, Google, TikTok ads' },
      { value: 'referrals', label: 'Referrals & word of mouth', description: 'Organic network growth' },
      { value: 'marketplace', label: 'Marketplaces', description: 'Upwork, Etsy, Amazon' },
    ],
    validation: z.string(),
    visibility: alwaysVisible,
    priority: 14,
    phase: 'distribution',
    dependsOn: [],
  },
  {
    id: 'offer_format',
    title: 'Offer Format',
    prompt: 'What type of offer appeals to you most?',
    helperText:
      'Services trade time for money. Products have upfront cost but can scale. Recurring gives stability.',
    type: 'select',
    options: [
      { value: 'service', label: 'Done-for-you service' },
      { value: 'product', label: 'Digital or physical product' },
      { value: 'subscription', label: 'Subscription / recurring' },
      { value: 'consulting', label: 'Consulting / coaching' },
      { value: 'flexible', label: 'Open to anything' },
    ],
    validation: z.string(),
    visibility: alwaysVisible,
    priority: 15,
    phase: 'distribution',
    dependsOn: [],
  },

  // ── ADAPTIVE FOLLOW-UPS ──
  {
    id: 'side_hustle_pace',
    title: 'Side Hustle Pace',
    prompt: 'Are you okay with a side-hustle pace? (slower growth, less intensity)',
    helperText:
      'With 5 or fewer hours per week, progress will be slow. That is fine — but expectations must match.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I am patient' },
      { value: 'no', label: 'No, I want faster results' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.hours_per_week) > 0 && Number(a.hours_per_week) <= 5,
    priority: 20,
    phase: 'goals_refinement',
    dependsOn: ['hours_per_week'],
    skipAllowed: true,
  },
  {
    id: 'passive_preference',
    title: 'Passive Income Preference',
    prompt: 'How important is passive / hands-off income to you?',
    helperText:
      'True passive income usually requires large upfront investment of time, money, or both.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: (a) => Number(a.hours_per_week) > 0 && Number(a.hours_per_week) <= 5,
    priority: 21,
    phase: 'goals_refinement',
    dependsOn: ['hours_per_week'],
    skipAllowed: true,
  },
  {
    id: 'high_ticket_or_leverage',
    title: 'High Ticket vs Leverage',
    prompt: 'Your implied hourly rate is high. Do you prefer high-ticket offers or leveraged/scalable ones?',
    helperText:
      'High-ticket = fewer clients, higher price. Leverage = automation, products, one-to-many.',
    type: 'select',
    options: [
      { value: 'high-ticket', label: 'High-ticket (premium pricing)' },
      { value: 'leverage', label: 'Leverage (scalable, one-to-many)' },
      { value: 'either', label: 'Open to either' },
    ],
    validation: z.string(),
    visibility: (a) => impliedHourlyRate(a) > 100,
    priority: 22,
    phase: 'goals_refinement',
    dependsOn: ['hours_per_week', 'desired_monthly_profit'],
    skipAllowed: true,
  },
  {
    id: 'proof_of_demand',
    title: 'Proof of Demand',
    prompt: 'Do you already have evidence that people will pay for what you want to offer?',
    helperText:
      'Past clients, waitlist signups, or direct requests from potential customers.',
    type: 'select',
    options: [
      { value: 'strong', label: 'Yes — past clients or strong signals' },
      { value: 'some', label: 'Some interest, not validated yet' },
      { value: 'none', label: 'No evidence yet' },
    ],
    validation: z.string(),
    visibility: (a) => impliedHourlyRate(a) > 100,
    priority: 23,
    phase: 'goals_refinement',
    dependsOn: ['hours_per_week', 'desired_monthly_profit'],
    skipAllowed: true,
  },
  {
    id: 'willing_outreach_anyway',
    title: 'Outreach Willingness',
    prompt: 'You rated sales comfort low. Are you willing to do some outreach anyway to get started?',
    helperText:
      'Most fast-revenue models require some form of direct outreach at the beginning.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I will push through it' },
      { value: 'no', label: 'No, I really cannot do outreach' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.sales_comfort) > 0 && Number(a.sales_comfort) <= 2,
    priority: 24,
    phase: 'goals_refinement',
    dependsOn: ['sales_comfort'],
    skipAllowed: true,
  },
  {
    id: 'partner_with_sales_person',
    title: 'Sales Partner',
    prompt: 'Would you consider partnering with someone who handles sales?',
    helperText:
      'A co-founder or contractor who does sales while you do delivery.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I am open to it' },
      { value: 'no', label: 'No, I want to work alone' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.sales_comfort) > 0 && Number(a.sales_comfort) <= 2,
    priority: 25,
    phase: 'goals_refinement',
    dependsOn: ['sales_comfort'],
    skipAllowed: true,
  },
  {
    id: 'willing_learn_marketing',
    title: 'Learn Marketing',
    prompt: 'Are you willing to learn marketing basics?',
    helperText:
      'Even a few hours per week on marketing education can dramatically improve your results.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I will learn' },
      { value: 'no', label: 'No, I want to avoid marketing' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.marketing_comfort) > 0 && Number(a.marketing_comfort) <= 2,
    priority: 26,
    phase: 'goals_refinement',
    dependsOn: ['marketing_comfort'],
    skipAllowed: true,
  },
  {
    id: 'preferred_channel',
    title: 'Preferred Channel',
    prompt: 'If you had to pick one marketing channel, which feels least painful?',
    helperText:
      'Pick the one you could see yourself doing consistently for 6+ months.',
    type: 'select',
    options: [
      { value: 'writing', label: 'Writing (blogs, tweets, newsletters)' },
      { value: 'video', label: 'Video (YouTube, TikTok, Reels)' },
      { value: 'community', label: 'Community (forums, groups, Discord)' },
      { value: 'ads', label: 'Paid ads (set it and optimize)' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.marketing_comfort) > 0 && Number(a.marketing_comfort) <= 2,
    priority: 27,
    phase: 'goals_refinement',
    dependsOn: ['marketing_comfort'],
    skipAllowed: true,
  },
  {
    id: 'open_building_software',
    title: 'Build Software',
    prompt: 'Are you open to building a software product?',
    helperText:
      'Your tech comfort is high. Software products can generate recurring, leveraged revenue.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I want to build something' },
      { value: 'no', label: 'No, I prefer services or other models' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.tech_comfort) >= 4,
    priority: 28,
    phase: 'goals_refinement',
    dependsOn: ['tech_comfort'],
    skipAllowed: true,
  },
  {
    id: 'build_preference',
    title: 'Build Preference',
    prompt: 'What would you prefer to build?',
    helperText:
      'Each has different skill requirements and market dynamics.',
    type: 'select',
    options: [
      { value: 'web-app', label: 'Web application (SaaS)' },
      { value: 'mobile', label: 'Mobile app' },
      { value: 'automations', label: 'Automations and integrations' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.tech_comfort) >= 4 && a.open_building_software === 'yes',
    priority: 29,
    phase: 'goals_refinement',
    dependsOn: ['tech_comfort', 'open_building_software'],
    skipAllowed: true,
  },
  {
    id: 'open_high_ticket',
    title: 'High-Ticket Offers',
    prompt: 'Are you open to selling high-ticket offers ($2,000+)?',
    helperText:
      'With a $10k+ income goal, high-ticket offers let you reach it with fewer clients.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I can deliver premium value' },
      { value: 'no', label: 'No, I prefer lower price points' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.desired_monthly_profit) >= 10000,
    priority: 30,
    phase: 'goals_refinement',
    dependsOn: ['desired_monthly_profit'],
    skipAllowed: true,
  },
  {
    id: 'premium_delivery_comfort',
    title: 'Premium Delivery Comfort',
    prompt: 'How comfortable are you delivering a premium, high-touch experience?',
    helperText:
      'High-ticket clients expect exceptional service, communication, and results.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: (a) => Number(a.desired_monthly_profit) >= 10000 && a.open_high_ticket === 'yes',
    priority: 31,
    phase: 'goals_refinement',
    dependsOn: ['desired_monthly_profit', 'open_high_ticket'],
    skipAllowed: true,
  },
  {
    id: 'willing_paid_ads',
    title: 'Paid Advertising',
    prompt: 'Are you willing to invest in paid advertising?',
    helperText:
      'Your budget allows it. Ads accelerate growth but carry financial risk.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I will test ads' },
      { value: 'no', label: 'No, I prefer organic growth' },
    ],
    validation: z.string(),
    visibility: (a) => Number(a.budget_upfront) >= 2000,
    priority: 32,
    phase: 'goals_refinement',
    dependsOn: ['budget_upfront'],
    skipAllowed: true,
  },
  {
    id: 'ad_risk_comfort',
    title: 'Ad Risk Comfort',
    prompt: 'How comfortable are you risking money on ads before seeing returns?',
    helperText:
      'Ads often take weeks or months of testing before becoming profitable.',
    type: 'slider',
    min: 1,
    max: 5,
    step: 1,
    validation: z.number().min(1).max(5),
    visibility: (a) => Number(a.budget_upfront) >= 2000 && a.willing_paid_ads === 'yes',
    priority: 33,
    phase: 'goals_refinement',
    dependsOn: ['budget_upfront', 'willing_paid_ads'],
    skipAllowed: true,
  },
  {
    id: 'physical_labor_comfort',
    title: 'Physical Work',
    prompt: 'Are you comfortable with physical or hands-on work?',
    helperText:
      'Local service businesses often involve physical labor.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes, I enjoy hands-on work' },
      { value: 'no', label: 'No, I prefer desk work' },
    ],
    validation: z.string(),
    visibility: (a) => a.location_scope === 'local' || a.location_scope === 'both',
    priority: 34,
    phase: 'goals_refinement',
    dependsOn: ['location_scope'],
    skipAllowed: true,
  },
  {
    id: 'transportation_access',
    title: 'Transportation',
    prompt: 'Do you have reliable transportation for local work?',
    helperText:
      'Many local service businesses require visiting client locations.',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    validation: z.string(),
    visibility: (a) => a.location_scope === 'local' || a.location_scope === 'both',
    priority: 35,
    phase: 'goals_refinement',
    dependsOn: ['location_scope'],
    skipAllowed: true,
  },
];

const phaseOrder: QuestionPhase[] = [
  'capacity',
  'constraints',
  'preferences',
  'skills',
  'distribution',
  'goals_refinement',
];

export function isQuestionVisible(question: Question, answers: AnswerState): boolean {
  return question.visibility(answers);
}

export function getVisibleQuestions(answers: AnswerState): Question[] {
  return questions
    .filter((q) => isQuestionVisible(q, answers))
    .sort((a, b) => {
      const phaseA = phaseOrder.indexOf(a.phase);
      const phaseB = phaseOrder.indexOf(b.phase);
      if (phaseA !== phaseB) return phaseA - phaseB;
      return a.priority - b.priority;
    });
}

export function getNextQuestionId(
  currentId: string | null,
  answers: AnswerState
): string | null {
  const visible = getVisibleQuestions(answers);
  if (!currentId) return visible[0]?.id ?? null;
  const currentIndex = visible.findIndex((q) => q.id === currentId);
  if (currentIndex === -1) return visible[0]?.id ?? null;

  for (let i = currentIndex + 1; i < visible.length; i++) {
    if (answers[visible[i].id] === undefined) {
      return visible[i].id;
    }
  }

  for (let i = 0; i < currentIndex; i++) {
    if (answers[visible[i].id] === undefined) {
      return visible[i].id;
    }
  }

  return null;
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getProgress(answers: AnswerState): {
  answered: number;
  total: number;
  percent: number;
} {
  const visible = getVisibleQuestions(answers);
  const answered = visible.filter((q) => answers[q.id] !== undefined).length;
  const total = visible.length;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  return { answered, total, percent };
}

export function isQuizComplete(answers: AnswerState): boolean {
  const visible = getVisibleQuestions(answers);
  const coreQuestions = visible.filter((q) => !q.skipAllowed);
  return coreQuestions.every((q) => answers[q.id] !== undefined);
}

export const demoPresets: DemoPreset[] = [
  {
    name: 'Unrealistic Fantasy',
    description:
      '2 hrs/week, $0 budget, wants $20k/mo in 1 month, low sales comfort',
    answers: {
      hours_per_week: 2,
      budget_upfront: 0,
      desired_monthly_profit: 20000,
      timeframe_months: '1',
      difficulty_tolerance: 2,
      risk_tolerance: 1,
      work_preference: 'mostly-solo',
      sales_comfort: 1,
      marketing_comfort: 1,
      tech_comfort: 2,
      existing_skills: ['none'],
      existing_assets: ['none'],
      location_scope: 'online',
      distribution_style: 'referrals',
      offer_format: 'product',
      side_hustle_pace: 'no',
      passive_preference: 5,
    },
  },
  {
    name: 'Realistic Side Hustle',
    description:
      '8 hrs/week, $300 budget, wants $2k/mo in 6 months',
    answers: {
      hours_per_week: 8,
      budget_upfront: 300,
      desired_monthly_profit: 2000,
      timeframe_months: '6',
      difficulty_tolerance: 3,
      risk_tolerance: 3,
      work_preference: 'mixed',
      sales_comfort: 3,
      marketing_comfort: 3,
      tech_comfort: 3,
      existing_skills: ['writing', 'ops'],
      existing_assets: ['local network'],
      location_scope: 'both',
      distribution_style: 'referrals',
      offer_format: 'service',
    },
  },
  {
    name: 'High-Commitment Builder',
    description:
      '25 hrs/week, $2k budget, wants $10k/mo in 12 months, moderate sales',
    answers: {
      hours_per_week: 25,
      budget_upfront: 2000,
      desired_monthly_profit: 10000,
      timeframe_months: '12',
      difficulty_tolerance: 4,
      risk_tolerance: 4,
      work_preference: 'mixed',
      sales_comfort: 3,
      marketing_comfort: 3,
      tech_comfort: 4,
      existing_skills: ['coding', 'ops', 'writing'],
      existing_assets: ['portfolio', 'niche expertise'],
      location_scope: 'online',
      distribution_style: 'content',
      offer_format: 'flexible',
      open_building_software: 'yes',
      build_preference: 'web-app',
      open_high_ticket: 'yes',
      premium_delivery_comfort: 4,
      willing_paid_ads: 'yes',
      ad_risk_comfort: 3,
    },
  },
];
