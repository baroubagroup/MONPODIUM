'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Release, Plan, PLATFORMS, PLAN_LIMITS } from '@/types'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { getActiveUserProfile, getArtistReleases, isSupabaseConfigured } from '@/lib/authSync'
import { createClient } from '@/lib/supabase/client'
import { SafeImage } from '@/components/common/SafeImage'
import {
  PlusCircle,
  Music,
  ExternalLink,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  Copy,
  Check,
  Disc3,
  Radio,
} from 'lucide-react'

export default function ReleasesListPage() {
  const { isLight } = useDashboardTheme()
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [plan, setPlan] = useState<Plan>('free')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'single' | 'album_ep'>('all')

  // Audio Playback
  const togglePlaySnippet = (rel: Release) => {
    if (playingId === rel.id) {
      if (audioElement) {
        audioElement.pause()
        setPlayingId(null)
      }
      return
    }

    if (!rel.preview_audio_url) {
      toast.error('Aucun fichier audio associé')
      return
    }

    if (audioElement) {
      audioElement.pause()
    }

    const audio = new Audio(rel.preview_audio_url)
    audio.currentTime = 0
    audio.play().catch(() => {})
    setAudioElement(audio)
    setPlayingId(rel.id)

    audio.onended = () => {
      setPlayingId(null)
    }

    setTimeout(() => {
      if (audio) {
        audio.pause()
        setPlayingId(null)
      }
    }, 15000)
  }

  useEffect(() => {
    const initReleases = async () => {
      setLoading(true)
      const profile = await getActiveUserProfile()
      if (profile) {
        if (profile.username) setUsername(profile.username)
        if (profile.id) setUserId(profile.id)
        if (profile.plan) setPlan(profile.plan)

        const userReleases = await getArtistReleases(profile.username, profile.id)
        setReleases(userReleases)
      }
      setLoading(false)
    }
    initReleases()
  }, [])

  const deleteRelease = async (id: string) => {
    if (!confirm('Supprimer cette sortie musicale ?')) return
    const updated = releases.filter(r => r.id !== id)
    setReleases(updated)
    localStorage.setItem('monpodium_releases', JSON.stringify(updated))
    if (username) {
      localStorage.setItem(`monpodium_releases_${username}`, JSON.stringify(updated))
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        await supabase.from('releases').delete().eq('id', id)
      } catch (err) {
        console.debug('Failed to delete release on Supabase', err)
      }
    }

    toast.success('Morceau supprimé avec succès.')
  }

  const copyReleaseLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/${username}/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Lien du morceau copié !', {
      description: url,
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const maxAllowed = PLAN_LIMITS[plan]
  const isQuotaReached = releases.length >= maxAllowed

  const filteredReleases = releases.filter((r) => {
    if (filterType === 'single') return r.release_type === 'single'
    if (filterType === 'album_ep') return r.release_type === 'album' || r.release_type === 'ep'
    return true
  })

  const singlesCount = releases.filter(r => r.release_type === 'single').length
  const albumsCount = releases.filter(r => r.release_type === 'album' || r.release_type === 'ep').length
  const totalPlatforms = releases.reduce((acc, r) => acc + (r.platform_links?.length || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Studio Header & Metrics */}
      <div className={`rounded-3xl p-6 sm:p-7 border transition-all duration-200 shadow-md space-y-6 ${
        isLight
          ? 'bg-white border-slate-200/90 text-slate-900 shadow-slate-200/50'
          : 'bg-zinc-900/90 border-zinc-800 text-white shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs font-black uppercase tracking-wider ${
                isLight ? 'text-purple-600' : 'text-purple-400'
              }`}>
                Studio Discographie
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              Mes Sorties Musicales
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${
              isLight ? 'text-slate-500' : 'text-zinc-400'
            }`}>
              Écoute tes aperçus audio 15s, gère tes liens de streaming et consulte tes statistiques en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/releases/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 press-scale"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle sortie</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
          }`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Total Sorties
            </span>
            <span className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {releases.length} titre{releases.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
          }`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Plateformes Liées
            </span>
            <span className={`text-xl font-black ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {totalPlatforms} actives
            </span>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
          }`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Aperçus 15s
            </span>
            <span className={`text-xl font-black ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
              100% Découpés
            </span>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isLight ? 'bg-slate-50/80 border-slate-200/90' : 'bg-zinc-950/60 border-zinc-800/80'
          }`}>
            <span className={`text-[11px] block font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Quota Utilisé
            </span>
            <span className={`text-xl font-black ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
              {releases.length} / {maxAllowed}
            </span>
          </div>
        </div>
      </div>

      {isQuotaReached && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between transition-colors ${
          isLight
            ? 'bg-purple-50 border-purple-200 text-purple-900'
            : 'bg-purple-950/40 border-purple-500/30 text-purple-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span>
              Quota de ton plan actuel atteint ({releases.length}/{maxAllowed}). Débloque jusqu&apos;à 20 musiques avec le plan Pro.
            </span>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs whitespace-nowrap ml-2 shadow-md press-scale"
          >
            Passer en Pro
          </Link>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all press-scale cursor-pointer ${
            filterType === 'all'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : isLight
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Toutes les sorties ({releases.length})
        </button>
        <button
          onClick={() => setFilterType('single')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all press-scale cursor-pointer ${
            filterType === 'single'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : isLight
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Singles ({singlesCount})
        </button>
        <button
          onClick={() => setFilterType('album_ep')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all press-scale cursor-pointer ${
            filterType === 'album_ep'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : isLight
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Albums & EPs ({albumsCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredReleases.length === 0 && (
        <div className={`p-12 rounded-3xl border text-center space-y-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
            <Music className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-black text-lg">Aucune sortie musicale pour le moment</h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Découpe ton extrait audio 15 secondes, ajoute tes plateformes (Spotify, YouTube, Apple Music...) et commence à partager ta musique !
            </p>
          </div>
          <Link
            href="/dashboard/releases/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 press-scale"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer ma première sortie</span>
          </Link>
        </div>
      )}

      {/* Modernized Releases Cards */}
      <div className="space-y-3.5">
        {filteredReleases.map((release) => {
          const isPlaying = playingId === release.id

          return (
            <div
              key={release.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden ${
                isPlaying
                  ? isLight
                    ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-400/20 shadow-lg'
                    : 'bg-purple-950/20 border-purple-500 ring-2 ring-purple-500/20 shadow-xl'
                  : isLight
                  ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md text-slate-900'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 shadow-md hover:shadow-xl text-white'
              }`}
            >
              {/* Left: Cover Art with Overlay Play Button & Info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Cover Art with Interactive Play Snippet */}
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-md group-hover:scale-102 transition-transform ${
                  isLight ? 'bg-slate-100 border border-slate-200' : 'bg-zinc-950 border border-zinc-700/80'
                }`}>
                  <SafeImage
                    src={release.cover_url}
                    alt={release.title}
                    fallbackType="cover"
                    fallbackText={release.title}
                    isLight={isLight}
                    className="w-full h-full object-cover"
                  />

                  {/* Play/Pause Snippet Button directly on cover */}
                  <button
                    onClick={() => togglePlaySnippet(release)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title={isPlaying ? 'Mettre en pause' : 'Écouter l’extrait 15s'}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 press-scale">
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-base sm:text-lg font-black truncate transition-colors ${
                      isLight ? 'text-slate-900 group-hover:text-purple-600' : 'text-white group-hover:text-purple-400'
                    }`}>
                      {release.title}
                    </h3>
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}>
                      {release.release_type}
                    </span>
                    {release.is_published ? (
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      }`}>
                        Publié
                      </span>
                    ) : (
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isLight ? 'bg-slate-100 text-slate-500' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        Brouillon
                      </span>
                    )}
                  </div>

                  {/* Equalizer animation if playing */}
                  {isPlaying ? (
                    <div className={`flex items-center gap-1.5 h-5 ${
                      isLight ? 'text-purple-600' : 'text-emerald-400'
                    }`}>
                      <div className="flex items-center gap-0.5 h-4">
                        <span className={`w-1 h-3 rounded-full animate-bounce ${isLight ? 'bg-purple-600' : 'bg-emerald-400'}`} />
                        <span className={`w-1 h-4 rounded-full animate-pulse ${isLight ? 'bg-purple-600' : 'bg-emerald-400'}`} />
                        <span className={`w-1 h-2 rounded-full animate-bounce ${isLight ? 'bg-purple-600' : 'bg-emerald-400'}`} />
                        <span className={`w-1 h-3.5 rounded-full animate-pulse ${isLight ? 'bg-purple-600' : 'bg-emerald-400'}`} />
                      </div>
                      <span className="text-xs font-mono font-bold">
                        Extrait 15s en cours de lecture...
                      </span>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 text-xs font-medium ${
                      isLight ? 'text-slate-500' : 'text-zinc-400'
                    }`}>
                      <span>{release.release_date || 'Date non définie'}</span>
                      <span>•</span>
                      <span className={`font-semibold ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
                        Extrait 15s prêt
                      </span>
                    </div>
                  )}

                  {/* Platform icons list */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {release.platform_links?.map((link) => {
                      const cfg = PLATFORMS.find(p => p.id === link.platform)
                      return (
                        <div
                          key={link.platform}
                          title={cfg?.name || link.platform}
                          className="w-6 h-6 rounded-lg flex items-center justify-center shadow-xs transition-transform hover:scale-110"
                          style={{ backgroundColor: cfg?.bgColor || '#27272a', color: cfg?.textColor || '#fff' }}
                        >
                          <PlatformIcon platform={link.platform} size={13} />
                        </div>
                      )
                    })}
                    <span className={`text-[11px] font-semibold ml-1 ${
                      isLight ? 'text-slate-500' : 'text-zinc-500'
                    }`}>
                      {release.platform_links?.length || 0} plateformes actives
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Modern Actions Bar - Full width strip on mobile */}
              <div className={`w-full md:w-auto flex items-center justify-between gap-1.5 sm:gap-2 pt-3 md:pt-0 border-t md:border-t-0 flex-shrink-0 ${
                isLight ? 'border-slate-100' : 'border-zinc-800/80'
              }`}>
                {/* Audio Snippet Play Toggle Button */}
                <button
                  onClick={() => togglePlaySnippet(release)}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer press-scale ${
                    isPlaying
                      ? 'bg-purple-600 text-white shadow-purple-600/30'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Écouter'}</span>
                </button>

                {/* Direct Link Copy Button */}
                <button
                  onClick={() => copyReleaseLink(release.slug, release.id)}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer press-scale ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                  title="Copier le lien public direct de cette sortie"
                >
                  {copiedId === release.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === release.id ? 'Copié !' : 'Lien'}</span>
                </button>

                {/* View Dedicated Page Link */}
                <Link
                  href={`/${username}/${release.slug}`}
                  target="_blank"
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all shadow-xs press-scale ${
                    isLight
                      ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Voir page</span>
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => deleteRelease(release.id)}
                  className={`p-2.5 sm:p-2 rounded-xl transition-colors cursor-pointer press-scale flex-shrink-0 ${
                    isLight
                      ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                      : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  title="Supprimer cette sortie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
