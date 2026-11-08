'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Release, Platform, PLATFORMS } from '@/types'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { PWAInstallBanner } from '@/components/artist/PWAInstallBanner'
import { getPublicProfile, getArtistReleases } from '@/lib/authSync'
import { SafeImage } from '@/components/common/SafeImage'
import {
  ArrowLeft,
  Search,
  Disc3,
  Play,
  Pause,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Filter,
} from 'lucide-react'

function DiscographyContent() {
  const params = useParams()
  const rawUsername = (params?.username as string) || 'ksbloom'
  const username = rawUsername.toLowerCase().trim()

  const [artistName, setArtistName] = useState(username === 'himra' ? 'HIMRA' : username === 'ksbloom' ? 'KS Bloom' : username)
  const [pwaName, setPwaName] = useState(username === 'himra' ? 'HIMRA' : username === 'ksbloom' ? 'KS Bloom' : username)
  const [pwaIconUrl, setPwaIconUrl] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  )
  const [themeColor, setThemeColor] = useState('#9333ea')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [pwaEnabled, setPwaEnabled] = useState(true)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'single' | 'album' | 'ep'>('all')

  // Audio preview playback state in library
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const [releases, setReleases] = useState<Release[]>([])

  useEffect(() => {
    const loadDiscography = async () => {
      const profile = await getPublicProfile(username)
      if (profile) {
        if (profile.artist_name) setArtistName(profile.artist_name)
        setPwaName(profile.pwa_name || profile.artist_name)
        if (profile.pwa_icon_url) setPwaIconUrl(profile.pwa_icon_url)
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        if (profile.theme_color) setThemeColor(profile.theme_color)
        if (profile.theme_mode) setThemeMode(profile.theme_mode)

        const userReleases = await getArtistReleases(username, profile.id)
        setReleases(userReleases)
      } else if (username === 'himra' || username === 'ksbloom') {
        const userReleases = await getArtistReleases(username)
        setReleases(userReleases)
      } else {
        setReleases([])
      }
    }
    loadDiscography()

    document.title = `Discographie complète — ${artistName} (MonPodium)`

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = `/api/manifest/${username}`

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (!appleIcon) {
      appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleIcon)
    }
    appleIcon.href = `/api/icon/${username}`

    let favIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favIcon) {
      favIcon = document.createElement('link')
      favIcon.rel = 'icon'
      document.head.appendChild(favIcon)
    }
    favIcon.href = `/api/icon/${username}`
  }, [artistName, username])

  // Handle in-page audio preview
  const handleTogglePlay = (rel: Release) => {
    if (activePreviewId === rel.id) {
      if (audioRef.current) {
        audioRef.current.pause()
        setActivePreviewId(null)
      }
      return
    }

    if (!rel.preview_audio_url) return

    if (!audioRef.current) {
      audioRef.current = new Audio(rel.preview_audio_url)
    } else {
      audioRef.current.src = rel.preview_audio_url
    }

    audioRef.current.currentTime = 0
    audioRef.current.play().then(() => {
      setActivePreviewId(rel.id)
    }).catch(() => {})

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        const curr = audioRef.current.currentTime
        setAudioProgress((curr / 15) * 100)
        if (curr >= 15) {
          audioRef.current.pause()
          setActivePreviewId(null)
          setAudioProgress(0)
        }
      }
    }

    audioRef.current.onended = () => {
      setActivePreviewId(null)
      setAudioProgress(0)
    }
  }

  // Filter & Search logic
  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.release_type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType =
        filterType === 'all'
          ? true
          : filterType === 'album'
          ? r.release_type === 'album' || r.release_type === 'ep'
          : r.release_type === filterType
      return matchesSearch && matchesType
    })
  }, [releases, searchQuery, filterType])

  const counts = useMemo(() => {
    return {
      all: releases.length,
      single: releases.filter((r) => r.release_type === 'single').length,
      album: releases.filter((r) => r.release_type === 'album' || r.release_type === 'ep').length,
    }
  }, [releases])

  const isLight = themeMode === 'light'
  const effectiveAppName = pwaName || artistName

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-x-hidden transition-colors duration-300 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070709] text-white'
    }`}>
      {/* Background ambient light */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full opacity-20 blur-[180px] pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      {/* Top Header */}
      <header className="w-full max-w-2xl flex items-center justify-between py-2 relative z-20">
        <Link
          href={`/${username}`}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm group ${
            isLight
              ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
              : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" style={{ color: themeColor }} />
          <span>Bio de {artistName}</span>
        </Link>

        {/* Theme mode toggle */}
        <button
          onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
          className={`p-2 rounded-full border transition-colors shadow-sm cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-amber-500'
              : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800'
          }`}
          style={!isLight ? { color: themeColor } : {}}
          title={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
        >
          {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Content: Discography Library */}
      <main className="w-full max-w-2xl my-4 space-y-6 relative z-10">
        {/* Hero Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden text-left ${
          isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/90 border-white/10'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-950 border-2 flex-shrink-0 shadow-lg"
                style={{ borderColor: `${themeColor}60` }}
              >
                <SafeImage
                  src={avatarUrl}
                  alt={artistName}
                  fallbackType="avatar"
                  fallbackText={artistName}
                  themeColor={themeColor}
                  isLight={isLight}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {artistName}
                  </h1>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <p className={`text-xs sm:text-sm font-semibold pt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Bibliothèque musicale & Discographie officielle
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-black border"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      borderColor: `${themeColor}45`,
                      color: themeColor,
                    }}
                  >
                    {releases.length} titre{releases.length > 1 ? 's' : ''} disponible{releases.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action to return to bio */}
            <Link
              href={`/${username}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              <span>Voir la Bio & Réseaux</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className={`relative flex-1 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-300' : 'bg-zinc-900/90 border-zinc-800'
            }`}>
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isLight ? 'text-slate-400' : 'text-zinc-500'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un morceau, un single, un album..."
                className={`w-full bg-transparent pl-10 pr-4 py-3 text-xs sm:text-sm outline-none rounded-2xl font-medium ${
                  isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-zinc-500'
                }`}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                  filterType === 'all'
                    ? 'text-white'
                    : isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
                style={filterType === 'all' ? { backgroundColor: themeColor, boxShadow: `0 3px 12px ${themeColor}45` } : {}}
              >
                Tous ({counts.all})
              </button>
              <button
                onClick={() => setFilterType('single')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                  filterType === 'single'
                    ? 'text-white'
                    : isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
                style={filterType === 'single' ? { backgroundColor: themeColor, boxShadow: `0 3px 12px ${themeColor}45` } : {}}
              >
                Singles ({counts.single})
              </button>
              <button
                onClick={() => setFilterType('album')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shadow-xs cursor-pointer ${
                  filterType === 'album'
                    ? 'text-white'
                    : isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
                style={filterType === 'album' ? { backgroundColor: themeColor, boxShadow: `0 3px 12px ${themeColor}45` } : {}}
              >
                Albums & EPs ({counts.album})
              </button>
            </div>
          </div>
        </div>

        {/* Releases List */}
        <div className="space-y-3.5">
          {filteredReleases.length === 0 ? (
            <div className={`p-10 rounded-3xl border text-center space-y-2 ${
              isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
            }`}>
              <Disc3 className="w-10 h-10 mx-auto opacity-60" style={{ color: themeColor }} />
              <p className="font-bold text-sm">Aucun morceau trouvé pour cette recherche</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterType('all') }}
                className="text-xs hover:underline font-semibold cursor-pointer"
                style={{ color: themeColor }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filteredReleases.map((rel) => {
              const isPlaying = activePreviewId === rel.id

              return (
                <div
                  key={rel.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-md hover:shadow-xl relative overflow-hidden ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900'
                      : 'bg-zinc-900/90 border-white/10 text-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Cover & Details */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Cover with Play/Pause button */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-950 flex-shrink-0 shadow-lg group">
                        <SafeImage
                          src={rel.cover_url}
                          alt={rel.title}
                          fallbackType="cover"
                          fallbackText={rel.title}
                          themeColor={themeColor}
                          isLight={isLight}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Interactive Play/Pause button */}
                        {rel.preview_audio_url && (
                          <button
                            onClick={() => handleTogglePlay(rel)}
                            aria-label={isPlaying ? 'Pause' : 'Écouter extrait'}
                            className="absolute inset-0 bg-black/45 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
                              style={{ backgroundColor: themeColor }}
                            >
                              {isPlaying ? (
                                <Pause className="w-5 h-5 fill-white" />
                              ) : (
                                <Play className="w-5 h-5 fill-white ml-0.5" />
                              )}
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Titles & Type */}
                      <div className="min-w-0 text-left space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border"
                            style={{
                              backgroundColor: `${themeColor}20`,
                              borderColor: `${themeColor}40`,
                              color: themeColor,
                            }}
                          >
                            {rel.release_type}
                          </span>
                          {rel.release_date && (
                            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                              {new Date(rel.release_date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>

                        <h2 className={`text-base sm:text-lg font-black truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {rel.title}
                        </h2>

                        {/* Available platform badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {rel.platform_links?.map((link) => {
                            const cfg = PLATFORMS.find((p) => p.id === link.platform)
                            return (
                              <a
                                key={link.id || link.platform}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Écouter sur ${cfg?.name}`}
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                                style={{
                                  backgroundColor: cfg?.bgColor || '#27272a',
                                  color: cfg?.textColor || '#fff',
                                }}
                              >
                                <PlatformIcon platform={link.platform} size={11} />
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Audio Preview Info & Link to Dedicated Page */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-white/5">
                      {isPlaying && (
                        <div className="flex items-center gap-2 text-xs font-bold animate-pulse" style={{ color: themeColor }}>
                          <Volume2 className="w-4 h-4" />
                          <span>Extrait 15s en cours...</span>
                        </div>
                      )}

                      <Link
                        href={`/${username}/${rel.slug}`}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md group ${
                          isLight
                            ? 'bg-slate-900 text-white'
                            : 'bg-zinc-800 text-white'
                        }`}
                      >
                        <span>Page du morceau</span>
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Audio Progress Bar during preview playback */}
                  {isPlaying && (
                    <div
                      className="mt-3 w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: `${themeColor}25` }}
                    >
                      <div
                        className="h-full transition-all duration-200"
                        style={{ width: `${audioProgress}%`, backgroundColor: themeColor }}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* PWA banner */}
        {pwaEnabled && (
          <div className="pt-2">
            <PWAInstallBanner
              appName={effectiveAppName}
              username={username}
              themeColor={themeColor}
              themeMode={themeMode}
              iconUrl={pwaIconUrl || avatarUrl}
            />
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className={`w-full max-w-2xl pt-6 pb-28 sm:pb-24 text-center relative z-20 border-t mt-8 ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-lg group ${
            isLight
              ? 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-purple-400'
              : 'bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 hover:border-purple-500/50 text-zinc-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
          <span>Plateforme officielle propulsée par</span>
          <span className="text-purple-600 font-extrabold group-hover:text-purple-500 transition-colors">MonPodium</span>
        </a>
      </footer>
    </div>
  )
}

export default function DiscographyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Chargement de la discographie...</div>}>
      <DiscographyContent />
    </Suspense>
  )
}
