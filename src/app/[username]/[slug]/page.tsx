'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PlatformButton } from '@/components/artist/PlatformButton'
import { AudioPreview } from '@/components/artist/AudioPreview'
import { PWAInstallBanner } from '@/components/artist/PWAInstallBanner'
import { Release } from '@/types'
import { Share2, Check, ArrowLeft, Disc3, ShieldCheck, Sparkles } from 'lucide-react'
import { recordPageView } from '@/lib/tracker'

function ReleaseDetailContent() {
  const params = useParams()
  const username = (params?.username as string) || 'ksbloom'
  const slug = (params?.slug as string) || 'cest-dieu'

  const [artistName, setArtistName] = useState('KS Bloom')
  const [pwaName, setPwaName] = useState('KS Bloom')
  const [pwaIconUrl, setPwaIconUrl] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState('#9333ea')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [copied, setCopied] = useState(false)

  // Find release from localStorage or fallback
  const [release, setRelease] = useState<Release>({
    id: 'rel-1',
    user_id: 'u1',
    title: "C'est Dieu",
    slug: 'cest-dieu',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
    preview_start_ms: 0,
    preview_end_ms: 15000,
    release_type: 'single',
    release_date: '2024-05-10',
    is_published: true,
    display_order: 0,
    created_at: new Date().toISOString(),
    platform_links: [
      { id: '1', release_id: 'rel-1', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
      { id: '2', release_id: 'rel-1', platform: 'boomplay', url: 'https://www.boomplay.com', display_order: 1 },
      { id: '3', release_id: 'rel-1', platform: 'youtube', url: 'https://www.youtube.com', display_order: 2 },
      { id: '4', release_id: 'rel-1', platform: 'apple_music', url: 'https://music.apple.com', display_order: 3 },
      { id: '5', release_id: 'rel-1', platform: 'deezer', url: 'https://www.deezer.com', display_order: 4 },
    ],
  })

  useEffect(() => {
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.artist_name) {
          setArtistName(parsed.artist_name)
          if (!parsed.pwa_name) setPwaName(parsed.artist_name)
        }
        if (parsed.pwa_name) setPwaName(parsed.pwa_name)
        if (parsed.pwa_icon_url) setPwaIconUrl(parsed.pwa_icon_url)
        if (parsed.theme_color) setThemeColor(parsed.theme_color)
        if (parsed.theme_mode === 'light' || parsed.theme_mode === 'dark') {
          setThemeMode(parsed.theme_mode)
        }
      } catch {}
    }

    const localReleases = localStorage.getItem('monpodium_releases')
    if (localReleases) {
      try {
        const parsed: Release[] = JSON.parse(localReleases)
        const match = parsed.find(
          r => r.slug === slug || r.title.toLowerCase().replace(/\s+/g, '-') === slug
        )
        if (match) setRelease(match)
      } catch {}
    }

    document.title = `${release.title} — ${artistName} (Liens Officiels)`

    // Track public single track page view
    recordPageView({
      artistUsername: username,
      pagePath: window.location.pathname,
      trackSlug: slug,
    })
  }, [slug, release.title, artistName, username])

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Lien du morceau copié !', {
      description: `Lien officiel vers ${release.title} prêt à être partagé.`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const effectiveAppName = pwaName || artistName
  const isLight = themeMode === 'light'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-x-hidden transition-colors duration-300 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070709] text-white'
    }`}>
      {/* Background ambient lighting */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full opacity-20 blur-[180px] pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      {/* Top Bar with back link to artist bio */}
      <header className="w-full max-w-md flex items-center justify-between py-2 relative z-20">
        <Link
          href={`/${username}`}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm'
              : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" style={{ color: themeColor }} />
          <span>Bio de {artistName}</span>
        </Link>

        <button
          onClick={copyUrl}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm'
              : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copié' : 'Partager'}</span>
        </button>
      </header>

      {/* Ultra Sleek Release Presentation (Page de Vente / Hub Musical) */}
      <main className="w-full max-w-md my-auto py-4 pb-4 space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-300 text-center">
        {/* Cover Art in High Definition */}
        <div className={`relative rounded-[32px] overflow-hidden border shadow-2xl group ${
          isLight ? 'bg-white border-slate-200' : 'bg-zinc-900 border-white/10'
        }`}>
          <div className="aspect-square w-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={release.cover_url || ''}
              alt={release.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark glass gradient bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] uppercase font-black tracking-widest"
                style={{ color: themeColor }}
              >
                {release.release_type}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg leading-tight">
                {release.title}
              </h1>
              <div className="flex items-center gap-1.5 pt-1 text-sm text-zinc-200 font-bold">
                <span>{artistName}</span>
                <span title="Artiste vérifié">
                  <ShieldCheck className="w-4 h-4 text-blue-400 inline" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 15-second audio preview */}
        <div className="pt-1">
          <AudioPreview
            src={release.preview_audio_url}
            title={release.title}
            artistName={artistName}
            artistUsername={username}
            trackSlug={slug}
            themeColor={themeColor}
            maxSeconds={15}
          />
        </div>

        {/* Streaming Platform Buttons */}
        <div className="space-y-2.5 text-left">
          <div className={`text-xs uppercase font-extrabold tracking-wider px-1 ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}>
            Disponible dès maintenant sur :
          </div>
          {release.platform_links?.map((link) => (
            <PlatformButton
              key={link.id || link.platform}
              platform={link.platform}
              url={link.url}
              artistUsername={username}
              trackSlug={slug}
            />
          ))}
        </div>

        {/* Link to view full artist profile & other songs */}
        <div className="pt-2">
          <Link
            href={`/${username}`}
            className={`flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-md ${
              isLight
                ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 hover:text-purple-600'
                : 'bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Disc3 className="w-4 h-4" style={{ color: themeColor }} />
            <span>Découvrir toute la discographie de {artistName}</span>
          </Link>
        </div>

        {/* PWA banner (No booking button here, as strictly requested!) */}
        <div className="pt-1">
          <PWAInstallBanner
            appName={effectiveAppName}
            username={username}
            themeColor={themeColor}
            themeMode={themeMode}
            iconUrl={pwaIconUrl || release.cover_url}
          />
        </div>
      </main>

      {/* Footer Branding - Positionné bien au-dessus du sticker PWA pour rester 100% visible */}
      <footer className={`w-full max-w-md pt-6 pb-28 sm:pb-24 text-center relative z-20 border-t mt-6 ${
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

export default function ReleaseDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Chargement...</div>}>
      <ReleaseDetailContent />
    </Suspense>
  )
}
