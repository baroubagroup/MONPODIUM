'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlanBadge } from '@/components/dashboard/PlanBadge'
import { CountryAnalyticsCard } from '@/components/dashboard/CountryAnalyticsCard'
import { getArtistTraffic } from '@/lib/analyticsData'
import { Plan } from '@/types'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import {
  Music,
  ExternalLink,
  Smartphone,
  Eye,
  Share2,
  Sparkles,
  Disc3,
  Globe,
} from 'lucide-react'

export default function DashboardOverviewPage() {
  const { isLight } = useDashboardTheme()
  const [artistName, setArtistName] = useState('KS Bloom')
  const [username, setUsername] = useState('ksbloom')
  const [plan, setPlan] = useState<Plan>('free')
  const [releasesCount, setReleasesCount] = useState(1)

  const trafficData = getArtistTraffic(username)

  useEffect(() => {
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.artist_name) setArtistName(parsed.artist_name)
        if (parsed.username) setUsername(parsed.username)
        if (parsed.plan) setPlan(parsed.plan)
      } catch {}
    }

    const localReleases = localStorage.getItem('monpodium_releases')
    if (localReleases) {
      try {
        const parsed = JSON.parse(localReleases)
        if (Array.isArray(parsed)) {
          setReleasesCount(parsed.length)
        }
      } catch {}
    }
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black flex items-center gap-2 tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <span>Salut, {artistName}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Voici l'état de ta vitrine musicale MonPodium et de ton application dédiée.
          </p>
        </div>

        <Link
          href={`/${username}`}
          target="_blank"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs self-start md:self-auto press-scale ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-white'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-600" />
          <span>Voir ma vitrine en direct</span>
          <ExternalLink className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
        </Link>
      </div>

      {/* Plan quota notification */}
      <PlanBadge plan={plan} currentReleasesCount={releasesCount} />

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Sorties Actives */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs space-y-2 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className={`flex items-center justify-between text-xs font-bold ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}>
            <span>Musiques actives</span>
            <Music className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black">
            {releasesCount} / {plan === 'free' ? '1' : plan === 'starter' ? '5' : '20'}
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {plan === 'free' ? 'Plan gratuit (1 titre inclus)' : 'Sorties publiées sur ta page'}
          </p>
        </div>

        {/* Card 2: App PWA */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs space-y-2 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className={`flex items-center justify-between text-xs font-bold ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}>
            <span>Application PWA</span>
            <Smartphone className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span>Activée</span>
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Installable au nom de &ldquo;{artistName}&rdquo;
          </p>
        </div>

        {/* Card 3: Domaine */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs space-y-2 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className={`flex items-center justify-between text-xs font-bold ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}>
            <span>Adresse publique</span>
            <Share2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-mono font-bold truncate">
            monpodium.com/{username}
          </div>
          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {plan === 'pro' ? 'Sous-domaine personnalisé actif' : 'Adresse courte officielle'}
          </p>
        </div>
      </div>

      {/* Primary Action Card: Quick Release Highlight */}
      <div className={`p-6 rounded-3xl border transition-all shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-zinc-900/90 border-zinc-800 text-white'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border shadow-md ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-800 border-zinc-700'
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80"
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1 text-left">
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isLight
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              En ligne
            </div>
            <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              C&apos;est Dieu (Single)
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Disponible sur Spotify, Boomplay, YouTube, Apple Music, Deezer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/dashboard/releases"
            className={`flex-1 md:flex-initial text-center px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs press-scale ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            Gérer les plateformes
          </Link>
          <Link
            href="/dashboard/releases/new"
            className="flex-1 md:flex-initial text-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-105 press-scale"
          >
            Ajouter un son
          </Link>
        </div>
      </div>

      {/* Geographic Audience & Traffic Breakdown */}
      <CountryAnalyticsCard
        countries={trafficData.countries}
        totalVisits={trafficData.totalVisits}
        uniqueVisitors={trafficData.uniqueVisitors}
        streamingConversions={trafficData.streamingConversions}
        conversionRate={trafficData.conversionRate}
        title="D'où viennent tes visiteurs ? (Analytique par Pays)"
        subtitle="Suis la répartition géographique de ton audience et prépare tes tournées ou promotions ciblées."
      />

      {/* Pro Tips Banner */}
      <div className={`p-6 rounded-3xl border transition-all space-y-2.5 text-left ${
        isLight
          ? 'bg-purple-50/60 border-purple-200 text-slate-800'
          : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-300'
      }`}>
        <h3 className={`text-sm font-bold flex items-center gap-2 ${
          isLight ? 'text-purple-900' : 'text-white'
        }`}>
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Conseil pour maximiser tes écoutes</span>
        </h3>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          Mets toujours ton lien <strong>monpodium.com/{username}</strong> dans ta bio Instagram, TikTok et sous tes vidéos YouTube. Si YouTube bloque ou supprime un clip, change simplement le lien dans ton tableau de bord sans perdre ton audience !
        </p>
      </div>
    </div>
  )
}
