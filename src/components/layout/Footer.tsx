import React from 'react'
import Link from 'next/link'
import { Disc3, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/80 py-12 px-4 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <Disc3 className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base">MonPodium</span>
          <span className="text-zinc-500 text-xs">— Prends ta place.</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <Link href="/#features" className="hover:text-white transition-colors">
            Fonctionnalités
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">
            Tarifs
          </Link>
          <Link href="/auth/register" className="hover:text-white transition-colors">
            Pour les artistes
          </Link>
          <Link href="/auth/login" className="hover:text-white transition-colors">
            Espace membre
          </Link>
        </div>

        <div className="text-xs text-zinc-500 flex items-center gap-1">
          <span>Fait pour les artistes avec</span>
          <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
          <span>© {new Date().getFullYear()} MonPodium</span>
        </div>
      </div>
    </footer>
  )
}
