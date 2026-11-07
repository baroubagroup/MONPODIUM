'use client'

import React from 'react'
import Link from 'next/link'
import { DashboardThemeProvider, useDashboardTheme } from '@/context/DashboardThemeContext'
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertTriangle,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react'

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isLight, toggleTheme } = useDashboardTheme()

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#09090b] text-white'
    }`}>
      {/* Top Admin Bar */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl px-4 sm:px-8 py-3 transition-colors ${
        isLight
          ? 'bg-white/90 border-slate-200/90 shadow-xs'
          : 'bg-zinc-950/90 border-zinc-800 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Super-Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    MonPodium
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider">
                    Console Admin
                  </span>
                </div>
                <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Centre de Modération & Surveillance Artistes
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Sombre / Mode Clair toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs press-scale cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
              title={isLight ? 'Passer en Mode Sombre' : 'Passer en Mode Clair'}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline">Mode Sombre</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Mode Clair</span>
                </>
              )}
            </button>

            {/* Link back to artist dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all press-scale ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Mon Espace Artiste</span>
            </Link>

            {/* Link to public homepage */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all press-scale"
            >
              <span>Voir le site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {children}
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </DashboardThemeProvider>
  )
}
