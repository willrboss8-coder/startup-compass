/**
 * Feature gating system.
 *
 * Controls which features are free vs. premium.
 * Currently everything is unlocked (no payment system yet).
 * When payments are added, read tier from user state.
 */

export type UserTier = 'free' | 'solo' | 'pro';

export interface FeatureAccess {
  maxResults: number;
  fullActionPlan: boolean;
  comparisonMode: boolean;
  exportPdf: boolean;
  exportJson: boolean;
  simulation: boolean;
  adjustGoals: boolean;
  savedProfiles: boolean;
}

const TIER_ACCESS: Record<UserTier, FeatureAccess> = {
  free: {
    maxResults: 3,
    fullActionPlan: false,
    comparisonMode: false,
    exportPdf: false,
    exportJson: false,
    simulation: false,
    adjustGoals: true,
    savedProfiles: false,
  },
  solo: {
    maxResults: 6,
    fullActionPlan: true,
    comparisonMode: true,
    exportPdf: true,
    exportJson: true,
    simulation: true,
    adjustGoals: true,
    savedProfiles: false,
  },
  pro: {
    maxResults: 6,
    fullActionPlan: true,
    comparisonMode: true,
    exportPdf: true,
    exportJson: true,
    simulation: true,
    adjustGoals: true,
    savedProfiles: true,
  },
};

const TIER_KEY = 'startup-compass-tier';

export function getUserTier(): UserTier {
  try {
    const stored = localStorage.getItem(TIER_KEY);
    if (stored === 'solo' || stored === 'pro') return stored;
  } catch {
    // fall through
  }
  // During pre-launch: everyone gets full access.
  // Flip this to 'free' when payments go live.
  return 'solo';
}

export function getFeatureAccess(): FeatureAccess {
  return TIER_ACCESS[getUserTier()];
}

export function isFeatureLocked(feature: keyof FeatureAccess): boolean {
  const access = getFeatureAccess();
  return !access[feature];
}

export function setUserTier(tier: UserTier): void {
  try {
    localStorage.setItem(TIER_KEY, tier);
  } catch {
    // silently fail
  }
}
