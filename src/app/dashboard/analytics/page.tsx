'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { AnalyticsTimeRange, ArtistDetailedAnalytics } from '@/types/analytics'
import { computeArtistAnalytics, TIME_RANGE_LABELS } from '@/lib/analyticsEngine'
import { Release } from '@/types'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { getActiveUserProfile, getArtistReleases } from '@/lib/authSync'
import {
  BarChart3,
  TrendingUp,
  Globe,
  Radio,
  Eye,
  Users,
  Music,
  Share2,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Headphones,
  Sparkles,
  MousePointerClick,
  Filter,
  RefreshCw,
} from 'lucide-react'

export default function ArtistAnalyticsPage() {
  const { isLight } = useDashboardTheme()

  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d')
  const [artistName, setArtistName] = useState('Artiste')
  const [username, setUsername] = useState('')
  const [releases, setReleases] = useState<Release[]>([])
  const [analytics, setAnalytics] = useState<ArtistDetailedAnalytics | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load artist info & releases
  useEffect(() => {
    const initAnalytics = async () => {
      const profile = await getActiveUserProfile()
      const currentUsername = profile?.username || 'artiste'
      const currentName = profile?.artist_name || 'Artiste'

      setUsername(currentUsername)
      setArtistName(currentName)

      const userReleases = await getArtistReleases(currentUsername, profile?.id)
      setReleases(userReleases)

      const data = computeArtistAnalytics(currentUsername, currentName, timeRange, userReleases)
      setAnalytics(data)
    }
    initAnalytics()
  }, [timeRange])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const data = computeArtistAnalytics(username, artistName, timeRange, releases)
      setAnalytics(data)
      setIsRefreshing(false)
      toast.success('Statistiques synchronisées en direct', {
        description: 'Toutes les visites et clics récents ont été agrégés.',
      })
    }, 400)
  }

  const copyTrackUrl = (slug: string) => {
    const url = `${window.location.origin}/${username}/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedUrl(slug)
    toast.success('Lien du morceau copié !', { description: url })
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  if (!analytics) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* HEADER WITH TIME RANGE SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Statistiques & Audiences
              </h1>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Suivi ultra-détaillé de tes visites, écoutes, plateformes de streaming et pays d&apos;audience
              </p>
            </div>
          </div>
        </div>

        {/* TIME RANGE SELECTOR */}
        <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto p-1.5 rounded-2xl border transition-colors shadow-xs"
          style={{
            backgroundColor: isLight ? '#f1f5f9' : '#18181b',
            borderColor: isLight ? '#e2e8f0' : '#27272a',
          }}
        >
          {(['today', 'yesterday', '7d', '30d', 'all'] as AnalyticsTimeRange[]).map((r) => {
            const isActive = timeRange === r
            return (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {TIME_RANGE_LABELS[r].label}
              </button>
            )
          })}

          <button
            type="button"
            onClick={handleRefresh}
            title="Rafraîchir les données en direct"
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:bg-slate-200/60'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOP KPI TILES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: TOTAL VISITES */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visites Totales</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {analytics.total_page_views.toLocaleString('fr-FR')}
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Toutes tes pages & URLs</span>
          </p>
        </div>

        {/* KPI 2: VISITEURS UNIQUES */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visiteurs Uniques</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {analytics.unique_visitors.toLocaleString('fr-FR')}
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Fans distincts identifiés
          </p>
        </div>

        {/* KPI 3: CLICS STREAMING */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clics Streaming</span>
            <Headphones className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400`}>
            {analytics.total_streaming_clicks.toLocaleString('fr-FR')}
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Vers Spotify, YouTube...</span>
          </p>
        </div>

        {/* KPI 4: EXTRAITS 15S JOUÉS */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Extraits 15s Joués</span>
            <Radio className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black font-mono text-amber-500`}>
            {analytics.total_audio_previews.toLocaleString('fr-FR')}
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Écoutés sur ton lecteur
          </p>
        </div>

        {/* KPI 5: TAUX DE CONVERSION */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux de Conversion</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400`}>
            {analytics.global_conversion_rate}
          </div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Visiteurs devenus auditeurs
          </p>
        </div>
      </div>

      {/* SECTION 1: PERFORMANCE DÉTAILLÉE PAR MORCEAU & PAR URL */}
      <div className={`rounded-3xl border overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/70 border-zinc-800/90'
      }`}>
        <div className="p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className={`font-black text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Performance par Morceau & URL Dédiée
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Analyse du trafic individuel sur chacune de tes sorties musicales ({TIME_RANGE_LABELS[timeRange].periodText})
            </p>
          </div>

          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${
            isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'
          }`}>
            {analytics.tracks_performance.length} morceaux analysés
          </span>
        </div>

        {/* TRACKS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className={`text-[11px] font-black uppercase tracking-wider border-b ${
                isLight ? 'bg-slate-50/80 text-slate-500 border-slate-200' : 'bg-zinc-950/60 text-zinc-400 border-zinc-800'
              }`}>
                <th className="py-3 px-4">Titre & URL</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Pages Vues</th>
                <th className="py-3 px-4">Extraits 15s</th>
                <th className="py-3 px-4">Clics Streaming</th>
                <th className="py-3 px-4">Top Plateforme</th>
                <th className="py-3 px-4 text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isLight ? 'divide-slate-100' : 'divide-zinc-800/60'}`}>
              {analytics.tracks_performance.map((track) => (
                <tr
                  key={track.track_slug}
                  className={`transition-colors ${
                    isLight ? 'hover:bg-slate-50/90' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Title & URL */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.cover_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}
                          alt={track.track_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-black text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {track.track_title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[11px] font-mono truncate max-w-[200px] ${
                            isLight ? 'text-slate-500' : 'text-zinc-500'
                          }`}>
                            /{username}/{track.track_slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyTrackUrl(track.track_slug)}
                            title="Copier l'URL du morceau"
                            className="p-0.5 hover:text-emerald-500 transition-colors cursor-pointer"
                          >
                            {copiedUrl === track.track_slug ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                            )}
                          </button>
                          <Link
                            href={`/${username}/${track.track_slug}`}
                            target="_blank"
                            title="Voir la page publique du morceau"
                            className="p-0.5 hover:text-emerald-500 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 opacity-60 hover:opacity-100" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {track.release_type}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {track.page_views.toLocaleString('fr-FR')}
                  </td>

                  {/* Previews */}
                  <td className="py-3.5 px-4 font-mono text-amber-500 font-semibold">
                    {track.audio_previews.toLocaleString('fr-FR')}
                  </td>

                  {/* Streaming Clicks */}
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {track.streaming_clicks.toLocaleString('fr-FR')}
                  </td>

                  {/* Top Platform */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span>{track.top_platform}</span>
                    </span>
                  </td>

                  {/* Conversion */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {track.conversion_rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: RÉPARTITION PAR PLATEFORME DE STREAMING & RÉSEAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STREAMING PLATFORMS BREAKDOWN */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/70 border-zinc-800/90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-emerald-500" />
              <h2 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Clics par Plateforme de Streaming
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500">
              {analytics.total_streaming_clicks.toLocaleString('fr-FR')} clics
            </span>
          </div>

          <div className="space-y-4">
            {analytics.streaming_breakdown.map((item) => (
              <div key={item.platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <PlatformIcon platform={item.platform as any} size={13} />
                    </div>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs">{item.clicks.toLocaleString('fr-FR')} clics</span>
                    <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-zinc-800'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.bgColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOCIAL & BOOKING BREAKDOWN */}
        <div className={`p-5 sm:p-6 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/70 border-zinc-800/90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-500" />
              <h2 className={`font-black text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Réseaux Sociaux & Contact Booking
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-blue-500">
              {analytics.total_social_clicks + analytics.total_booking_clicks} interactions
            </span>
          </div>

          <div className="space-y-4">
            {analytics.social_breakdown.map((item) => (
              <div key={item.platform} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      {item.platform === 'booking' ? (
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs">{item.clicks.toLocaleString('fr-FR')} clics</span>
                    {item.platform !== 'booking' && (
                      <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        ({item.percentage}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-zinc-800'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.platform === 'booking'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: AUDIENCE GÉOGRAPHIQUE PAR PAYS (CÔTE D'IVOIRE, BURKINA FASO, FRANCE, ETC.) */}
      <div className={`rounded-3xl border overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/70 border-zinc-800/90'
      }`}>
        <div className="p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderColor: isLight ? '#e2e8f0' : '#27272a' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              <h2 className={`font-black text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Origine Géographique des Visites par Pays
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Détection automatique des pays des fans via le réseau bordure (Côte d&apos;Ivoire, Burkina Faso, France...)
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>IP Edge Vercel Active</span>
          </span>
        </div>

        {/* COUNTRY TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className={`text-[11px] font-black uppercase tracking-wider border-b ${
                isLight ? 'bg-slate-50/80 text-slate-500 border-slate-200' : 'bg-zinc-950/60 text-zinc-400 border-zinc-800'
              }`}>
                <th className="py-3 px-4">Rang & Pays</th>
                <th className="py-3 px-4">Visites</th>
                <th className="py-3 px-4">Part du Trafic</th>
                <th className="py-3 px-4">Dynamique</th>
                <th className="py-3 px-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isLight ? 'divide-slate-100' : 'divide-zinc-800/60'}`}>
              {analytics.country_breakdown.map((country, idx) => (
                <tr
                  key={country.code}
                  className={`transition-colors ${
                    isLight ? 'hover:bg-slate-50/90' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-center font-bold ${
                        idx < 3 ? 'text-amber-500 font-black' : isLight ? 'text-slate-400' : 'text-zinc-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xl leading-none">{country.flag}</span>
                      <span className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {country.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-sm">
                    {country.visits.toLocaleString('fr-FR')}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5 w-48">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{country.percentage}%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        isLight ? 'bg-slate-200' : 'bg-zinc-800'
                      }`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: `${Math.min(100, country.percentage * 2)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3" />
                      <span>{country.growthRate}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className={`text-[11px] font-bold ${
                      idx === 0
                        ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                        : isLight
                        ? 'text-slate-500'
                        : 'text-zinc-400'
                    }`}>
                      {idx === 0 ? 'Marché Principal' : 'Actif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
