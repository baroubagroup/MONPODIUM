'use client'

import React from 'react'
import Link from 'next/link'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Disc3, ArrowRight, Sparkles } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-black/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Disc3 className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            MonPodium
          </span>
        </Link>

        {/* Links & CTA */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/#offerte"
            className="hidden md:inline-block text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Offre Gratuite
          </Link>

          <Link
            href="/auth/login"
            className="text-xs font-semibold text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            Connexion
          </Link>

          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>

          <Link
            href="/auth/register"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Créer mon podium</span>
            <span className="sm:hidden">Créer</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  )
}
