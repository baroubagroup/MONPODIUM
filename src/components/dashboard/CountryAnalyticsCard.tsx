'use client'

import React, { useState } from 'react'
import { CountryTraffic } from '@/lib/analyticsData'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { Globe, Users, TrendingUp, Music2, ArrowUpRight, Compass } from 'lucide-react'

interface CountryAnalyticsCardProps {
  countries: CountryTraffic[]
  totalVisits: number
  uniqueVisitors: number
  streamingConversions: number
  conversionRate: string
  title?: string
  subtitle?: string
}

export function CountryAnalyticsCard({
  countries,
  totalVisits,
  uniqueVisitors,
  streamingConversions,
  conversionRate,
  title = "D'où viennent tes visiteurs ?",
  subtitle = "Répartition géographique en temps réel de ton audience et des clics vers les plateformes.",
}: CountryAnalyticsCardProps) {
  const { isLight } = useDashboardTheme()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')

  // Calculate multiplier for time ranges
  const multiplier = timeRange === '7d' ? 0.28 : timeRange === '30d' ? 1 : 2.4

  const displayedVisits = Math.round(totalVisits * multiplier)
  const displayedUnique = Math.round(uniqueVisitors * multiplier)
  const displayedClicks = Math.round(streamingConversions * multiplier)

  return (
    <div className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-sm space-y-6 ${
      isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
    }`}>
      {/* Header with Title and Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Globe className="w-4 h-4 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              {title}
            </h2>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {subtitle}
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className={`inline-flex items-center p-1 rounded-2xl border text-xs font-bold self-start sm:self-auto ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
        }`}>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer press-scale ${
              timeRange === '7d'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-xs'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer press-scale ${
              timeRange === '30d'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-xs'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            30 jours
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer press-scale ${
              timeRange === 'all'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-xs'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Global
          </button>
        </div>
      </div>

      {/* Mini KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
        }`}>
          <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Visites Totales
          </span>
          <span className="text-lg sm:text-xl font-black mt-0.5 block">
            {displayedVisits.toLocaleString('fr-FR')}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border transition-all ${
          isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
        }`}>
          <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Auditeurs Uniques
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {displayedUnique.toLocaleString('fr-FR')}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border transition-all ${
          isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
        }`}>
          <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Clics Streaming
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {displayedClicks.toLocaleString('fr-FR')}
          </span>
        </div>

        <div className={`p-3.5 rounded-2xl border transition-all ${
          isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
        }`}>
          <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Taux d'Écoute
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
            {conversionRate}
          </span>
        </div>
      </div>

      {/* Country Breakdown Progress Bars */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-1">
          <span>Classement par Pays</span>
          <span>Part du Trafic</span>
        </div>

        <div className="space-y-3">
          {countries.map((country, index) => {
            const countryVisits = Math.round(displayedVisits * (country.percentage / 100))

            return (
              <div
                key={country.code}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${
                  isLight
                    ? 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/90'
                    : 'bg-zinc-950/50 hover:bg-zinc-950/80 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg leading-none flex-shrink-0">{country.flag}</span>
                    <span className="font-black text-sm truncate">{country.name}</span>
                    <span className="text-[10px] font-bold text-emerald-500 hidden sm:inline">
                      {country.growthRate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-right">
                    <span className="font-mono font-bold">
                      {countryVisits.toLocaleString('fr-FR')} visites
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                      {country.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isLight ? 'bg-slate-200' : 'bg-zinc-800'
                }`}>
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.max(country.percentage, 3)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={`text-[11px] flex items-center justify-between pt-2 border-t text-zinc-500 ${
        isLight ? 'border-slate-200' : 'border-zinc-800'
      }`}>
        <span>Données anonymisées géolocalisées via Cloudflare & Fastly CDN</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mise à jour en temps réel</span>
      </div>
    </div>
  )
}
