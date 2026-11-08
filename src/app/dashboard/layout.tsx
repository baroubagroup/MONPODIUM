'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardThemeProvider, useDashboardTheme } from '@/context/DashboardThemeContext'
import { toast } from 'sonner'
import { getActiveUserProfile } from '@/lib/authSync'
import { SafeImage } from '@/components/common/SafeImage'
import {
  Disc3,
  Music,
  BarChart3,
  User,
  Settings,
  Sparkles,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  Sun,
  Moon,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  Share2,
} from 'lucide-react'

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const { isLight, toggleTheme } = useDashboardTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Local state for artist info (fetched or mock fallback)
  const [artistName, setArtistName] = useState('Mon Espace')
  const [username, setUsername] = useState('')
  const [accountType, setAccountType] = useState<'musician' | 'public_figure'>('musician')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState('#9333ea')
  const [plan, setPlan] = useState<'free' | 'starter' | 'pro'>('free')

  useEffect(() => {
    const loadUser = async () => {
      const profile = await getActiveUserProfile()
      if (profile) {
        setArtistName(profile.artist_name || 'Mon Espace')
        setUsername(profile.username || 'artiste')
        if (profile.account_type) setAccountType(profile.account_type)
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
        if (profile.theme_color) setThemeColor(profile.theme_color)
        if (profile.plan) setPlan(profile.plan)
      } else {
        router.push('/auth/login')
      }
    }
    loadUser()
  }, [router])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const copyLink = () => {
    const url = `${window.location.origin}/${username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Lien copié !', { description: url })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('monpodium_demo_user')
    toast.success('Déconnexion réussie')
    router.push('/')
  }

  const desktopNavItems = [
    { label: "Vue d'ensemble", href: '/dashboard', icon: Disc3 },
    { label: accountType === 'public_figure' ? 'Sorties (Musique)' : 'Mes Sorties', href: '/dashboard/releases', icon: Music },
    { label: 'Statistiques & Audiences', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Mon Profil & Liens', href: '/dashboard/profile', icon: User },
    { label: 'Paramètres & PWA', href: '/dashboard/settings', icon: Settings },
    { label: 'Mon Plan', href: '/dashboard/upgrade', icon: Sparkles },
  ]

  const mobileDockItems = [
    { label: 'Accueil', href: '/dashboard', icon: Disc3 },
    {
      label: accountType === 'public_figure' ? 'Profil/Liens' : 'Sorties',
      href: accountType === 'public_figure' ? '/dashboard/profile' : '/dashboard/releases',
      icon: accountType === 'public_figure' ? User : Music,
    },
    { label: 'Ajouter', href: '/dashboard/releases/new', icon: PlusCircle, isAction: true },
    { label: 'Stats', href: '/dashboard/analytics', icon: BarChart3 },
  ]

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#08080a] text-white'
    }`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isLight ? 'border-slate-200 bg-white/95 shadow-xs' : 'border-zinc-800/90 bg-zinc-950/85'
      }`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 group press-scale">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
                <Disc3 className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className={`font-black text-base sm:text-lg tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                MonPodium
              </span>
            </Link>

            <div className={`h-5 w-px mx-0.5 sm:mx-1 hidden sm:block ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`} />

            {/* Quick Share Link Box (Desktop and Mobile) */}
            <div className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs border transition-colors ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}>
              <span className="font-mono hidden md:inline opacity-80">
                monpodium.com/{username}
              </span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-500 font-bold transition-colors cursor-pointer press-scale"
                title="Copier mon lien"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline">{copied ? 'Copié !' : 'Copier'}</span>
              </button>
              <Link
                href={`/${username}`}
                target="_blank"
                className={`transition-colors ml-0.5 ${
                  isLight ? 'text-slate-400 hover:text-slate-900' : 'text-zinc-500 hover:text-white'
                }`}
                title="Voir ma vitrine en direct"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Toggle Button (Sombre vs Clair) */}
            <button
              onClick={toggleTheme}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer press-scale shadow-xs ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white'
              }`}
              title={isLight ? 'Basculer en Mode Sombre' : 'Basculer en Mode Clair'}
              aria-label="Basculer le thème"
            >
              {isLight ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="hidden md:inline">{isLight ? 'Mode Sombre' : 'Mode Clair'}</span>
            </button>

            {/* Admin Console Link (Desktop) */}
            <Link
              href="/admin"
              className={`hidden sm:flex px-3 py-1.5 rounded-xl border text-xs font-bold transition-all items-center gap-1.5 cursor-pointer press-scale shadow-xs ${
                isLight
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                  : 'bg-red-950/40 hover:bg-red-900/50 border-red-800 text-red-300'
              }`}
              title="Console Admin & Modération de la plateforme"
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="hidden lg:inline">Admin</span>
            </Link>

            {/* Desktop Add Release Button */}
            <Link
              href="/dashboard/releases/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 press-scale"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nouvelle sortie</span>
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer press-scale ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-zinc-900 border-zinc-700 text-white'
              }`}
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className={`hidden md:block p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-red-600 hover:bg-slate-100' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
              }`}
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop-only Sub-navigation horizontal tabs */}
        <div className={`hidden md:flex max-w-6xl mx-auto px-4 items-center gap-1 overflow-x-auto no-scrollbar border-t ${
          isLight ? 'border-slate-200 bg-white/50' : 'border-zinc-800 bg-zinc-950/30'
        }`}>
          {desktopNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all press-scale ${
                  isActive
                    ? 'border-purple-600 text-purple-600'
                    : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Content Area - with bottom padding on mobile to never hide behind bottom dock */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-5 md:py-8 pb-28 md:pb-8">
        {children}
      </main>

      {/* WHATSAPP / SPOTIFY STYLE MOBILE BOTTOM DOCK (Mobile First Navigation) */}
      <nav
        aria-label="Barre de navigation mobile"
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-2xl transition-all ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
            : 'bg-zinc-950/95 border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]'
        } pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 px-3`}
      >
        <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
          {/* 1. Accueil */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-black transition-all press-scale ${
              pathname === '/dashboard'
                ? 'text-purple-600 dark:text-purple-400 scale-105'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Disc3 className={`w-5 h-5 mb-0.5 ${pathname === '/dashboard' ? 'animate-spin-slow' : ''}`} />
              {pathname === '/dashboard' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-600" />
              )}
            </div>
            <span>Accueil</span>
          </Link>

          {/* 2. Mes Sorties */}
          <Link
            href="/dashboard/releases"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-black transition-all press-scale ${
              pathname === '/dashboard/releases'
                ? 'text-purple-600 dark:text-purple-400 scale-105'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Music className="w-5 h-5 mb-0.5" />
              {pathname === '/dashboard/releases' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-600" />
              )}
            </div>
            <span>Sorties</span>
          </Link>

          {/* 3. Central Action: + Nouvelle sortie */}
          <Link
            href="/dashboard/releases/new"
            aria-label="Ajouter une nouvelle sortie musicale"
            className="flex flex-col items-center justify-center -mt-5 group press-scale"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 border-2 border-white dark:border-zinc-950 group-hover:scale-105 group-active:scale-95 transition-transform">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 mt-0.5">
              Ajouter
            </span>
          </Link>

          {/* 4. Stats & Audiences */}
          <Link
            href="/dashboard/analytics"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-black transition-all press-scale ${
              pathname === '/dashboard/analytics'
                ? 'text-purple-600 dark:text-purple-400 scale-105'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <BarChart3 className="w-5 h-5 mb-0.5" />
              {pathname === '/dashboard/analytics' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-600" />
              )}
            </div>
            <span>Stats</span>
          </Link>

          {/* 5. Menu Drawer Trigger (Sandwich) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-black transition-all cursor-pointer press-scale ${
              mobileMenuOpen
                ? 'text-purple-600 dark:text-purple-400'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
            }`}
            aria-label="Ouvrir le menu complet"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* MOBILE SHEET / SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Slide-Up Bottom Sheet Panel */}
          <div className={`fixed bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto rounded-t-[32px] border-t p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 z-10 transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-zinc-950 border-white/10 text-white'
          } pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]`}>
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

            {/* Header with Artist Profile */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-purple-500/30 flex-shrink-0">
                  <SafeImage
                    src={avatarUrl}
                    alt={artistName}
                    fallbackType="avatar"
                    fallbackText={artistName}
                    themeColor={themeColor}
                    isLight={isLight}
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-base truncate max-w-[170px]">{artistName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                      {plan.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold truncate">
                    @{username}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-900 text-zinc-300'
                }`}
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Public Link Card */}
            <div className="mt-4 p-3.5 rounded-2xl border bg-purple-500/10 border-purple-500/25 flex items-center justify-between gap-3 text-left">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400 block">
                  Ma vitrine publique
                </span>
                <span className="text-xs font-mono font-bold truncate block">
                  monpodium.com/{username}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={copyLink}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md press-scale cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié' : 'Copier'}</span>
                </button>
                <Link
                  href={`/${username}`}
                  target="_blank"
                  className={`p-2 rounded-xl border transition-colors ${
                    isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                  }`}
                  title="Voir en direct"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Navigation Menu List */}
            <div className="mt-4 space-y-1">
              <Link
                href="/dashboard/profile"
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all press-scale ${
                  pathname === '/dashboard/profile'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-800'
                    : 'hover:bg-zinc-900 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-purple-500" />
                  <span>Mon Profil & Bio</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>

              <Link
                href="/dashboard/settings"
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all press-scale ${
                  pathname === '/dashboard/settings'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-800'
                    : 'hover:bg-zinc-900 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>Paramètres & Application PWA</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>

              <Link
                href="/dashboard/upgrade"
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all press-scale ${
                  pathname === '/dashboard/upgrade'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isLight
                    ? 'hover:bg-slate-100 text-slate-800'
                    : 'hover:bg-zinc-900 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Mon Plan & Quotas</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>

              <Link
                href="/admin"
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all press-scale ${
                  pathname === '/admin'
                    ? 'bg-red-600 text-white shadow-md'
                    : isLight
                    ? 'hover:bg-red-50 text-red-700'
                    : 'hover:bg-red-950/40 text-red-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Console Administrateur</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>

            {/* Quick Settings Bar in Drawer */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <button
                onClick={toggleTheme}
                className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer press-scale ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                {isLight ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>{isLight ? 'Mode Sombre' : 'Mode Clair'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-black flex items-center justify-center gap-2 cursor-pointer press-scale"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardThemeProvider>
  )
}
