import { AnswerState, RealityWarning, WarningSeverity } from '../types';

export function impliedHourlyRate(answers: AnswerState): number {
  const hours = Number(answers.hours_per_week) || 0;
  const profit = Number(answers.desired_monthly_profit) || 0;
  if (hours <= 0) return 0;
  return profit / (hours * 4.33);
}

export function realityMeterColor(warnings: RealityWarning[]): 'green' | 'yellow' | 'red' {
  if (warnings.some((w) => w.severity === 'blocker')) return 'red';
  if (warnings.some((w) => w.severity === 'warn')) return 'yellow';
  return 'green';
}

export function evaluateReality(answers: AnswerState): RealityWarning[] {
  const warnings: RealityWarning[] = [];
  const hours = Number(answers.hours_per_week) || 0;
  const budget = Number(answers.budget_upfront) || 0;
  const profit = Number(answers.desired_monthly_profit) || 0;
  const timeframe = Number(answers.timeframe_months) || 12;
  const salesComfort = Number(answers.sales_comfort) || 3;
  const marketingComfort = Number(answers.marketing_comfort) || 3;
  const techComfort = Number(answers.tech_comfort) || 3;
  const riskTolerance = Number(answers.risk_tolerance) || 3;
  const passivePref = Number(answers.passive_preference) || 0;
  const skills = (answers.existing_skills as string[]) || [];
  const assets = (answers.existing_assets as string[]) || [];
  const distributionStyle = answers.distribution_style as string;
  const workPref = answers.work_preference as string;
  const difficultyTolerance = Number(answers.difficulty_tolerance) || 3;

  const hourly = impliedHourlyRate(answers);
  const hasNoSkills = skills.length === 0 || (skills.length === 1 && skills[0] === 'none');
  const hasNoAssets = assets.length === 0 || (assets.length === 1 && assets[0] === 'none');

  // 1. Income vs hours — implied hourly rate
  if (hours > 0 && profit > 0) {
    if (hourly > 400) {
      warnings.push({
        id: 'extreme-hourly-rate',
        severity: 'blocker',
        title: 'Extremely high implied hourly rate',
        triggeredBecause: `You want $${profit.toLocaleString()}/month on ${hours} hours/week. That implies $${Math.round(hourly)}/hour — a rate only achievable with significant leverage, an established audience, or premium expertise.`,
        whyItMatters:
          'Less than 1% of professionals earn this rate. Without proven demand or a scalable model, this target is not realistic.',
        whatWouldNeedToBeTrue: [
          'You have a proven, high-demand skill (top 5% in your field)',
          'You have an existing audience or client pipeline',
          'You are building a leveraged product (SaaS, course) with validated demand',
          'You have a sales system that consistently closes high-ticket deals',
        ],
        waysToFix: [
          'Increase weekly hours',
          'Extend your timeframe',
          'Lower your income target',
          'Choose a highly leveraged business model',
        ],
      });
    } else if (hourly > 150) {
      warnings.push({
        id: 'high-hourly-rate',
        severity: 'warn',
        title: 'High implied hourly rate',
        triggeredBecause: `Your target implies $${Math.round(hourly)}/hour. This requires strong skills and effective sales or leverage.`,
        whyItMatters:
          'Earning $150+/hour is achievable but requires positioning, expertise, and a model that supports premium pricing.',
        whatWouldNeedToBeTrue: [
          'Your skill commands premium rates in the market',
          'You can close sales effectively or have inbound demand',
          'You are selling outcomes, not hours',
        ],
        waysToFix: [
          'Increase hours to lower the implied rate',
          'Focus on high-ticket or leveraged models',
          'Build a portfolio proving your value',
        ],
      });
    }
  }

  // 2. Income vs timeframe
  if (timeframe <= 1 && profit >= 10000 && hasNoAssets && salesComfort <= 2) {
    warnings.push({
      id: 'impossible-timeline',
      severity: 'blocker',
      title: 'Timeline is not realistic',
      triggeredBecause: `You want $${profit.toLocaleString()}/month within 1 month, but you have no existing assets and low sales comfort.`,
      whyItMatters:
        'Generating $10k+ in revenue within 30 days requires either an existing pipeline, established credibility, or aggressive sales execution.',
      whatWouldNeedToBeTrue: [
        'You have clients or leads ready to buy',
        'You have a high-ticket offer with proven demand',
        'You can do aggressive outreach (100+ conversations)',
      ],
      waysToFix: [
        'Extend timeline to 3–6 months',
        'Lower your first-month income target',
        'Start with a lower-ticket offer to build pipeline',
        'Increase sales activity commitment',
      ],
    });
  } else if (timeframe <= 3 && profit >= 10000 && hasNoAssets) {
    warnings.push({
      id: 'aggressive-timeline',
      severity: 'warn',
      title: 'Aggressive timeline for your goal',
      triggeredBecause: `$${profit.toLocaleString()}/month in ${timeframe} months without existing assets is aggressive.`,
      whyItMatters:
        'Most business models take 3–6 months to generate consistent revenue at this level.',
      whatWouldNeedToBeTrue: [
        'You focus entirely on fast-revenue models',
        'You commit to intensive outreach',
        'You have a marketable skill people will pay for immediately',
      ],
      waysToFix: [
        'Extend timeline to 6–12 months',
        'Start with a service-based model for faster revenue',
        'Lower initial target and ramp up',
      ],
    });
  }

  // 3. Passive income fantasy
  if (passivePref >= 4 && hours <= 5 && budget < 1000 && timeframe <= 6) {
    warnings.push({
      id: 'passive-fantasy',
      severity: 'blocker',
      title: 'Passive income requires upfront investment',
      triggeredBecause:
        'You want passive income with low hours, low budget, and a short timeframe. This combination does not exist.',
      whyItMatters:
        'Passive income comes from assets you build over time (products, content, software) or capital you invest. It requires significant upfront work or money.',
      whatWouldNeedToBeTrue: [
        'You invest 20+ hrs/week for 6–12 months building an asset',
        'OR you invest significant capital in ads or inventory',
        'OR you already have an audience/platform to monetize',
      ],
      waysToFix: [
        'Increase hours significantly during the build phase',
        'Extend timeframe to 12–24 months',
        'Increase budget for paid acquisition',
        'Accept active income models first, then transition',
      ],
    });
  } else if (passivePref >= 4 && hours <= 10) {
    warnings.push({
      id: 'passive-warning',
      severity: 'warn',
      title: 'Passive income takes longer than expected',
      triggeredBecause:
        'You prefer passive income but have limited hours. Building passive income streams usually requires intense initial effort.',
      whyItMatters:
        'Most "passive income" businesses require 6–18 months of active building before becoming hands-off.',
      whatWouldNeedToBeTrue: [
        'You are willing to work actively for the first 6–12 months',
        'You choose a leveraged model (content, software, courses)',
      ],
      waysToFix: [
        'Accept active income initially',
        'Plan for a longer transition to passive',
        'Increase hours during the build phase',
      ],
    });
  }

  // 4. Budget mismatch
  if (budget < 100 && profit >= 5000 && timeframe <= 3) {
    warnings.push({
      id: 'budget-mismatch',
      severity: 'warn',
      title: 'Budget may limit your options',
      triggeredBecause: `You have $${budget} budget but want $${profit.toLocaleString()}/month quickly. Some faster paths require investment in tools, ads, or inventory.`,
      whyItMatters:
        'Zero-budget models exist but usually involve trading time for money, which may conflict with your time constraints.',
      whatWouldNeedToBeTrue: [
        'You focus on service-based models (no capital needed)',
        'You compensate with higher hours or longer timeline',
        'You use free tools and organic growth channels',
      ],
      waysToFix: [
        'Increase budget if possible',
        'Focus on service models first to generate capital',
        'Extend timeframe to allow organic growth',
      ],
    });
  }

  // 5. Skill-to-goal gap
  if (hasNoSkills && profit >= 5000) {
    warnings.push({
      id: 'skill-gap',
      severity: 'warn',
      title: 'Skill development needed',
      triggeredBecause: `You selected no existing skills but want $${profit.toLocaleString()}/month. Most models at this income level require marketable skills.`,
      whyItMatters:
        'Without skills, you are limited to low-skill, high-hustle models or need time to learn.',
      whatWouldNeedToBeTrue: [
        'You invest time learning a marketable skill (2–4 weeks intensive)',
        'OR you start with low-skill models (reselling, local services)',
        'OR you partner with someone who has skills',
      ],
      waysToFix: [
        'Invest first months in skill-building',
        'Start with simpler models and upskill alongside',
        'Find a partner with complementary skills',
      ],
    });
  }

  // 6. Risk mismatch
  if (riskTolerance <= 2 && profit >= 10000 && hours <= 15) {
    warnings.push({
      id: 'risk-mismatch',
      severity: 'info',
      title: 'Your risk tolerance may limit high-income models',
      triggeredBecause: `You want $${profit.toLocaleString()}/month with low risk, but higher-income models at ${hours} hrs/week often require accepting more risk.`,
      whyItMatters:
        'Low risk + low time + high income is an extremely narrow intersection. The options that exist usually require high skill or leverage.',
      whatWouldNeedToBeTrue: [
        'You have an exceptionally high-value skill',
        'You build slowly with a leveraged model over time',
      ],
      waysToFix: [
        'Slightly increase risk tolerance',
        'Increase hours or extend timeframe',
        'Lower income target for lower-risk models',
      ],
    });
  }

  // 7. No distribution plan
  if (!distributionStyle && Object.keys(answers).length > 10) {
    warnings.push({
      id: 'no-distribution',
      severity: 'info',
      title: 'Distribution strategy undefined',
      triggeredBecause: 'You have not specified how you plan to reach customers.',
      whyItMatters:
        'The best product or service will fail without a way to reach buyers. Distribution is the #1 challenge for most businesses.',
      whatWouldNeedToBeTrue: [
        'You pick at least one primary growth channel',
        'You commit to it consistently for 3+ months',
      ],
      waysToFix: [
        'Choose a distribution channel that matches your skills',
        'Start with outbound if you need fast results',
        'Start with content if you have a longer timeline',
      ],
    });
  }

  // 8. No moat — solo, no skills, no assets
  if (hasNoSkills && hasNoAssets && workPref === 'mostly-solo') {
    warnings.push({
      id: 'no-moat',
      severity: 'warn',
      title: 'No competitive advantage yet',
      triggeredBecause:
        'You have no existing skills, no assets, and prefer to work alone. This makes differentiation very difficult.',
      whyItMatters:
        'Without a skill, audience, or network advantage, you will compete purely on effort — which is unsustainable long-term.',
      whatWouldNeedToBeTrue: [
        'You develop a skill quickly (4–8 weeks of focused learning)',
        'OR you leverage effort-based models that build skills over time',
        'OR you find a partner who complements your gaps',
      ],
      waysToFix: [
        'Learn one high-value skill',
        'Build a local network',
        'Start with a model that develops skills (e.g., freelancing)',
      ],
    });
  }

  // 9. Complex model + low hours
  if (hours <= 10 && difficultyTolerance >= 4 && profit >= 5000) {
    warnings.push({
      id: 'complex-low-hours',
      severity: 'warn',
      title: 'Complex models need more hours',
      triggeredBecause: `You are open to complex models but only have ${hours} hrs/week. Complex models (agency, SaaS, marketplace) typically need 20+ hrs/week to execute well.`,
      whyItMatters:
        'Underinvesting time in complex models leads to poor execution and failure. Simpler models may work better with your time budget.',
      whatWouldNeedToBeTrue: [
        'You focus only on the highest-leverage activities',
        'You outsource or automate everything else',
        'You have capital to hire help',
      ],
      waysToFix: [
        'Increase hours for the initial build phase',
        'Choose a simpler model',
        'Save complex models for when you have more time',
      ],
    });
  }

  return warnings;
}
