'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Disc3, Sparkles, ArrowRight, Music2, User, Star, Mail, Lock, AlertCircle } from 'lucide-react'
import { registerInAdminUsers, UserProfileData, isSupabaseConfigured } from '@/lib/authSync'
import { syncPwaProfileToServer } from '@/lib/pwaClient'
import { AccountType } from '@/types'
import { CountrySelect } from '@/components/common/CountrySelect'

export default function RegisterPage() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType>('musician')
  const [fullName, setFullName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [genre, setGenre] = useState('Afrobeats')
  const [country, setCountry] = useState("Côte d'Ivoire")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPublicFigure = accountType === 'public_figure'

  // Auto-generate username from artist/public name if empty
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

    const cleanUsername = slugify(username || artistName || (isPublicFigure ? 'personnalite' : 'artiste'))
    const finalArtistName = artistName.trim() || (isPublicFigure ? 'Profil Officiel' : 'Artiste')

    // Build the initial dedicated profile
    const profileData: UserProfileData = {
      id: `user-${cleanUsername}-${Date.now()}`,
      email: email.trim(),
      full_name: fullName.trim(),
      artist_name: finalArtistName,
      username: cleanUsername,
      account_type: accountType,
      genre: genre,
      genres: [genre],
      country: country,
      booking_email: email.trim(),
      theme_color: '#10b981',
      theme_mode: 'dark',
      plan: 'free',
      verified: false,
      account_status: 'active',
      pwa_enabled: true,
      pwa_name: finalArtistName,
    }

    try {
      // 1. If Supabase is configured, create the auth user
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                artist_name: finalArtistName,
                username: cleanUsername,
                account_type: accountType,
                genre,
              },
            },
          })

          if (signUpError) {
            if (signUpError.message.includes('already registered')) {
              throw new Error('Un compte avec cette adresse email existe déjà. Veuillez vous connecter.')
            }
          }

          if (data?.user) {
            profileData.id = data.user.id
            // Upsert profile in Supabase table
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email.trim(),
              full_name: fullName.trim(),
              artist_name: finalArtistName,
              username: cleanUsername,
              account_type: accountType,
              genre,
              genres: [genre],
              country: country,
              booking_email: email.trim(),
              theme_color: '#10b981',
              theme_mode: 'dark',
              plan: 'free',
              is_verified: false,
              account_status: 'active',
            })
          }
        } catch (err: any) {
          if (err.message && err.message.includes('déjà')) {
            throw err
          }
          console.debug('Supabase sign-up proceeding with synchronized profile', err)
        }
      }

      // 2. Always persist to localStorage for instant dedicated workspace
      localStorage.setItem('monpodium_demo_user', JSON.stringify(profileData))
      localStorage.setItem(`monpodium_profile_${cleanUsername}`, JSON.stringify(profileData))
      registerInAdminUsers(profileData)

      // Start new user with their own fresh releases list
      localStorage.setItem('monpodium_releases', JSON.stringify([]))
      localStorage.setItem(`monpodium_releases_${cleanUsername}`, JSON.stringify([]))
      await syncPwaProfileToServer(profileData, { force: true })

      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la création de votre compte.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#08080a] text-white">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2 mb-6 group">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <Disc3 className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
        </div>
        <span className="font-black text-2xl tracking-tight text-white">
          MonPodium
        </span>
      </Link>

      <div className="w-full max-w-md rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Créer ton Hub Officiel</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Rejoins MonPodium et crée ta vitrine certifiée en 2 minutes chrono.
          </p>
        </div>

        {/* SELECTEUR DU TYPE DE COMPTE (AVATAR) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Quel type de vitrine souhaitez-vous créer ?
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAccountType('musician')
                if (genre === 'Créateur de contenu') setGenre('Afrobeats')
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                accountType === 'musician'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Music2 className="w-4 h-4" />
              <span>Artiste Musicien</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('public_figure')
                setGenre('Créateur de contenu')
              }}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                accountType === 'public_figure'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Personnalité / Créateur</span>
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 px-1">
            {accountType === 'musician'
              ? '🎵 Vitrine avec lecteur audio 15s, liens de streaming (Spotify, Boomplay...) et discographie.'
              : '⭐ Vitrine officielle anti-usurpation avec réseaux vérifiés (WhatsApp, Insta...), partenariats et PWA.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom officiel vs Nom de scène / d'influenceur */}
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
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{isPublicFigure ? 'Nom public / Marque' : "Nom d'artiste (scène)"}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => handleArtistNameChange(e.target.value)}
                  placeholder={isPublicFigure ? 'Ex: Apoutchou National' : 'Ex: HIMRA'}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-emerald-500/60 focus:border-emerald-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Username / URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">
              Ton lien certifié MonPodium
            </label>
            <div className="flex items-center px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus-within:border-emerald-500 text-sm text-zinc-400">
              <span className="text-zinc-500 text-xs mr-1">monpodium.com/</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(slugify(e.target.value))}
                placeholder={isPublicFigure ? 'apoutchou' : 'himra'}
                className="w-full bg-transparent text-white font-semibold focus:outline-none text-sm placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Catégorie / Style / Domaine */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">
              {isPublicFigure ? "Domaine d'activité principal" : "Genre musical principal"}
            </label>
            {isPublicFigure ? (
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-sm text-white focus:outline-none"
              >
                <option value="Créateur de contenu">Créateur de contenu / Influenceur</option>
                <option value="Humour & Comédie">Humoriste & Comédien</option>
                <option value="Sport & Athlète">Sportif / Athlète / Fitness</option>
                <option value="Mode & Beauté">Mode & Beauté</option>
                <option value="Entrepreneuriat & Conférence">Entrepreneuriat & Conférence</option>
                <option value="Médias & TV/Radio">Animateur / Média TV/Radio</option>
                <option value="Autre">Autre domaine public</option>
              </select>
            ) : (
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-sm text-white focus:outline-none"
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
            )}
          </div>

          {/* Pays de résidence */}
          <div className="space-y-1">
            <CountrySelect
              label="Pays de résidence"
              value={country}
              onChange={(newCountry) => setCountry(newCountry)}
              isLight={false}
              placeholder="Sélectionnez votre pays"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Email professionnel</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@domaine.com"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
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
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Création en cours...</span>
            ) : (
              <>
                <span>Créer ma vitrine officielle gratuite (0 FCFA)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
          <span>Déjà un compte ? </span>
          <Link href="/auth/login" className="text-emerald-400 hover:underline font-bold">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
