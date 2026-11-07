'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardThemeProvider, useDashboardTheme } from '@/context/DashboardThemeContext'
import { toast } from 'sonner'
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
} from 'lucide-react'

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const { isLight, toggleTheme } = useDashboardTheme()

  // Local state for artist info (fetched or mock fallback)
  const [artistName, setArtistName] = useState('KS Bloom')
  const [username, setUsername] = useState('ksbloom')

  useEffect(() => {
    // Check localStorage fallback demo user
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.artist_name) setArtistName(parsed.artist_name)
        if (parsed.username) setUsername(parsed.username)
      } catch {}
    }

    // Try fetching from Supabase session
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profile) {
            setArtistName(profile.artist_name || 'Artiste')
            setUsername(profile.username || 'artiste')
          }
        }
      } catch {}
    }
    fetchUser()
  }, [])

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
    router.push('/')
  }

  const navItems = [
    { label: 'Vue d\'ensemble', href: '/dashboard', icon: Disc3 },
    { label: 'Mes Sorties', href: '/dashboard/releases', icon: Music },
    { label: 'Statistiques & Audiences', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Mon Profil', href: '/dashboard/profile', icon: User },
    { label: 'Paramètres & PWA', href: '/dashboard/settings', icon: Settings },
    { label: 'Mon Plan', href: '/dashboard/upgrade', icon: Sparkles },
  ]

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#08080a] text-white'
    }`}>
      {/* Top Navigation */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        isLight ? 'border-slate-200 bg-white/95 shadow-xs' : 'border-zinc-800/90 bg-zinc-950/85'
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group press-scale">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Disc3 className="w-5 h-5" />
              </div>
              <span className={`font-black text-lg hidden sm:inline tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                MonPodium
              </span>
            </Link>

            <div className={`h-5 w-px mx-1 hidden sm:block ${isLight ? 'bg-slate-200' : 'bg-zinc-800'}`} />

            {/* Quick Share Link Box */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs border transition-colors ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}>
              <span className="font-mono hidden md:inline opacity-80">
                monpodium.com/{username}
              </span>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-500 font-bold transition-colors cursor-pointer"
                title="Copier mon lien"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
              <Link
                href={`/${username}`}
                target="_blank"
                className={`transition-colors ml-1 ${
                  isLight ? 'text-slate-400 hover:text-slate-900' : 'text-zinc-500 hover:text-white'
                }`}
                title="Voir ma vitrine en direct"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button (Sombre vs Clair) */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer press-scale shadow-xs ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white'
              }`}
              title={isLight ? 'Basculer en Mode Sombre (OLED Night)' : 'Basculer en Mode Clair (Blanc Chic)'}
            >
              {isLight ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="hidden md:inline">{isLight ? 'Mode Sombre' : 'Mode Clair'}</span>
            </button>

            {/* Admin Console Link */}
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer press-scale shadow-xs ${
                isLight
                  ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                  : 'bg-red-950/40 hover:bg-red-900/50 border-red-800 text-red-300'
              }`}
              title="Console Admin & Modération de la plateforme"
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="hidden lg:inline">Admin</span>
            </Link>

            <Link
              href="/dashboard/releases/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 press-scale"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouvelle sortie</span>
            </Link>

            <button
              onClick={handleLogout}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-red-600 hover:bg-slate-100' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
              }`}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className={`max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t ${
          isLight ? 'border-slate-200 bg-white/50' : 'border-zinc-800 bg-zinc-950/30'
        }`}>
          {navItems.map((item) => {
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {children}
      </main>
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
