'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PWAInstallBanner } from '@/components/artist/PWAInstallBanner'
import { BookingModal } from '@/components/artist/BookingModal'
import { SocialLinks } from '@/components/artist/SocialLinks'
import { ReleasesCarousel } from '@/components/artist/ReleasesCarousel'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { Release, SocialLink, PLATFORMS } from '@/types'
import { recordPageView } from '@/lib/tracker'
import {
  Disc3,
  Share2,
  Check,
  ShieldCheck,
  ShieldAlert,
  Music2,
  ArrowRight,
  Sparkles,
  MapPin,
  Play,
  Layers,
  Sun,
  Moon,
} from 'lucide-react'

function ArtistHubContent() {
  const params = useParams()
  const username = (params?.username as string) || 'ksbloom'

  const [artistName, setArtistName] = useState('KS Bloom')
  const [pwaName, setPwaName] = useState('KS Bloom')
  const [pwaIconUrl, setPwaIconUrl] = useState<string | null>(null)
  const [bio, setBio] = useState(
    "Artiste chanteur gospel & afrobeats ivoirien. Retrouvez ici toutes mes sorties officielles, mes clips et mes réseaux sociaux certifiés."
  )
  const [country, setCountry] = useState("Côte d'Ivoire")
  const [genres, setGenres] = useState<string[]>(['Afrobeats', 'Gospel', 'Afro-Trap'])
  const [themeColor, setThemeColor] = useState('#9333ea')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [isVerified, setIsVerified] = useState(true)
  const [accountStatus, setAccountStatus] = useState<'active' | 'suspended' | 'banned'>('active')
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  )
  const [bannerUrl, setBannerUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'
  )
  const [bannerColor, setBannerColor] = useState<string>(
    'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #1e1b4b 100%)'
  )

  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [bookingEmail, setBookingEmail] = useState<string | null>('booking@ksbloom.com')
  const [bookingPhone, setBookingPhone] = useState<string | null>(null)
  const [pwaEnabled, setPwaEnabled] = useState(true)
  const [copied, setCopied] = useState(false)

  // Official verified social links (no raw URLs)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', user_id: 'u1', platform: 'facebook', url: 'https://facebook.com/ksbloom' },
    { id: '2', user_id: 'u1', platform: 'instagram', url: 'https://instagram.com/ksbloom_music' },
    { id: '3', user_id: 'u1', platform: 'tiktok', url: 'https://tiktok.com/@ksbloom' },
    { id: '4', user_id: 'u1', platform: 'youtube', url: 'https://youtube.com/@ksbloom' },
  ])

  // Discography (Releases)
  const [releases, setReleases] = useState<Release[]>([
    {
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
      ],
    },
    {
      id: 'rel-2',
      user_id: 'u1',
      title: 'Enfant de Dieu',
      slug: 'enfant-de-dieu',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
      preview_start_ms: 0,
      preview_end_ms: 15000,
      release_type: 'album',
      release_date: '2023-11-20',
      is_published: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      platform_links: [
        { id: '5', release_id: 'rel-2', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
        { id: '6', release_id: 'rel-2', platform: 'deezer', url: 'https://www.deezer.com', display_order: 1 },
        { id: '7', release_id: 'rel-2', platform: 'boomplay', url: 'https://www.boomplay.com', display_order: 2 },
      ],
    },
  ])

  useEffect(() => {
    // 1. Check Admin Users registry first
    const adminUsersStr = localStorage.getItem('monpodium_admin_users')
    if (adminUsersStr) {
      try {
        const adminUsers = JSON.parse(adminUsersStr)
        const match = adminUsers.find((u: any) => u.username.toLowerCase() === username.toLowerCase())
        if (match) {
          if (match.artist_name) setArtistName(match.artist_name)
          if (match.pwa_name) setPwaName(match.pwa_name)
          if (match.pwa_icon_url) setPwaIconUrl(match.pwa_icon_url)
          if (match.bio) setBio(match.bio)
          if (match.country) setCountry(match.country)
          if (match.avatar_url) setAvatarUrl(match.avatar_url)
          if (match.banner_url !== undefined) setBannerUrl(match.banner_url)
          if (match.theme_color) setThemeColor(match.theme_color)
          if (match.theme_mode) setThemeMode(match.theme_mode)
          if (match.genres) setGenres(match.genres)
          if (match.verified !== undefined) setIsVerified(match.verified)
          if (match.account_status) setAccountStatus(match.account_status)
          if (match.booking_email) setBookingEmail(match.booking_email)
          if (match.booking_phone) setBookingPhone(match.booking_phone)
        }
      } catch {}
    }

    // 2. Check local demo user
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.username === username || (!username && parsed.username === 'ksbloom')) {
          if (parsed.artist_name) setArtistName(parsed.artist_name)
          if (parsed.pwa_name) setPwaName(parsed.pwa_name)
          else if (parsed.artist_name) setPwaName(parsed.artist_name)
          if (parsed.pwa_icon_url) setPwaIconUrl(parsed.pwa_icon_url)
          if (parsed.bio) setBio(parsed.bio)
          if (parsed.country) setCountry(parsed.country)
          if (parsed.avatar_url) setAvatarUrl(parsed.avatar_url)
          if (parsed.banner_url !== undefined) setBannerUrl(parsed.banner_url)
          if (parsed.banner_color) setBannerColor(parsed.banner_color)
          if (parsed.theme_color) setThemeColor(parsed.theme_color)
          if (parsed.theme_mode) setThemeMode(parsed.theme_mode)
          if (parsed.booking_enabled !== undefined) setBookingEnabled(parsed.booking_enabled)
          if (parsed.booking_email) setBookingEmail(parsed.booking_email)
          if (parsed.booking_phone) setBookingPhone(parsed.booking_phone)
          if (parsed.pwa_enabled !== undefined) setPwaEnabled(parsed.pwa_enabled)
          if (parsed.verified !== undefined) setIsVerified(parsed.verified)
          if (parsed.account_status) setAccountStatus(parsed.account_status)
          if (parsed.genres && Array.isArray(parsed.genres)) {
            setGenres(parsed.genres)
          } else if (parsed.genre) {
            setGenres([parsed.genre])
          }
          if (parsed.social_links && Array.isArray(parsed.social_links)) {
            setSocialLinks(parsed.social_links)
          }
        }
      } catch {}
    }

    const localReleases = localStorage.getItem('monpodium_releases')
    if (localReleases) {
      try {
        const parsed = JSON.parse(localReleases)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReleases(parsed)
        }
      } catch {}
    }

    document.title = `${artistName} — Hub Officiel & Discographie`
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = `/api/manifest/${username}`

    // Track public profile page view
    recordPageView({
      artistUsername: username,
      pagePath: window.location.pathname,
    })
  }, [artistName, username])

  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Lien officiel copié !', {
      description: `Lien prêt à être partagé avec tes fans.`,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const effectiveAppName = pwaName || artistName
  const isLight = themeMode === 'light'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between relative overflow-x-hidden transition-colors duration-300 ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070709] text-white'}`}>
      {/* Dynamic ambient background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full opacity-20 blur-[180px] pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      {/* Top Floating Glass Navigation Bar */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b py-3 px-4 transition-colors ${isLight ? 'bg-white/80 border-slate-200/90 text-slate-900 shadow-xs' : 'bg-black/40 border-white/5 text-white'}`}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              <Disc3 className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`font-black text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {artistName}
              </span>
              {isVerified && (
                <span title="Artiste officiel certifié">
                  <ShieldCheck className="w-4 h-4 text-blue-500 inline" />
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick theme switcher for visitor */}
            <button
              onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-full border transition-all ${isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs' : 'bg-zinc-900/90 border-zinc-750 text-zinc-300 hover:text-white'}`}
              title={isLight ? 'Activer le Mode Sombre' : 'Activer le Mode Clair'}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" style={{ color: themeColor }} /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={copyPageUrl}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md ${isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-750 text-zinc-300'}`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Lien copié' : 'Partager'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hub Container */}
      <main className="w-full max-w-lg mx-auto px-4 pb-4 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Moderation Suspension Security Notice */}
        {accountStatus === 'suspended' && (
          <div className="w-full p-4 rounded-2xl bg-red-950/85 border-2 border-red-600 text-red-200 text-xs flex items-center gap-3.5 shadow-2xl animate-pulse">
            <ShieldAlert className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div className="text-left space-y-0.5">
              <strong className="block text-sm font-black text-white uppercase tracking-wider">
                Profil Suspendu par la Modération MonPodium
              </strong>
              <span className="leading-snug block opacity-95">
                Ce compte a été suspendu pour suspicion d&apos;usurpation d&apos;identité ou non-respect de la charte officielle. Les transactions et les liens sont temporairement désactivés.
              </span>
            </div>
          </div>
        )}

        {/* ULTRA DESIGN HERO: COVER BANNER + OVERLAPPING AVATAR */}
        <div className={`rounded-[32px] overflow-hidden border shadow-2xl backdrop-blur-2xl transition-all ${isLight ? 'bg-white border-slate-200/90 shadow-slate-200/80 text-slate-900' : 'bg-zinc-900/80 border-white/10 text-white'}`}>
          {/* Panoramic Cover Banner */}
          <div
            className="w-full h-48 sm:h-56 relative bg-zinc-950"
            style={{
              background: bannerUrl ? `url(${bannerUrl}) center/cover no-repeat` : bannerColor,
              backgroundColor: '#09090b',
            }}
          >
            {/* Gradient overlay for ultra sleek transition */}
            <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? 'from-white via-white/35 to-transparent' : 'from-zinc-900 via-zinc-900/40 to-transparent'}`} />
            <div
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 shadow-sm"
              style={{ color: themeColor }}
            >
              <Sparkles className="w-3 h-3" style={{ color: themeColor }} />
              <span>Profil Officiel</span>
            </div>
          </div>

          {/* Overlapping Avatar & Artist Header */}
          <div className="px-6 pb-6 pt-0 relative -mt-16 text-center space-y-4">
            {/* Avatar with glowing ring */}
            <div className={`relative mx-auto w-32 h-32 rounded-3xl overflow-hidden p-1 shadow-2xl border-2 ${isLight ? 'bg-white border-slate-200 ring-4 ring-slate-100' : 'bg-zinc-950 border-white/20'}`}>
              <div className="w-full h-full rounded-[20px] overflow-hidden bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={artistName}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              {isVerified && (
                <div
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-zinc-950"
                  title="Compte officiel vérifié"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Artist Name & Verification */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className={`text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {artistName}
                </h1>
                {isVerified && (
                  <span title="Artiste officiel certifié">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                  </span>
                )}
              </div>

              {/* Multi-genres Tags & Country */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                {genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-xs border transition-colors"
                    style={{
                      backgroundColor: `${themeColor}1a`,
                      borderColor: `${themeColor}45`,
                      color: themeColor,
                    }}
                  >
                    {g}
                  </span>
                ))}
                {country && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}>
                    <MapPin className="w-3 h-3 opacity-60" />
                    <span>{country}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Official Bio */}
            {bio && (
              <p className={`text-xs sm:text-sm leading-relaxed max-w-md mx-auto whitespace-pre-line text-left p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-zinc-950/70 border-white/5 text-zinc-300'}`}>
                {bio}
              </p>
            )}

            {/* Booking Button (Only if enabled, without WhatsApp) */}
            {bookingEnabled && bookingEmail && (
              <div className="pt-1">
                <BookingModal
                  artistName={artistName}
                  artistUsername={username}
                  bookingEmail={bookingEmail}
                  bookingPhone={bookingPhone}
                  bookingEnabled={bookingEnabled}
                  themeColor={themeColor}
                />
              </div>
            )}

            {/* Menu de navigation sous le profil de l'artiste */}
            <nav className={`flex items-center justify-center gap-1.5 pt-3 pb-0.5 border-t mt-4 flex-wrap ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm text-white"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 3px 12px ${themeColor}55`,
                }}
              >
                Bio & Sorties
              </span>
              <Link
                href={`/${username}/discographie`}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                <Disc3 className="w-3.5 h-3.5" style={{ color: themeColor }} />
                <span>Discographie</span>
                <span
                  className="text-[10px] font-black px-1.5 py-0.2 rounded-full border"
                  style={{
                    backgroundColor: `${themeColor}20`,
                    borderColor: `${themeColor}40`,
                    color: themeColor,
                  }}
                >
                  {releases.length}
                </span>
              </Link>
              {socialLinks.length > 0 && (
                <a
                  href="#reseaux-sociaux"
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Réseaux Vérifiés</span>
                </a>
              )}
            </nav>
          </div>
        </div>

        {/* SECTION 1: SORTIES MUSICALES EN CARROUSEL DÉFILANT SUR UNE SEULE LIGNE */}
        <div className="pt-1">
          <ReleasesCarousel
            releases={releases}
            username={username}
            themeColor={themeColor}
            themeMode={themeMode}
          />
        </div>

        {/* SECTION 2: RÉSEAUX SOCIAUX OFFICIELS (PROTÈGE CONTRE LES FAUX COMPTES) */}
        {socialLinks.length > 0 && (
          <div id="reseaux-sociaux" className="pt-2">
            <SocialLinks
              links={socialLinks}
              artistName={artistName}
              artistUsername={username}
              themeMode={themeMode}
              themeColor={themeColor}
            />
          </div>
        )}

        {/* SECTION 3: PWA INSTALLATION BANNER (SANS LE MOT 'APP') */}
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

      {/* Footer Branding - Positionné bien au-dessus du sticker PWA pour rester 100% visible */}
      <footer className={`w-full max-w-lg pt-6 pb-28 sm:pb-24 text-center relative z-20 border-t mt-6 transition-colors ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all shadow-md group ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-slate-200/60'
              : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/15 text-zinc-300 hover:text-white hover:shadow-purple-500/20'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
          <span>Plateforme officielle propulsée par</span>
          <span className="text-purple-600 dark:text-purple-400 font-extrabold transition-colors">MonPodium</span>
        </a>
      </footer>
    </div>
  )
}

export default function ArtistHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Chargement de la vitrine...</div>}>
      <ArtistHubContent />
    </Suspense>
  )
}
