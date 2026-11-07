'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Disc3, Sparkles, ArrowRight, Music2, User, Mail, Lock, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [genre, setGenre] = useState('Afrobeats')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate username from artist name if empty
  const handleArtistNameChange = (val: string) => {
    setArtistName(val)
    if (!username || username === slugify(artistName)) {
      setUsername(slugify(val))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Sign up with Supabase Auth + metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            artist_name: artistName,
            username: slugify(username),
            genre,
          },
        },
      })

      if (signUpError) {
        // If Supabase keys aren't set in dev, simulate mock login to test UI
        if (signUpError.message.includes('fetch') || signUpError.message.includes('URL')) {
          localStorage.setItem('monpodium_demo_user', JSON.stringify({
            id: 'demo-user-1',
            email,
            full_name: fullName,
            artist_name: artistName,
            username: slugify(username),
            genre,
            plan: 'free',
          }))
          router.push('/dashboard')
          return
        }
        throw signUpError
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la création de votre compte.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#08080a] text-white">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
          <Disc3 className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
        </div>
        <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-purple-300 bg-clip-text text-transparent">
          MonPodium
        </span>
      </Link>

      <div className="w-full max-w-md rounded-3xl bg-zinc-900/90 border border-zinc-800 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Créer ton compte artiste</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Rejoins MonPodium et crée ta vitrine musicale en 2 minutes.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom officiel vs Nom d'artiste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">
                Nom officiel (état civil)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jean Kouassi"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Nom d'artiste (public)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => handleArtistNameChange(e.target.value)}
                  placeholder="Ex: KS Bloom"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-purple-500/60 focus:border-purple-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Username / URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">
              Ton lien personnalisé
            </label>
            <div className="flex items-center px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-purple-500 text-sm text-zinc-400">
              <span className="text-zinc-500 text-xs mr-1">monpodium.com/</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(slugify(e.target.value))}
                placeholder="ksbloom"
                className="w-full bg-transparent text-white font-semibold focus:outline-none text-sm placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Genre musical */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">
              Genre musical principal
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-sm text-white focus:outline-none"
            >
              <option value="Afrobeats">Afrobeats</option>
              <option value="Rap / Hip-Hop">Rap / Hip-Hop</option>
              <option value="Gospel">Gospel</option>
              <option value="Coupé Décalé">Coupé Décalé</option>
              <option value="Amapiano">Amapiano</option>
              <option value="R&B / Soul">R&B / Soul</option>
              <option value="Reggae / Dancehall">Reggae / Dancehall</option>
              <option value="Autre">Autre style musical</option>
            </select>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artiste@email.com"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
          >
            {loading ? (
              <span>Création en cours...</span>
            ) : (
              <>
                <span>Créer mon podium gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
          <span>Déjà un compte ? </span>
          <Link href="/auth/login" className="text-purple-400 hover:underline font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
