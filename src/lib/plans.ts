import { Plan, PLAN_LIMITS } from '@/types'

export function canAddRelease(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan]
}

export function getReleaseLimit(plan: Plan): number {
  return PLAN_LIMITS[plan]
}

export function isPlanActive(planExpiresAt: string | null, plan: Plan): boolean {
  if (plan === 'free') return true
  if (!planExpiresAt) return false
  return new Date(planExpiresAt) > new Date()
}

export const PLAN_PRICES = {
  free: { fcfa: 0, usd: 0 },
  starter: { fcfa: 10000, usd: 16 },
  pro: { fcfa: 15000, usd: 24 },
}

export function formatPrice(plan: Plan, currency: 'fcfa' | 'usd'): string {
  const price = PLAN_PRICES[plan][currency]
  if (price === 0) return 'Gratuit'
  if (currency === 'fcfa') return `${price.toLocaleString()} FCFA`
  return `$${price} USD`
}
