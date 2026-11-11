'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import {
  User,
  Sparkles,
  Save,
  CheckCircle2,
  Mail,
  Camera,
  ShieldCheck,
  Plus,
  X,
  Image as ImageIcon,
  Palette,
  Check,
  Upload,
  Music2,
  Sun,
  Moon,
  Star,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  QrCode,
  Smartphone,
  Heart,
} from 'lucide-react'
import { SocialPlatform, AccountType } from '@/types'
import { getActiveUserProfile, registerInAdminUsers, isSupabaseConfigured, formatSocialUrl } from '@/lib/authSync'
import { SafeImage } from '@/components/common/SafeImage'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/imageCompressor'
import { CountrySelect } from '@/components/common/CountrySelect'
import { LivePhonePreview } from '@/components/dashboard/LivePhonePreview'
import { OfficialQRCodeModal } from '@/components/common/OfficialQRCodeModal'

const PRESET_GENRES = [
  'Afrobeats',
  'Gospel',
  'Coupé-Décalé',
  'Amapiano',
  'R&B',
  'Rap / Hip-Hop',
  'Afro-Pop',
  'Zoblazo',
  'Reggae',
  'Zouk / Kompa',
]

const PUBLIC_FIGURE_DOMAINS = [
  'Créateur de Contenu',
  'Influenceur Web',
  'Humoriste / Comédien',
  'Entrepreneur',
  'Personnalité TV / Média',
  'Coach & Formateur',
  'Sportif / Athlète',
  'Artiste Visuel / Mode',
  'Acteur / Cinéma',
  'Leader d\'Opinion',
]

const DEFAULT_COVER_PRESETS = [
  {
    id: 'studio-mic',
    name: 'Micro Studio Gold',
    desc: 'Ambiance enregistrement & voix',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'live-concert',
    name: 'Scène Live & Fumée',
    desc: 'Lumières de concert & foule',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'acoustic-guitar',
    name: 'Guitare Acoustique',
    desc: 'Ambiance intime & acoustique',
    url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'dj-mixer',
    name: 'Platines & Égaliseur',
    desc: 'Électro, beats & production',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'neon-city',
    name: 'Néon Violet Urbain',
    desc: 'Ambiance urbaine nocturne',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
  },
]

const ARTIST_COLOR_SWATCHES = [
  { name: 'Bleu Royal', hex: '#2563eb' },
  { name: 'Vert Émeraude', hex: '#10b981' },
  { name: 'Rouge Passion', hex: '#dc2626' },
  { name: 'Violet Astral', hex: '#7c3aed' },
  { name: 'Or Afro', hex: '#d97706' },
  { name: 'Rose Néon', hex: '#db2777' },
  { name: 'Cyan Cyber', hex: '#0891b2' },
  { name: 'Titane Sombre', hex: '#27272a' },
]

function generateGradientFromColor(hex: string) {
  return `linear-gradient(135deg, ${hex} 0%, rgba(15, 15, 24, 0.92) 60%, #060608 100%)`
}

const GRADIENT_PRESETS = [
  { name: 'Néon Violet', value: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #1e1b4b 100%)' },
  { name: 'Afro Gold', value: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #1c1917 100%)' },
  { name: 'Deep Cyber', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #0f172a 100%)' },
  { name: 'Sunset Soul', value: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 50%, #18181b 100%)' },
  { name: 'Sombre Studio', value: 'linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)' },
]

const AVAILABLE_NETWORKS: { id: SocialPlatform; label: string; placeholder: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp Officiel (Direct / Pro)', placeholder: 'https://wa.me/22501020304 ou +225...' },
  { id: 'instagram', label: 'Compte Instagram Officiel', placeholder: 'https://instagram.com/monnom' },
  { id: 'tiktok', label: 'Compte TikTok Officiel', placeholder: 'https://tiktok.com/@monnom' },
  { id: 'facebook', label: 'Page Facebook Officielle', placeholder: 'https://facebook.com/monnom' },
  { id: 'youtube', label: 'Chaîne YouTube Officielle', placeholder: 'https://youtube.com/@monnom' },
  { id: 'twitter', label: 'Compte X / Twitter', placeholder: 'https://x.com/monnom' },
  { id: 'website', label: 'Site Web Officiel / Boutique', placeholder: 'https://monsite.com' },
  { id: 'linkedin', label: 'Profil LinkedIn Professionnel', placeholder: 'https://linkedin.com/in/monnom' },
  { id: 'telegram', label: 'Canal Telegram Officiel', placeholder: 'https://t.me/moncanal' },
  { id: 'snapchat', label: 'Compte Snapchat', placeholder: 'https://snapchat.com/add/monnom' },
  { id: 'threads', label: 'Compte Threads', placeholder: 'https://threads.net/@monnom' },
]

export default function ProfilePage() {
  const { isLight } = useDashboardTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<AccountType>('musician')
  const [fullName, setFullName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('Côte d\'Ivoire')
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Afrobeats'])
  const [customGenreInput, setCustomGenreInput] = useState('')

  // Cover settings
  const [coverMode, setCoverMode] = useState<'image' | 'gradient'>('image')
  const [bannerUrl, setBannerUrl] = useState<string | null>(DEFAULT_COVER_PRESETS[0].url)
  const [bannerColor, setBannerColor] = useState<string>('linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #18181b 100%)')
  const [customColor, setCustomColor] = useState<string>('#9333ea')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')

  // Avatar & Booking
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [bookingEnabled, setBookingEnabled] = useState(false)
  const [bookingEmail, setBookingEmail] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')

  // Fan Support / Tips (Wave & MoMo)
  const [tipEnabled, setTipEnabled] = useState(false)
  const [tipProvider, setTipProvider] = useState<'wave' | 'orange_money' | 'all'>('wave')
  const [tipNumber, setTipNumber] = useState('')
  const [tipNote, setTipNote] = useState('')

  // Modals & Preview Drawer
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  // Social Links with position order
  const [socialLinks, setSocialLinks] = useState<{ platform: SocialPlatform; url: string; display_order?: number }[]>([
    { platform: 'whatsapp', url: '', display_order: 0 },
    { platform: 'instagram', url: '', display_order: 1 },
    { platform: 'tiktok', url: '', display_order: 2 },
    { platform: 'facebook', url: '', display_order: 3 },
    { platform: 'youtube', url: '', display_order: 4 },
  ])

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getActiveUserProfile()
      if (profile) {
        if (profile.id) setUserId(profile.id)
        if (profile.account_type) setAccountType(profile.account_type)
        if (profile.full_name) setFullName(profile.full_name)
        if (profile.artist_name) setArtistName(profile.artist_name)
        if (profile.username) setUsername(profile.username)
        if (profile.bio !== undefined) setBio(profile.bio)
        if (profile.country) setCountry(profile.country)
        if (profile.genres && Array.isArray(profile.genres) && profile.genres.length > 0) {
          setSelectedGenres(profile.genres)
        } else if (profile.genre) {
          setSelectedGenres([profile.genre])
        }
        if (profile.banner_url !== undefined) {
          setBannerUrl(profile.banner_url)
          if (profile.banner_url) setCoverMode('image')
        }
        if (profile.banner_color) {
          setBannerColor(profile.banner_color)
          if (!profile.banner_url) setCoverMode('gradient')
        }
        if (profile.theme_color) setCustomColor(profile.theme_color)
        if (profile.theme_mode) setThemeMode(profile.theme_mode)
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        if (profile.booking_enabled !== undefined) setBookingEnabled(profile.booking_enabled)
        else if (profile.booking_email) setBookingEnabled(true)
        if (profile.booking_email) setBookingEmail(profile.booking_email)
        if (profile.booking_phone) setBookingPhone(profile.booking_phone)
        if (profile.tip_enabled !== undefined) setTipEnabled(profile.tip_enabled)
        if (profile.tip_provider) setTipProvider(profile.tip_provider)
        if (profile.tip_number) setTipNumber(profile.tip_number)
        if (profile.tip_note) setTipNote(profile.tip_note)
        if (profile.social_links && Array.isArray(profile.social_links) && profile.social_links.length > 0) {
          const sorted = [...profile.social_links].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          setSocialLinks(sorted.map((item, idx) => ({ ...item, display_order: item.display_order ?? idx })))
        }
      }
    }
    loadProfile()
  }, [])

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.85)
        setAvatarUrl(compressed)
        toast.success('Photo de profil sélectionnée !')
      } catch (err) {
        console.error('Erreur compression avatar:', err)
        toast.error('Erreur lors du traitement de l\'image')
      }
    }
  }

  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 1200, 500, 0.82)
        setBannerUrl(compressed)
        setCoverMode('image')
        toast.success('Photo de couverture prête !')
      } catch (err) {
        console.error('Erreur compression couverture:', err)
        toast.error('Erreur lors du traitement de la couverture')
      }
    }
  }

  const applyPresetImage = (url: string) => {
    setBannerUrl(url)
    setCoverMode('image')
  }

  const applyCustomColorGradient = (colorHex: string) => {
    setCustomColor(colorHex)
    const gradient = generateGradientFromColor(colorHex)
    setBannerColor(gradient)
    setBannerUrl(null)
    setCoverMode('gradient')
  }

  const applyPresetGradient = (gradValue: string) => {
    setBannerColor(gradValue)
    setBannerUrl(null)
    setCoverMode('gradient')
  }

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const addCustomGenre = () => {
    const trimmed = customGenreInput.trim()
    if (!trimmed) return
    if (!selectedGenres.includes(trimmed)) {
      setSelectedGenres([...selectedGenres, trimmed])
    }
    setCustomGenreInput('')
  }

  const handleSocialChange = (platform: SocialPlatform, url: string) => {
    setSocialLinks(prev => {
      const exists = prev.some(l => l.platform === platform)
      if (exists) {
        return prev.map(l => (l.platform === platform ? { ...l, url } : l))
      } else {
        return [...prev, { platform, url, display_order: prev.length }]
      }
    })
  }

  const moveSocialUp = (index: number) => {
    if (index <= 0) return
    setSocialLinks(prev => {
      const next = [...prev]
      const temp = next[index - 1]
      next[index - 1] = next[index]
      next[index] = temp
      return next.map((item, idx) => ({ ...item, display_order: idx }))
    })
  }

  const moveSocialDown = (index: number) => {
    setSocialLinks(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      const temp = next[index + 1]
      next[index + 1] = next[index]
      next[index] = temp
      return next.map((item, idx) => ({ ...item, display_order: idx }))
    })
  }

  const addPlatform = (platform: SocialPlatform) => {
    setSocialLinks(prev => {
      if (prev.some(l => l.platform === platform)) return prev
      return [...prev, { platform, url: '', display_order: prev.length }]
    })
  }

  const removePlatform = (platform: SocialPlatform) => {
    setSocialLinks(prev => prev.filter(l => l.platform !== platform).map((item, idx) => ({ ...item, display_order: idx })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const localUser = localStorage.getItem('monpodium_demo_user')
    const current = localUser ? JSON.parse(localUser) : {}

    const cleanUser = (username || current.username || 'artiste').toLowerCase().trim()

    const updated = {
      ...current,
      id: userId || current.id,
      full_name: fullName,
      artist_name: artistName,
      username: cleanUser,
      account_type: accountType,
      bio,
      country,
      genres: selectedGenres,
      banner_url: coverMode === 'image' ? bannerUrl : null,
      banner_color: bannerColor,
      theme_color: customColor,
      theme_mode: themeMode,
      avatar_url: avatarUrl,
      pwa_icon_url: current.pwa_icon_url || avatarUrl,
      pwa_name: current.pwa_name || artistName,
      booking_enabled: bookingEnabled,
      booking_email: bookingEmail,
      booking_phone: bookingPhone,
      tip_enabled: tipEnabled,
      tip_provider: tipProvider,
      tip_number: tipNumber,
      tip_note: tipNote,
      social_links: socialLinks
        .map((l, idx) => {
          const rawUrl = (l.url || '').trim()
          return {
            ...l,
            url: formatSocialUrl(l.platform, rawUrl),
            display_order: l.display_order ?? idx,
          }
        })
        .filter(l => l.url.trim() !== ''),
    }

    // 1. Sync to Supabase if available
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { data: authData } = await supabase.auth.getUser()
        const effectiveId = authData?.user?.id || userId || current.id

        if (effectiveId) {
          await supabase.from('profiles').update({
            full_name: fullName,
            artist_name: artistName,
            account_type: accountType,
            bio,
            country,
            genres: selectedGenres,
            banner_url: coverMode === 'image' ? bannerUrl : null,
            banner_color: bannerColor,
            theme_color: customColor,
            theme_mode: themeMode,
            avatar_url: avatarUrl,
            booking_email: bookingEmail,
            booking_phone: bookingPhone,
          }).eq('id', effectiveId)

          // Sync social links in Supabase
          const validLinks = updated.social_links || []
          try {
            await supabase.from('social_links').delete().eq('user_id', effectiveId)
            if (validLinks.length > 0) {
              const insertData = validLinks.map((l: any, idx: number) => ({
                user_id: effectiveId,
                platform: l.platform,
                url: l.url.trim(),
                title: l.platform,
                display_order: l.display_order ?? idx,
              }))
              await supabase.from('social_links').insert(insertData)
            }
          } catch (linksErr) {
            console.debug('Failed to sync social links in Supabase', linksErr)
          }
        }
      } catch (err) {
        console.debug('Failed to sync profile update to Supabase', err)
      }
    }

    // 2. Persist locally and update in admin directory
    localStorage.setItem('monpodium_demo_user', JSON.stringify(updated))
    localStorage.setItem(`monpodium_profile_${cleanUser}`, JSON.stringify(updated))
    registerInAdminUsers(updated)

    setSaved(true)
    toast.success('Profil artiste mis à jour !', {
      description: 'Ta vitrine publique reflète désormais tes modifications.',
    })
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Mon Profil & Page Bio
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Personnalise ta couverture, ta photo de profil, tes styles musicaux et tes réseaux certifiés.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile Preview Trigger */}
          <button
            type="button"
            onClick={() => setShowMobilePreview(true)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Aperçu Mobile</span>
          </button>

          {/* Official HD QR Code Button */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-500" />
            <span>Mon QR Code HD</span>
          </button>

          {/* View Live Public Showcase */}
          <a
            href={`/${(username || 'artiste').toLowerCase().trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all cursor-pointer"
          >
            <span>Voir en direct</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </div>

      {saved && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">Profil et page bio enregistrés avec succès !</span>
        </div>
      )}

      {/* Main 2-Column Grid: Form + Live Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* SELECTEUR DU TYPE DE COMPTE / AVATAR */}
        <div className={`rounded-3xl border p-5 sm:p-6 space-y-3 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Type de Vitrine MonPodium</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Choisis la structure adaptée à ton activité pour ta page officielle.
              </p>
            </div>
            <div className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <button
                type="button"
                onClick={() => setAccountType('musician')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  accountType === 'musician'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Music2 className="w-4 h-4" />
                <span>Artiste Musicien</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('public_figure')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  accountType === 'public_figure'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Personnalité / Créateur</span>
              </button>
            </div>
          </div>
          <div className={`text-[11px] p-3 rounded-xl border flex items-center gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
          }`}>
            <span>💡</span>
            <span>
              {accountType === 'musician'
                ? 'Mode Musique actif : vitrine avec lecteur audio 15s instantané, streaming stores (Spotify, Boomplay, Apple...) et discographie.'
                : 'Mode Personnalité & Créateur actif : vitrine officielle épurée avec réseaux vérifiés, WhatsApp officiel, partenariats et PWA.'}
            </span>
          </div>
        </div>

        {/* SECTION 1: BANNIÈRE DE COUVERTURE & PHOTO DE PROFIL */}
        <div className={`rounded-3xl border overflow-hidden space-y-5 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Image de Couverture (Bannière) & Photo de Profil</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Personnalise l&apos;ambiance visuelle : 5 photos officielles, upload de ton image, ou dégradé à ton code couleur.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setCoverMode('image')
                    if (!bannerUrl) {
                      setBannerUrl(DEFAULT_COVER_PRESETS[0].url)
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer press-scale ${
                    coverMode === 'image'
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Music2 className="w-3.5 h-3.5" />
                  <span>5 Photos & Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCoverMode('gradient')
                    applyCustomColorGradient(customColor)
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer press-scale ${
                    coverMode === 'gradient'
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Dégradé & Mon Code Couleur</span>
                </button>
              </div>
            </div>

            {/* Quick Choice: Vitrine Sombre ou Claire */}
            <div className={`pt-3 flex items-center justify-between border-t mt-3 ${
              isLight ? 'border-slate-200' : 'border-zinc-800/80'
            }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                isLight ? 'text-slate-700' : 'text-zinc-300'
              }`}>
                <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Thème de ta vitrine publique :</span>
              </span>
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer press-scale ${
                    themeMode === 'dark'
                      ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Mode Sombre</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer press-scale ${
                    themeMode === 'light'
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Mode Clair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Live Banner Preview with Overlapping Avatar */}
          <div className="px-6 space-y-5">
            <div
              className={`relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden border flex items-end p-4 sm:p-5 shadow-xl transition-all ${
                isLight ? 'border-slate-300' : 'border-zinc-700/80'
              }`}
              style={{
                background: bannerUrl ? `url(${bannerUrl}) center/cover no-repeat` : bannerColor,
                backgroundColor: '#09090b',
              }}
            >
              {/* Overlay shadow for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

              <div className="relative z-10 flex items-end justify-between w-full gap-3">
                {/* Overlapping Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-zinc-950 group flex-shrink-0">
                  <SafeImage
                    src={avatarUrl}
                    alt={artistName}
                    fallbackType="avatar"
                    fallbackText={artistName}
                    themeColor={customColor}
                    isLight={isLight}
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity z-10">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Modifier</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Quick Upload Action on Banner */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 border border-white/20 text-white font-bold text-xs shadow-lg backdrop-blur-md transition-colors press-scale">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Importer ma photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* TAB 1: 5 DEFAULT MUSIC IMAGES & UPLOAD */}
            {coverMode === 'image' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold flex items-center gap-1.5 ${
                    isLight ? 'text-slate-800' : 'text-zinc-300'
                  }`}>
                    <Music2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Choisis l&apos;une des 5 images officielles ou importe ton fichier :</span>
                  </label>
                  <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    5 thèmes visuels
                  </span>
                </div>

                {/* 5 Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {DEFAULT_COVER_PRESETS.map((preset) => {
                    const isSelected = bannerUrl === preset.url
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPresetImage(preset.url)}
                        className={`group relative rounded-xl overflow-hidden border text-left transition-all p-1.5 flex flex-col gap-1.5 cursor-pointer press-scale ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20'
                            : isLight
                            ? 'border-slate-200 hover:border-slate-300 bg-slate-50'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div className="px-0.5 pb-0.5">
                          <p className={`text-[11px] font-bold truncate ${
                            isSelected
                              ? 'text-emerald-600 dark:text-emerald-300'
                              : isLight ? 'text-slate-800' : 'text-zinc-300'
                          }`}>
                            {preset.name}
                          </p>
                          <p className={`text-[9px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            {preset.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: DYNAMIC COLOR PICKER & SCENIC GRADIENT GENERATOR */}
            {coverMode === 'gradient' && (
              <div className={`space-y-4 pt-1 rounded-2xl border p-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/70 border-zinc-800/80'
              }`}>
                <div className="space-y-1">
                  <label className={`text-xs font-bold flex items-center gap-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Sélecteur de code couleur personnalisé :</span>
                  </label>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Définis ta couleur d&apos;artiste (bleu, vert, rouge, or...) : un dégradé de scène professionnel est généré automatiquement.
                  </p>
                </div>

                {/* Interactive Color Picker & Hex Input */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-white border-slate-300' : 'bg-zinc-900 border-zinc-700'
                  }`}>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => applyCustomColorGradient(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className={`text-xs font-mono font-bold uppercase ${
                      isLight ? 'text-slate-800' : 'text-zinc-300'
                    }`}>
                      {customColor}
                    </span>
                  </div>

                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    ou clique sur une couleur d&apos;artiste rapide :
                  </span>
                </div>

                {/* Quick Color Swatches */}
                <div className="flex flex-wrap gap-2">
                  {ARTIST_COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => applyCustomColorGradient(swatch.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer press-scale ${
                        customColor.toLowerCase() === swatch.hex.toLowerCase()
                          ? isLight
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm scale-105'
                            : 'border-white text-white shadow-md scale-105'
                          : isLight
                          ? 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                          : 'border-zinc-800 hover:border-zinc-700 text-zinc-400 bg-zinc-900/60'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/20"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>

                {/* Or Classic Ambient Gradients */}
                <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-zinc-800/80'}`}>
                  <label className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Modèles de dégradés scéniques prédéfinis :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENT_PRESETS.map((grad, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyPresetGradient(grad.value)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer press-scale ${
                          isLight
                            ? 'border-slate-200 bg-white hover:border-emerald-500 text-slate-700'
                            : 'border-zinc-800 bg-zinc-900/80 hover:border-emerald-500 text-zinc-300'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ background: grad.value }} />
                        <span>{grad.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="h-2" />
        </div>

        {/* SECTION 2: IDENTITÉ & STYLES MUSICAUX MULTIPLES */}
        <div className={`rounded-3xl border p-6 sm:p-7 space-y-5 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <h2 className={`text-sm font-bold flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Identité & Styles Musicaux (Polyvalence)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-bold flex items-center gap-1 ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nom d&apos;artiste (public)</span>
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-emerald-300 focus:border-emerald-500 text-slate-900'
                    : 'bg-zinc-950 border-emerald-500/60 focus:border-emerald-500 text-white'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Nom officiel (état civil - confidentiel)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jean-Luc Kouassi"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 focus:border-emerald-500 text-slate-900'
                    : 'bg-zinc-950 border-zinc-800 focus:border-emerald-500 text-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <CountrySelect
              label="Pays de résidence"
              value={country}
              onChange={(newCountry) => setCountry(newCountry)}
              isLight={isLight}
              placeholder="Sélectionnez votre pays"
            />
          </div>

          {/* MULTI-GENRES / DOMAINS SELECTION & CUSTOM TAG CREATION */}
          <div className="space-y-3 pt-2">
            <div>
              <label className={`text-xs font-bold flex items-center justify-between ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <span>
                  {accountType === 'public_figure'
                    ? 'Domaines d\'activité & Titres officiels (Choix multiple)'
                    : 'Genres & Styles musicaux (Choix multiple)'}
                </span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  {selectedGenres.length} sélectionné(s)
                </span>
              </label>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {accountType === 'public_figure'
                  ? 'Indique tes rôles (ex: Créateur, Influenceur, Entrepreneur) pour valoriser ton profil officiel.'
                  : 'Sélectionne tous les styles que tu pratiques, ou saisis ton propre style personnalisé.'}
              </p>
            </div>

            {/* Presets Chips */}
            <div className="flex flex-wrap gap-2">
              {(accountType === 'public_figure' ? PUBLIC_FIGURE_DOMAINS : PRESET_GENRES).map((g) => {
                const isSelected = selectedGenres.includes(g)
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer press-scale ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {g}
                  </button>
                )
              })}
            </div>

            {/* Custom Genre/Domain Adder */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customGenreInput}
                onChange={(e) => setCustomGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomGenre()
                  }
                }}
                placeholder={
                  accountType === 'public_figure'
                    ? 'Ajouter un domaine (ex: Podcasteur, Photographe, Modèle...)'
                    : 'Ajouter un style (ex: Afro-Gospel, Mandingue...)'
                }
                className={`flex-1 px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={addCustomGenre}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer press-scale ${
                  isLight
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Selected Genres Display */}
            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedGenres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className="hover:opacity-75 cursor-pointer ml-0.5"
                      title="Supprimer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Biographie & Présentation officielle
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Rédige ici ta biographie officielle..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none resize-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* SECTION 3: RÉSEAUX SOCIAUX CERTIFIÉS & LIENS (AVEC ORDRE PERSONNALISÉ) */}
        <div className={`rounded-3xl border p-6 sm:p-7 space-y-4 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className={`text-sm font-black flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Réseaux Sociaux Officiels & Liens Certifiés</span>
              </h2>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Ordre Réorganisable (⬆️ ⬇️)
              </span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Ces liens s&apos;affichent sur ta page publique avec protection anti-usurpation. Modifie l&apos;ordre pour mettre en avant ce que tu veux (ex: WhatsApp en #1, puis Instagram et ton Site Web).
            </p>
          </div>

          {/* LISTE DES LIENS AVEC RÉORGANISATION */}
          <div className="space-y-3 pt-2">
            {socialLinks.map((item, idx) => {
              const netInfo = AVAILABLE_NETWORKS.find(n => n.id === item.platform) || {
                id: item.platform,
                label: item.platform,
                placeholder: 'https://...',
              }
              const isFirst = idx === 0

              return (
                <div
                  key={`${item.platform}-${idx}`}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Position Badge */}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0 ${
                        isFirst
                          ? 'bg-emerald-500 text-zinc-950 shadow-xs'
                          : isLight ? 'bg-slate-200 text-slate-700' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {isFirst && <Star className="w-2.5 h-2.5 fill-current" />}
                        <span>#{idx + 1} {isFirst ? 'Premier lien' : ''}</span>
                      </span>
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                        {netInfo.label}
                      </span>
                    </div>

                    {/* Up / Down Controls & Remove */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveSocialUp(idx)}
                        disabled={idx === 0}
                        title="Monter la position"
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSocialDown(idx)}
                        disabled={idx === socialLinks.length - 1}
                        title="Descendre la position"
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          isLight
                            ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlatform(item.platform)}
                        title="Supprimer ce réseau"
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ml-1 ${
                          isLight
                            ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-600'
                            : 'bg-red-950/40 border-red-900/60 hover:bg-red-900/40 text-red-400'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => handleSocialChange(item.platform, e.target.value)}
                    placeholder={netInfo.placeholder}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                        : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          {/* AJOUTER D'AUTRES RÉSEAUX DISPONIBLES */}
          <div className={`p-4 rounded-2xl border space-y-2 mt-3 ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-zinc-950/60 border-zinc-850'
          }`}>
            <span className={`text-[11px] font-bold block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              + Ajouter un autre lien ou réseau officiel :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_NETWORKS.filter(n => !socialLinks.some(l => l.platform === n.id)).map(net => (
                <button
                  key={net.id}
                  type="button"
                  onClick={() => addPlatform(net.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Plus className="w-3 h-3 text-emerald-500" />
                  <span>{net.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: BOOKING & MANAGEMENT */}
        <div className={`rounded-3xl border p-6 sm:p-7 space-y-4 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={`text-sm font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Contact & Booking Professionnel</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Principalement destiné au management et aux demandes de concerts ou collaborations par email.
              </p>
            </div>

            {/* Toggle Booking */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={bookingEnabled}
                onChange={(e) => setBookingEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {bookingEnabled && (
            <div className={`space-y-4 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                  Email de booking / management officiel *
                </label>
                <input
                  type="email"
                  required={bookingEnabled}
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="booking@monlabel.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                      : 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Téléphone professionnel (Optionnel)
                </label>
                <input
                  type="tel"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  placeholder="Ex: +225 07 00 00 00 00 (optionnel)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                      : 'bg-zinc-950 border-zinc-800 text-white focus:border-emerald-500'
                  }`}
                />
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Laisse vide si tu ne souhaites être contacté que par email.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* WAVE & MOBILE MONEY FAN SUPPORT / TIP SECTION */}
        <div className={`p-6 rounded-3xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between pb-3">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌊</span>
                <h2 className={`text-sm font-bold flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <span>Soutien & Dons Directs des Fans (Wave / Mobile Money)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                    Direct & 0% Frais
                  </span>
                </h2>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Permets à tes fans et supporters de t'envoyer des dons et pourboires en 1 clic via Wave ou Mobile Money.
              </p>
            </div>

            {/* Toggle Tipping */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={tipEnabled}
                onChange={(e) => setTipEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {tipEnabled && (
            <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  Moyen de paiement favori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'wave', label: '🌊 Wave', desc: 'Lien direct 1-clic' },
                    { id: 'orange_money', label: '🟠 Orange Money', desc: 'MoMo CI / SN' },
                    { id: 'all', label: '⚡ Tous réseaux', desc: 'Wave + MoMo' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTipProvider(p.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        tipProvider === p.id
                          ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400 shadow-sm'
                          : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-700'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="block font-black">{p.label}</span>
                      <span className="text-[10px] opacity-70 block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Numéro Wave / Mobile Money *
                </label>
                <input
                  type="tel"
                  required={tipEnabled}
                  value={tipNumber}
                  onChange={(e) => setTipNumber(e.target.value)}
                  placeholder="Ex: +225 07 00 00 00 00"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                      : 'bg-zinc-950 border-zinc-800 text-white focus:border-cyan-500'
                  }`}
                />
                <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Indique l'indicatif international (ex: +225 pour la Côte d'Ivoire, +221 pour le Sénégal).
                </p>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Mot ou remerciement aux fans (Optionnel)
                </label>
                <input
                  type="text"
                  value={tipNote}
                  onChange={(e) => setTipNote(e.target.value)}
                  placeholder="Ex: Merci de soutenir mon art et mes prochains projets indépendants !"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-500'
                      : 'bg-zinc-950 border-zinc-800 text-white focus:border-cyan-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer press-scale"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer toutes les modifications</span>
        </button>
      </form>
    </div>

    {/* Right Column: Sticky Live iPhone Preview (Desktop) */}
    <div className="hidden lg:block lg:col-span-5 sticky top-6 space-y-3">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Aperçu iPhone en temps réel</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
          Live Sync 0ms
        </span>
      </div>

      <LivePhonePreview
        artistName={artistName}
        username={username || 'artiste'}
        accountType={accountType}
        bio={bio}
        country={country}
        themeColor={customColor}
        themeMode={themeMode}
        avatarUrl={avatarUrl}
        bannerUrl={coverMode === 'image' ? bannerUrl : null}
        bannerColor={bannerColor}
        genres={selectedGenres}
        socialLinks={socialLinks}
        bookingEnabled={bookingEnabled}
        tipEnabled={tipEnabled}
      />
    </div>
  </div>

  {/* Mobile Preview Modal */}
  {showMobilePreview && (
    <div className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm flex items-center justify-between pb-3 text-white">
        <span className="text-xs font-bold flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Rendu Mobile en Direct</span>
        </span>
        <button
          onClick={() => setShowMobilePreview(false)}
          className="p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
          aria-label="Fermer l'aperçu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[85vh] w-full flex justify-center">
        <LivePhonePreview
          artistName={artistName}
          username={username || 'artiste'}
          accountType={accountType}
          bio={bio}
          country={country}
          themeColor={customColor}
          themeMode={themeMode}
          avatarUrl={avatarUrl}
          bannerUrl={coverMode === 'image' ? bannerUrl : null}
          bannerColor={bannerColor}
          genres={selectedGenres}
          socialLinks={socialLinks}
          bookingEnabled={bookingEnabled}
          tipEnabled={tipEnabled}
        />
      </div>
    </div>
  )}

  {/* Official HD QR Code Modal */}
  <OfficialQRCodeModal
    isOpen={isQrModalOpen}
    onClose={() => setIsQrModalOpen(false)}
    artistName={artistName || 'Artiste'}
    username={(username || 'artiste').toLowerCase().trim()}
    avatarUrl={avatarUrl}
    themeColor={customColor}
    isLight={isLight}
  />
</div>
  )
}
