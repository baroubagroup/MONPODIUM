'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PWAInstallBanner } from '@/components/artist/PWAInstallBanner'
import { BookingModal } from '@/components/artist/BookingModal'
import { ShareProfileModal } from '@/components/artist/ShareProfileModal'
import { ReportProfileModal } from '@/components/artist/ReportProfileModal'
import { SocialLinks } from '@/components/artist/SocialLinks'
import { ReleasesCarousel } from '@/components/artist/ReleasesCarousel'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { Release, SocialLink, PLATFORMS, AccountType } from '@/types'
import { recordPageView } from '@/lib/tracker'
import { getPublicProfile, getArtistReleases } from '@/lib/authSync'
import { INITIAL_ADMIN_USERS } from '@/lib/adminData'
import { SafeImage } from '@/components/common/SafeImage'
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
  Lock,
  Flag,
} from 'lucide-react'

function getInitialProfileSync(cleanUsername: string) {
  if (typeof window !== 'undefined') {
    try {
      const dedicatedRaw = localStorage.getItem(`monpodium_profile_${cleanUsername}`)
      if (dedicatedRaw) {
        const parsed = JSON.parse(dedicatedRaw)
        if (parsed) return parsed
      }
      const demoRaw = localStorage.getItem('monpodium_demo_user')
      if (demoRaw) {
        const demo = JSON.parse(demoRaw)
        if ((demo.username || '').toLowerCase() === cleanUsername) {
          return demo
        }
      }
      const adminUsersRaw = localStorage.getItem('monpodium_admin_users')
      if (adminUsersRaw) {
        const adminUsers = JSON.parse(adminUsersRaw)
        if (Array.isArray(adminUsers)) {
          const match = adminUsers.find((u: any) => (u.username || '').toLowerCase() === cleanUsername)
          if (match) return match
        }
      }
    } catch {}
  }

  const seed = INITIAL_ADMIN_USERS.find((u) => u.username.toLowerCase() === cleanUsername)
  if (seed) return seed

  return {
    artist_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
    theme_color: '#10b981',
    theme_mode: 'dark',
    account_type: 'musician',
    avatar_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    banner_url: null,
    banner_color: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
    bio: "Retrouvez ici toutes mes sorties officielles, mes clips et mes réseaux sociaux certifiés.",
    country: "Côte d'Ivoire",
    genres: ['Afrobeats'],
    verified: cleanUsername === 'himra' || cleanUsername === 'ksbloom',
    account_status: 'active',
  }
}

function ArtistHubContent() {
  const params = useParams()
  const rawUsername = (params?.username as string) || 'ksbloom'
  const username = rawUsername.toLowerCase().trim()

  const initial = React.useMemo(() => getInitialProfileSync(username), [username])

  const [accountType, setAccountType] = useState<AccountType>(() => (initial.account_type as AccountType) || 'musician')
  const [artistName, setArtistName] = useState<string>(() => initial.artist_name || (username === 'ksbloom' ? 'KS Bloom' : username))
  const [pwaName, setPwaName] = useState<string>(() => initial.pwa_name || initial.artist_name || (username === 'ksbloom' ? 'KS Bloom' : username))
  const [pwaIconUrl, setPwaIconUrl] = useState<string | null>(() => initial.pwa_icon_url || null)
  const [bio, setBio] = useState<string>(() => initial.bio || "Retrouvez ici toutes mes sorties officielles, mes clips et mes réseaux sociaux certifiés.")
  const [country, setCountry] = useState<string>(() => initial.country || "Côte d'Ivoire")
  const [genres, setGenres] = useState<string[]>(() => initial.genres || (initial.genre ? [initial.genre] : ['Afrobeats']))
  const [themeColor, setThemeColor] = useState<string>(() => initial.theme_color || '#10b981')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => (initial.theme_mode as 'dark' | 'light') || 'dark')
  const [isVerified, setIsVerified] = useState<boolean>(() => initial.verified ?? (username === 'ksbloom' || username === 'himra'))
  const [accountStatus, setAccountStatus] = useState<'active' | 'suspended' | 'banned'>(() => (initial.account_status as 'active' | 'suspended' | 'banned') || 'active')
  const [avatarUrl, setAvatarUrl] = useState<string>(() => initial.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80')
  const [bannerUrl, setBannerUrl] = useState<string | null>(() => initial.banner_url || null)
  const [bannerColor, setBannerColor] = useState<string>(() => initial.banner_color || 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)')

  const [bookingEnabled, setBookingEnabled] = useState<boolean>(() => Boolean(initial.booking_email || initial.booking_enabled))
  const [bookingEmail, setBookingEmail] = useState<string | null>(() => initial.booking_email || null)
  const [bookingPhone, setBookingPhone] = useState<string | null>(() => initial.booking_phone || null)
  const [pwaEnabled, setPwaEnabled] = useState(true)
  const [copied, setCopied] = useState(false)

  // Official verified social links (no raw URLs)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => initial.social_links || [])

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Discography (Releases)
  const [releases, setReleases] = useState<Release[]>([])

  useEffect(() => {
    const loadArtistPage = async () => {
      // 1. Fetch public profile by username
      const profile = await getPublicProfile(username)
      if (profile) {
        if (profile.account_type) setAccountType(profile.account_type)
        if (profile.artist_name) setArtistName(profile.artist_name)
        setPwaName(profile.pwa_name || profile.artist_name)
        if (profile.pwa_icon_url) setPwaIconUrl(profile.pwa_icon_url)
        if (profile.bio !== undefined) setBio(profile.bio)
        if (profile.country) setCountry(profile.country)
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        if (profile.banner_url !== undefined) setBannerUrl(profile.banner_url)
        if (profile.banner_color) setBannerColor(profile.banner_color)
        if (profile.theme_color) {
          setThemeColor(profile.theme_color)
          if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--artist-theme-color', profile.theme_color)
          }
        }
        if (profile.theme_mode) setThemeMode(profile.theme_mode)
        if (profile.genres && Array.isArray(profile.genres) && profile.genres.length > 0) {
          setGenres(profile.genres)
        } else if (profile.genre) {
          setGenres([profile.genre])
        }
        if (profile.verified !== undefined) setIsVerified(profile.verified)
        if (profile.account_status) setAccountStatus(profile.account_status)
        if (profile.booking_email) {
          setBookingEmail(profile.booking_email)
          setBookingEnabled(profile.booking_enabled ?? true)
        }
        if (profile.booking_phone) setBookingPhone(profile.booking_phone)
        if (profile.social_links && Array.isArray(profile.social_links)) {
          setSocialLinks(profile.social_links)
        }

        // 2. Load releases specifically for musicians only
        if (profile.account_type !== 'public_figure') {
          const userReleases = await getArtistReleases(username, profile.id)
          setReleases(userReleases)
        } else {
          setReleases([])
        }
      } else if (username === 'himra' || username === 'ksbloom') {
        // Fallback for default showcase artist
        const isHimra = username === 'himra'
        const demoName = isHimra ? 'HIMRA' : 'KS Bloom'
        setArtistName(demoName)
        setPwaName(demoName)
        setBio(
          isHimra
            ? "Artiste rappeur & performer ivoirien. Retrouvez ici toutes mes sorties officielles, mes exclusivités et mes liens de streaming certifiés."
            : "Artiste chanteur gospel & afrobeats ivoirien. Retrouvez ici toutes mes sorties officielles, mes clips et mes réseaux sociaux certifiés."
        )
        setGenres(isHimra ? ['Rap Ivoire', 'Drill', 'Afrobeats'] : ['Afrobeats', 'Gospel', 'Afro-Trap'])
        setIsVerified(true)
        setBookingEmail(isHimra ? 'booking@himra.ci' : 'booking@ksbloom.com')
        setBookingEnabled(true)
        setSocialLinks([
          { id: '1', user_id: 'u1', platform: 'facebook', url: `https://facebook.com/${username}` },
          { id: '2', user_id: 'u1', platform: 'instagram', url: `https://instagram.com/${username}` },
          { id: '3', user_id: 'u1', platform: 'tiktok', url: `https://tiktok.com/@${username}` },
          { id: '4', user_id: 'u1', platform: 'youtube', url: `https://youtube.com/@${username}` },
        ])
        const userReleases = await getArtistReleases(username)
        setReleases(userReleases)
      } else {
        // Unknown or freshly created username
        setArtistName(username.charAt(0).toUpperCase() + username.slice(1))
        setPwaName(username.charAt(0).toUpperCase() + username.slice(1))
        setReleases([])
      }
    }

    loadArtistPage()

    document.title = `${artistName} — Hub Officiel & Discographie`

    // Inject artist specific PWA Manifest & Icons
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = `/api/manifest/${username}`

    // Inject artist specific Apple Touch Icon (iOS home screen icon)
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
    if (!appleIcon) {
      appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleIcon)
    }
    appleIcon.href = `/api/icon/${username}`

    // Inject artist specific Favicon (replaces Next.js default N logo)
    let favIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (!favIcon) {
      favIcon = document.createElement('link')
      favIcon.rel = 'icon'
      document.head.appendChild(favIcon)
    }
    favIcon.href = `/api/icon/${username}`

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
    <div
      style={{ '--artist-theme-color': themeColor } as React.CSSProperties}
      className={`min-h-screen flex flex-col items-center justify-between relative overflow-x-hidden transition-colors duration-300 ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070709] text-white'}`}
    >
      {/* Early inline script to guarantee zero-flash of unstyled or default colors */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var u = "${username}";
                var p = localStorage.getItem('monpodium_profile_' + u);
                if (!p) {
                  var d = localStorage.getItem('monpodium_demo_user');
                  if (d) {
                    var parsed = JSON.parse(d);
                    if (parsed && (parsed.username || '').toLowerCase() === u) p = d;
                  }
                }
                if (p) {
                  var obj = JSON.parse(p);
                  if (obj && obj.theme_color) {
                    document.documentElement.style.setProperty('--artist-theme-color', obj.theme_color);
                  }
                }
              } catch(e) {}
            })();
          `
        }}
      />

      {/* Dynamic ambient background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full opacity-20 blur-[180px] pointer-events-none"
        style={{ backgroundColor: 'var(--artist-theme-color, ' + themeColor + ')' }}
      />

      {/* Top Floating Glass Navigation Bar */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b py-3 px-4 transition-colors ${isLight ? 'bg-white/80 border-slate-200/90 text-slate-900 shadow-xs' : 'bg-black/40 border-white/5 text-white'}`}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: 'var(--artist-theme-color, ' + themeColor + ')' }}
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Report discreet button */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-xs'
                  : 'bg-zinc-900/90 border-zinc-750 text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
              }`}
              title="Signaler ce profil ou usurpation"
              aria-label="Signaler ce profil"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>

            {/* Quick theme switcher for visitor */}
            <button
              onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-full border transition-all ${isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs' : 'bg-zinc-900/90 border-zinc-750 text-zinc-300 hover:text-white'}`}
              title={isLight ? 'Activer le Mode Sombre' : 'Activer le Mode Clair'}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" style={{ color: 'var(--artist-theme-color, ' + themeColor + ')' }} /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Partager modal trigger button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hub Container */}
      <main className="w-full max-w-lg mx-auto px-4 pb-4 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Moderation Suspension Security Notice */}
        {accountStatus === 'suspended' && (
          <div className="w-full p-4 rounded-3xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs flex items-start gap-3.5 shadow-2xl animate-pulse">
            <div className="w-9 h-9 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-left space-y-1">
              <strong className="block text-sm font-black text-white uppercase tracking-wider">
                Profil Suspendu par la Modération MonPodium
              </strong>
              <span className="leading-snug block opacity-95">
                Ce compte a fait l&apos;objet d&apos;une mesure conservatoire pour suspicion d&apos;usurpation d&apos;identité ou non-respect de la charte. Tous les liens et écoutes sont verrouillés.
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
          </div>

          {/* Overlapping Avatar & Artist Header */}
          <div className="px-6 pb-6 pt-0 relative -mt-16 text-center space-y-4">
            {/* Avatar with customized glowing ring */}
            <div
              className={`relative mx-auto w-32 h-32 rounded-3xl overflow-hidden p-1 shadow-2xl border-2 transition-all duration-300 ${
                isLight ? 'bg-white ring-4 ring-slate-100' : 'bg-zinc-950'
              }`}
              style={{
                borderColor: 'var(--artist-theme-color, ' + themeColor + ')',
                boxShadow: `0 0 25px ${themeColor}40, 0 10px 25px rgba(0,0,0,0.5)`,
              }}
            >
              <div className="w-full h-full rounded-[20px] overflow-hidden bg-zinc-900">
                <SafeImage
                  src={avatarUrl}
                  alt={artistName}
                  fallbackType="avatar"
                  fallbackText={artistName}
                  themeColor={themeColor}
                  isLight={isLight}
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

              {/* Discrete Verified Sticker */}
              {isVerified && (
                <div className="flex justify-center pt-0.5">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs backdrop-blur-md"
                    title="Compte officiel vérifié et certifié par l'équipe MonPodium"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Compte Officiel Authentifié</span>
                  </div>
                </div>
              )}

              {/* Multi-genres Tags & Country */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                {genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-xs border transition-colors"
                    style={{
                      backgroundColor: `${themeColor}1a`,
                      borderColor: `${themeColor}45`,
                      color: 'var(--artist-theme-color, ' + themeColor + ')',
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

            {/* Booking Button (Only if enabled and account is active) */}
            {accountStatus !== 'suspended' && bookingEnabled && bookingEmail && (
              <div className="pt-1">
                <BookingModal
                  artistName={artistName}
                  artistUsername={username}
                  bookingEmail={bookingEmail}
                  bookingPhone={bookingPhone}
                  bookingEnabled={bookingEnabled}
                  themeColor={themeColor}
                  themeMode={themeMode}
                />
              </div>
            )}

            {/* Menu de navigation sous le profil */}
            <nav className={`flex items-center justify-center gap-1.5 pt-3 pb-0.5 border-t mt-4 flex-wrap ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm text-white"
                style={{
                  backgroundColor: 'var(--artist-theme-color, ' + themeColor + ')',
                  boxShadow: `0 3px 12px ${themeColor}55`,
                }}
              >
                {accountType === 'public_figure' ? 'Profil & Liens' : 'Bio & Sorties'}
              </span>

              {accountStatus !== 'suspended' && accountType !== 'public_figure' && releases.length > 0 && (
                <Link
                  href={`/${username}/discographie`}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <Disc3 className="w-3.5 h-3.5" style={{ color: 'var(--artist-theme-color, ' + themeColor + ')' }} />
                  <span>Discographie</span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.2 rounded-full border"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      borderColor: `${themeColor}40`,
                      color: 'var(--artist-theme-color, ' + themeColor + ')',
                    }}
                  >
                    {releases.length}
                  </span>
                </Link>
              )}

              {accountStatus !== 'suspended' && socialLinks.length > 0 && (
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

        {/* INTERACTIVE SECTIONS OR LOCKED MODERATION STATE */}
        {accountStatus === 'suspended' ? (
          <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-red-950/20 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">Contenu & Liens Verrouillés</h3>
              <p className="text-xs text-red-200/90 max-w-sm mx-auto leading-relaxed">
                Ce profil est actuellement sous mesure de suspension administrative par MonPodium. Les écoutes musicales, les sorties et les liens vers les réseaux externes sont désactivés pour la sécurité des utilisateurs.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION 1: SORTIES MUSICALES (Uniquement si compte musique et morceaux disponibles) */}
            {accountType !== 'public_figure' && releases.length > 0 && (
              <div className="pt-1">
                <ReleasesCarousel
                  releases={releases}
                  username={username}
                  themeColor={themeColor}
                  themeMode={themeMode}
                />
              </div>
            )}

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

            {/* SECTION 3: PWA INSTALLATION BANNER */}
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
          </>
        )}
      </main>

      {/* Footer Branding & Discreet Report Link */}
      <footer className={`w-full max-w-lg pt-6 pb-28 sm:pb-24 text-center relative z-20 border-t mt-6 transition-colors ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all shadow-md group ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-slate-200/60'
              : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/15 text-zinc-300 hover:text-white hover:shadow-emerald-500/20'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          <span>Plateforme officielle propulsée par</span>
          <span className="text-emerald-500 font-extrabold transition-colors">MonPodium</span>
        </a>

        {/* Discreet link to report profile */}
        <div className="pt-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-red-400 font-semibold transition-colors cursor-pointer"
          >
            <Flag className="w-3 h-3" />
            <span>Signaler ce compte ou une usurpation</span>
          </button>
        </div>
      </footer>

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        artistName={artistName}
        username={username}
        avatarUrl={avatarUrl}
        themeColor={themeColor}
        isLight={isLight}
        accountType={accountType}
      />

      {/* Report Impostor Profile Modal */}
      <ReportProfileModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        artistName={artistName}
        username={username}
        themeColor={themeColor}
        isLight={isLight}
      />
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
