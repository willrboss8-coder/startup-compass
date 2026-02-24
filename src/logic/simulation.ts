import { AnswerState, ScoredResult } from '../types';

export interface SimulationResult {
  model: string;
  expectedFirstReplyWeek: number;
  expectedFirstRevenueWeek: number;
  rampDescription: string;
  weeklyMilestones: string[];
}

export function simulateOutcome(
  answers: AnswerState,
  result: ScoredResult
): SimulationResult {
  const hours = Number(answers.hours_per_week) || 10;
  const salesComfort = Number(answers.sales_comfort) || 3;
  const model = result.model;

  const isOutbound = model.requiresOutreach;
  const isContent = model.requiresPublicPresence && !model.requiresOutreach;

  let expectedFirstReplyWeek = 1;
  let expectedFirstRevenueWeek = model.timeToFirstDollar.minWeeks;
  let rampDescription = '';
  const milestones: string[] = [];

  if (isOutbound) {
    const outreachMultiplier = salesComfort >= 4 ? 0.8 : salesComfort >= 3 ? 1.0 : 1.5;
    const hoursMultiplier = hours >= 20 ? 0.8 : hours >= 10 ? 1.0 : 1.5;
    expectedFirstReplyWeek = Math.max(1, Math.round(1 * outreachMultiplier * hoursMultiplier));
    expectedFirstRevenueWeek = Math.max(
      model.timeToFirstDollar.minWeeks,
      Math.round(model.timeToFirstDollar.minWeeks * outreachMultiplier * hoursMultiplier)
    );
    rampDescription = `With outreach-driven growth at ${hours} hrs/week, expect initial replies in week ${expectedFirstReplyWeek} and first revenue around week ${expectedFirstRevenueWeek}.`;

    milestones.push(`Week 1: Set up systems, prepare outreach templates`);
    milestones.push(`Week ${expectedFirstReplyWeek}: First positive replies from prospects`);
    milestones.push(`Week ${Math.max(2, expectedFirstReplyWeek + 1)}: First discovery calls`);
    milestones.push(`Week ${expectedFirstRevenueWeek}: First paid engagement`);
  } else if (isContent) {
    const contentMultiplier = hours >= 15 ? 0.8 : hours >= 8 ? 1.0 : 1.3;
    expectedFirstRevenueWeek = Math.max(
      model.timeToFirstDollar.minWeeks,
      Math.round(model.timeToFirstDollar.minWeeks * contentMultiplier)
    );
    rampDescription = `Content-driven models ramp slowly. At ${hours} hrs/week, expect meaningful traction around week ${Math.round(expectedFirstRevenueWeek * 0.7)} and first revenue around week ${expectedFirstRevenueWeek}.`;

    milestones.push(`Week 1–2: Create and publish initial content`);
    milestones.push(`Week 3–4: Build consistency, start seeing engagement`);
    milestones.push(`Week ${Math.round(expectedFirstRevenueWeek * 0.5)}: Growing audience, refining content`);
    milestones.push(`Week ${expectedFirstRevenueWeek}: First monetization opportunity`);
  } else {
    expectedFirstRevenueWeek = model.timeToFirstDollar.minWeeks;
    rampDescription = `This model can generate revenue within ${model.timeToFirstDollar.minWeeks}–${model.timeToFirstDollar.maxWeeks} weeks depending on execution intensity.`;

    milestones.push(`Week 1: Setup and preparation`);
    milestones.push(`Week 2: Initial launch or first outreach`);
    milestones.push(`Week ${expectedFirstRevenueWeek}: First revenue`);
  }

  return {
    model: model.title,
    expectedFirstReplyWeek,
    expectedFirstRevenueWeek,
    rampDescription,
    weeklyMilestones: milestones,
  };
}
