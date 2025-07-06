// src/lib/usage.ts - Fixed TypeScript types
export interface UsageData {
  dailyUsage: number;
  totalConversions: number;
  subscriptionStatus: 'free' | 'pro';
  lastUsageReset: string;
}

export interface UsageLimit {
  free: number;
  pro: number;
}

export const USAGE_LIMITS: UsageLimit = {
  free: 3,
  pro: -1 // -1 means unlimited
};

export const checkUsageLimit = (currentUsage: number, subscriptionStatus: 'free' | 'pro'): boolean => {
  if (subscriptionStatus === 'pro') {
    return true; // Pro users have unlimited access
  }
  
  return currentUsage < USAGE_LIMITS.free;
};

export const getRemainingUsage = (currentUsage: number, subscriptionStatus: 'free' | 'pro'): number => {
  if (subscriptionStatus === 'pro') {
    return -1; // Unlimited
  }
  
  return Math.max(0, USAGE_LIMITS.free - currentUsage);
};

export const shouldResetUsage = (lastReset: string): boolean => {
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  
  // Reset if it's been more than 24 hours
  const hoursSinceReset = (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceReset >= 24;
};

export const createUsageData = (): UsageData => {
  return {
    dailyUsage: 0,
    totalConversions: 0,
    subscriptionStatus: 'free',
    lastUsageReset: new Date().toISOString()
  };
};

export const incrementUsage = (usageData: UsageData): UsageData => {
  return {
    ...usageData,
    dailyUsage: usageData.dailyUsage + 1,
    totalConversions: usageData.totalConversions + 1
  };
};

export const resetDailyUsage = (usageData: UsageData): UsageData => {
  return {
    ...usageData,
    dailyUsage: 0,
    lastUsageReset: new Date().toISOString()
  };
};