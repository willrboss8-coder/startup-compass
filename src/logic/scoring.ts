import { AnswerState, BusinessModel, ScoredResult, FitBreakdown, RealityWarning } from '../types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function timeFit(answers: AnswerState, model: BusinessModel): number {
  const hours = Number(answers.hours_per_week) || 10;
  const { min, max } = model.typicalHours;
  if (hours >= min && hours <= max) return 100;
  if (hours >= min) return clamp(100 - (hours - max) * 3);
  const deficit = min - hours;
  return clamp(100 - deficit * 8);
}

function budgetFit(answers: AnswerState, model: BusinessModel): number {
  const budget = Number(answers.budget_upfront) || 0;
  const { min } = model.budget;
  if (budget >= min) return 100;
  if (min === 0) return 100;
  return clamp((budget / min) * 100);
}

function timelineRealism(answers: AnswerState, model: BusinessModel): number {
  const months = Number(answers.timeframe_months) || 6;
  const weeks = months * 4.33;
  const { minWeeks } = model.timeToFirstDollar;
  if (weeks >= minWeeks * 2) return 100;
  if (weeks >= minWeeks) return clamp(60 + ((weeks - minWeeks) / minWeeks) * 40);
  return clamp((weeks / minWeeks) * 60);
}

function preferenceAlignment(answers: AnswerState, model: BusinessModel): number {
  let score = 50;
  const workPref = answers.work_preference as string;
  if (workPref === 'mostly-solo' && !model.requiresOutreach && !model.requiresPublicPresence) {
    score += 30;
  } else if (workPref === 'people-facing' && model.requiresOutreach) {
    score += 25;
  } else if (workPref === 'mixed') {
    score += 15;
  }

  const offerFormat = answers.offer_format as string;
  if (offerFormat && offerFormat !== 'flexible') {
    const formatMap: Record<string, string[]> = {
      service: ['one-time service', 'recurring contract', 'project-based', 'retainer', 'hourly', 'monthly retainer'],
      product: ['one-time purchase', 'bundle', 'self-paced course'],
      subscription: ['monthly subscription', 'monthly membership', 'annual membership', 'freemium'],
      consulting: ['hourly sessions', 'package deal', 'monthly retainer'],
    };
    const preferred = formatMap[offerFormat] || [];
    if (model.offerFormats.some((f) => preferred.includes(f))) score += 20;
  } else {
    score += 10;
  }

  return clamp(score);
}

function distributionMatch(answers: AnswerState, model: BusinessModel): number {
  let score = 50;
  const dist = answers.distribution_style as string;
  const loc = answers.location_scope as string;

  if (dist) {
    const channelMap: Record<string, string[]> = {
      outbound: ['cold email', 'linkedin', 'door-to-door', 'referrals', 'cold email to brands'],
      content: ['seo', 'youtube', 'twitter', 'tiktok', 'instagram', 'pinterest', 'social media', 'substack', 'content marketing'],
      ads: ['paid ads', 'facebook ads', 'google ads'],
      referrals: ['referrals', 'local network', 'partnerships', 'cross-promos', 'word of mouth'],
      marketplace: ['upwork', 'etsy', 'amazon', 'amazon fba', 'redbubble', 'merch by amazon', 'poshmark', 'ebay', 'facebook marketplace', 'gumroad'],
    };
    const preferred = channelMap[dist] || [];
    const overlap = model.distributionChannels.filter((c) => preferred.includes(c));
    score += overlap.length > 0 ? 30 : -10;
  }

  if (loc === 'local' && !model.distributionChannels.some((c) =>
    ['local network', 'door-to-door', 'flyers', 'nextdoor', 'facebook groups', 'facebook marketplace', 'local directories', 'google maps'].includes(c)
  )) {
    score -= 20;
  }
  if (loc === 'online' && model.distributionChannels.some((c) =>
    ['door-to-door', 'flyers', 'nextdoor'].includes(c)
  ) && !model.distributionChannels.some((c) => ['seo', 'twitter', 'youtube', 'linkedin', 'cold email', 'paid ads', 'upwork'].includes(c))) {
    score -= 20;
  }

  return clamp(score);
}

function salesMarketingFit(answers: AnswerState, model: BusinessModel): number {
  let score = 60;
  const salesComfort = Number(answers.sales_comfort) || 3;
  const marketingComfort = Number(answers.marketing_comfort) || 3;

  if (model.requiresOutreach) {
    if (salesComfort <= 2) {
      const willingOutreach = answers.willing_outreach_anyway === 'yes';
      score -= willingOutreach ? 10 : 30;
    } else {
      score += (salesComfort - 3) * 8;
    }
  }

  if (model.requiresPublicPresence) {
    if (marketingComfort <= 2) {
      const willingLearn = answers.willing_learn_marketing === 'yes';
      score -= willingLearn ? 8 : 25;
    } else {
      score += (marketingComfort - 3) * 8;
    }
  }

  if (model.requiresConsistency) {
    score += 5;
  }

  return clamp(score);
}

function skillAssetMatch(answers: AnswerState, model: BusinessModel): number {
  let score = 40;
  const skills = (answers.existing_skills as string[]) || [];
  const assets = (answers.existing_assets as string[]) || [];

  const skillOverlap = model.skillTags.filter((s) => skills.includes(s));
  score += skillOverlap.length * 15;

  if (assets.includes('audience') && model.requiresPublicPresence) score += 15;
  if (assets.includes('email list') && model.distributionChannels.includes('email list')) score += 15;
  if (assets.includes('local network') && model.distributionChannels.some((c) =>
    ['local network', 'referrals', 'door-to-door'].includes(c)
  )) score += 10;
  if (assets.includes('portfolio')) score += 8;
  if (assets.includes('capital') && model.budget.min > 500) score += 10;
  if (assets.includes('niche expertise')) score += 12;

  return clamp(score);
}

function buildExplanation(
  answers: AnswerState,
  model: BusinessModel,
  breakdown: FitBreakdown
): { explanation: string; topReasons: string[]; topMismatches: string[] } {
  const hours = Number(answers.hours_per_week) || 10;
  const budget = Number(answers.budget_upfront) || 0;
  const profit = Number(answers.desired_monthly_profit) || 0;
  const skills = (answers.existing_skills as string[]) || [];

  const reasons: string[] = [];
  const mismatches: string[] = [];

  if (breakdown.timeFit >= 80) reasons.push(`Your ${hours} hrs/week fits within the typical ${model.typicalHours.min}–${model.typicalHours.max} hour range`);
  else if (breakdown.timeFit < 50) mismatches.push(`Needs ${model.typicalHours.min}–${model.typicalHours.max} hrs/week; you have ${hours}`);

  if (breakdown.budgetFit >= 80) reasons.push(`Your $${budget} budget covers the startup costs`);
  else if (breakdown.budgetFit < 50) mismatches.push(`Typically requires $${model.budget.min}+ budget`);

  if (breakdown.timelineRealism >= 80) reasons.push(`Timeline is realistic for first revenue`);
  else if (breakdown.timelineRealism < 50) mismatches.push(`First revenue typically takes ${model.timeToFirstDollar.minWeeks}–${model.timeToFirstDollar.maxWeeks} weeks`);

  if (breakdown.skillAssetMatch >= 70) {
    const overlap = model.skillTags.filter((s) => skills.includes(s));
    if (overlap.length > 0) reasons.push(`Your skills in ${overlap.join(', ')} are directly applicable`);
  } else if (breakdown.skillAssetMatch < 40) {
    mismatches.push(`Requires skills you may not have yet: ${model.skillTags.join(', ')}`);
  }

  if (breakdown.salesMarketingFit >= 70) reasons.push(`Your sales/marketing comfort matches this model`);
  else if (breakdown.salesMarketingFit < 40) mismatches.push(`Requires sales or marketing effort you may find uncomfortable`);

  if (breakdown.distributionMatch >= 70) reasons.push(`Your preferred growth channel aligns well`);
  else if (breakdown.distributionMatch < 40) mismatches.push(`Growth channels don't match your preference`);

  if (breakdown.preferenceAlignment >= 70) reasons.push(`Work style and offer format match your preferences`);

  const topReasons = reasons.slice(0, 3);
  const topMismatches = mismatches.slice(0, 2);

  const parts: string[] = [];
  if (topReasons.length > 0) parts.push(topReasons[0] + '.');
  if (profit > 0) parts.push(`At $${profit.toLocaleString()}/mo target, this model can reach first revenue in ${model.timeToFirstDollar.minWeeks}–${model.timeToFirstDollar.maxWeeks} weeks.`);
  if (topMismatches.length > 0) parts.push(`Watch out: ${topMismatches[0].toLowerCase()}.`);

  return {
    explanation: parts.join(' '),
    topReasons,
    topMismatches,
  };
}

export function scoreModels(
  answers: AnswerState,
  models: BusinessModel[],
  warnings?: RealityWarning[]
): ScoredResult[] {
  const results = models.map((model): ScoredResult => {
    const breakdown: FitBreakdown = {
      timeFit: timeFit(answers, model),
      budgetFit: budgetFit(answers, model),
      timelineRealism: timelineRealism(answers, model),
      preferenceAlignment: preferenceAlignment(answers, model),
      distributionMatch: distributionMatch(answers, model),
      salesMarketingFit: salesMarketingFit(answers, model),
      skillAssetMatch: skillAssetMatch(answers, model),
    };

    const weights = {
      timeFit: 0.20,
      budgetFit: 0.15,
      timelineRealism: 0.15,
      preferenceAlignment: 0.15,
      distributionMatch: 0.10,
      salesMarketingFit: 0.15,
      skillAssetMatch: 0.10,
    };

    let rawScore =
      breakdown.timeFit * weights.timeFit +
      breakdown.budgetFit * weights.budgetFit +
      breakdown.timelineRealism * weights.timelineRealism +
      breakdown.preferenceAlignment * weights.preferenceAlignment +
      breakdown.distributionMatch * weights.distributionMatch +
      breakdown.salesMarketingFit * weights.salesMarketingFit +
      breakdown.skillAssetMatch * weights.skillAssetMatch;

    let confidenceAdjustment = 0;
    const answeredKeys = Object.keys(answers).filter((k) => answers[k] !== undefined);
    if (answeredKeys.length < 10) confidenceAdjustment -= 15;
    else if (answeredKeys.length < 15) confidenceAdjustment -= 5;

    if (warnings && warnings.some((w) => w.severity === 'blocker')) {
      confidenceAdjustment -= 10;
    }

    const score = clamp(Math.round((rawScore + confidenceAdjustment) * 10) / 10);

    const { explanation, topReasons, topMismatches } = buildExplanation(answers, model, breakdown);

    const allMismatches: string[] = [];
    if (breakdown.timeFit < 50) allMismatches.push('time');
    if (breakdown.budgetFit < 50) allMismatches.push('budget');
    if (breakdown.timelineRealism < 50) allMismatches.push('timeline');
    if (breakdown.salesMarketingFit < 40) allMismatches.push('sales/marketing comfort');
    if (breakdown.skillAssetMatch < 40) allMismatches.push('skills');

    let confidence: 'Low' | 'Medium' | 'High' = 'Medium';
    if (answeredKeys.length >= 18 && score >= 70) confidence = 'High';
    else if (answeredKeys.length < 10 || score < 40) confidence = 'Low';

    return {
      model,
      score,
      fitBreakdown: breakdown,
      explanation,
      mismatches: allMismatches,
      confidenceAdjustment,
      confidence,
      topReasons,
      topMismatches,
    };
  });

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 6);
}
