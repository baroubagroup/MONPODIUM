'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Disc3, ArrowRight, AlertCircle } from 'lucide-react'
import { isSupabaseConfigured, UserProfileData, registerInAdminUsers } from '@/lib/authSync'
import { AdminArtistUser, INITIAL_ADMIN_USERS } from '@/lib/adminData'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. If Supabase is configured, authenticate with Supabase Auth
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (signInError) {
          throw signInError
        }

        if (data?.user) {
          // Fetch corresponding profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profile) {
            const profileData: UserProfileData = {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || '',
              artist_name: profile.artist_name || 'Artiste',
              username: profile.username,
              bio: profile.bio || '',
              genre: profile.genre || 'Afrobeats',
              genres: profile.genres || [profile.genre || 'Afrobeats'],
              country: profile.country || "Côte d'Ivoire",
              theme_color: profile.theme_color || '#9333ea',
              theme_mode: profile.theme_mode || 'dark',
              avatar_url: profile.avatar_url,
              banner_url: profile.banner_url,
              booking_email: profile.booking_email,
              booking_phone: profile.booking_phone,
              booking_enabled: Boolean(profile.booking_email),
              plan: profile.plan || 'free',
              verified: profile.is_verified || false,
              account_status: profile.account_status || 'active',
              pwa_enabled: profile.pwa_enabled ?? true,
              pwa_name: profile.pwa_name || profile.artist_name,
            }
            localStorage.setItem('monpodium_demo_user', JSON.stringify(profileData))
            registerInAdminUsers(profileData)

            // Fetch releases
            const { data: dbReleases } = await supabase
              .from('releases')
              .select('*, platform_links(*)')
              .eq('user_id', profile.id)
              .order('display_order', { ascending: true })

            if (dbReleases) {
              localStorage.setItem('monpodium_releases', JSON.stringify(dbReleases))
              localStorage.setItem(`monpodium_releases_${profile.username}`, JSON.stringify(dbReleases))
            }

            router.push('/dashboard')
            return
          }
        }
      }

      // 2. Check local accounts registry (fallback or local testing)
      const rawUsers = localStorage.getItem('monpodium_admin_users')
      const adminUsers: AdminArtistUser[] = rawUsers ? JSON.parse(rawUsers) : [...INITIAL_ADMIN_USERS]
      const matchedUser = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail)

      if (matchedUser) {
        const profileData: UserProfileData = {
          id: matchedUser.id,
          email: matchedUser.email,
          full_name: matchedUser.full_name || '',
          artist_name: matchedUser.artist_name,
          username: matchedUser.username,
          bio: matchedUser.bio || '',
          genre: matchedUser.genres?.[0] || 'Afrobeats',
          genres: matchedUser.genres || ['Afrobeats'],
          country: matchedUser.country || "Côte d'Ivoire",
          theme_color: matchedUser.theme_color || '#9333ea',
          theme_mode: matchedUser.theme_mode || 'dark',
          avatar_url: matchedUser.avatar_url,
          banner_url: matchedUser.banner_url,
          booking_email: matchedUser.booking_email,
          booking_phone: matchedUser.booking_phone,
          plan: matchedUser.plan || 'free',
          verified: matchedUser.verified || false,
          account_status: matchedUser.account_status || 'active',
          pwa_enabled: true,
          pwa_name: matchedUser.pwa_name || matchedUser.artist_name,
        }
        localStorage.setItem('monpodium_demo_user', JSON.stringify(profileData))

        // Retrieve user specific releases or start empty
        const userReleases = localStorage.getItem(`monpodium_releases_${matchedUser.username}`)
        if (userReleases) {
          localStorage.setItem('monpodium_releases', userReleases)
        } else {
          localStorage.setItem('monpodium_releases', JSON.stringify([]))
        }

        router.push('/dashboard')
        return
      }

      // 3. Fallback: if not found and password length >= 6, auto-provision
      const fallbackUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_-]/g, '') || 'artiste'
      const newProfile: UserProfileData = {
        id: `user-${fallbackUsername}`,
        email: cleanEmail,
        full_name: '',
        artist_name: fallbackUsername,
        username: fallbackUsername,
        genre: 'Afrobeats',
        country: "Côte d'Ivoire",
        plan: 'free',
        theme_color: '#9333ea',
        theme_mode: 'dark',
      }
      localStorage.setItem('monpodium_demo_user', JSON.stringify(newProfile))
      registerInAdminUsers(newProfile)
      localStorage.setItem('monpodium_releases', JSON.stringify([]))
      localStorage.setItem(`monpodium_releases_${fallbackUsername}`, JSON.stringify([]))

      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Identifiants invalides ou problème de connexion.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#08080a] text-white">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
          <Disc3 className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
        </div>
        <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-purple-300 bg-clip-text text-transparent">
          MonPodium
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl bg-zinc-900/90 border border-zinc-800 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Connexion Artiste</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gère tes sorties musicales et ton application mobile
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artiste@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-400">Mot de passe</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-purple-500 text-sm text-white placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span>Connexion...</span>
            ) : (
              <>
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
          <span>Pas encore de compte ? </span>
          <Link href="/auth/register" className="text-purple-400 hover:underline font-semibold">
            Créer mon podium gratuit
          </Link>
        </div>
      </div>
    </div>
  )
}
