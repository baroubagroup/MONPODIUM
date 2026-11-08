'use client'

import React from 'react'
import Link from 'next/link'
import { Plan, PLAN_LIMITS } from '@/types'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import { useDashboardTheme } from '@/context/DashboardThemeContext'

interface PlanBadgeProps {
  plan: Plan
  currentReleasesCount: number
}

export function PlanBadge({ plan, currentReleasesCount }: PlanBadgeProps) {
  const { isLight } = useDashboardTheme()
  const maxLimit = PLAN_LIMITS[plan]
  const isAtLimit = currentReleasesCount >= maxLimit

  const getPlanDetails = () => {
    switch (plan) {
      case 'pro':
        return {
          label: 'Plan Pro (Illimité)',
          color: 'from-amber-500 to-yellow-400 text-black',
          badgeBg: isLight
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        }
      case 'starter':
        return {
          label: 'Plan Starter',
          color: 'from-emerald-500 to-teal-500 text-zinc-950 font-black',
          badgeBg: isLight
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        }
      default:
        return {
          label: 'Plan Gratuit',
          color: isLight ? 'from-slate-200 to-slate-300 text-slate-800' : 'from-zinc-700 to-zinc-600 text-white',
          badgeBg: isLight
            ? 'bg-slate-100 text-slate-700 border-slate-300'
            : 'bg-zinc-800 text-zinc-300 border-zinc-700',
        }
    }
  }

  const details = getPlanDetails()

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-sm transition-all ${
      isLight
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-zinc-900/90 border-zinc-800 text-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${details.badgeBg}`}>
          {details.label}
        </div>
        <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          Quota : <strong className={isLight ? 'text-slate-900' : 'text-white'}>{currentReleasesCount}</strong> / {maxLimit} musique{maxLimit > 1 ? 's' : ''}
        </div>
      </div>

      {plan === 'free' && (
        <Link
          href="/dashboard/upgrade"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95 press-scale"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Débloquer plus de sorties</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}
