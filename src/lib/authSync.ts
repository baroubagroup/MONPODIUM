import { createClient } from '@/lib/supabase/client'
import { Release, SocialLink, Plan, AccountType } from '@/types'
import { INITIAL_ADMIN_USERS, AdminArtistUser } from '@/lib/adminData'

export interface UserProfileData {
  id?: string
  email: string
  full_name: string
  artist_name: string
  username: string
  account_type?: AccountType
  bio?: string
  genre?: string
  genres?: string[]
  country?: string
  theme_color?: string
  theme_mode?: 'dark' | 'light'
  avatar_url?: string | null
  banner_url?: string | null
  banner_color?: string
  booking_email?: string | null
  booking_phone?: string | null
  booking_enabled?: boolean
  plan?: Plan
  verified?: boolean
  account_status?: 'active' | 'suspended' | 'banned'
  pwa_enabled?: boolean
  pwa_name?: string
  pwa_icon_url?: string | null
  social_links?: SocialLink[]
}

const STORAGE_KEY_USER = 'monpodium_demo_user'
const STORAGE_KEY_RELEASES_PREFIX = 'monpodium_releases_'
const STORAGE_KEY_ADMIN_USERS = 'monpodium_admin_users'

/**
 * Checks if Supabase has real configured credentials (not placeholder)
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    url.startsWith('http') &&
    key.length > 20
  )
}

/**
 * Get current authenticated user profile across Supabase and local storage
 */
export async function getActiveUserProfile(): Promise<UserProfileData | null> {
  // 1. Try Supabase Auth first if configured
  if (isSupabaseConfigured()) {
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
          const profileData: UserProfileData = {
            id: user.id,
            email: user.email || profile.email,
            full_name: profile.full_name || '',
            artist_name: profile.artist_name || 'Artiste',
            username: profile.username || 'artiste',
            account_type: profile.account_type || 'musician',
            bio: profile.bio || '',
            genre: profile.genre || 'Afrobeats',
            genres: profile.genres || (profile.genre ? [profile.genre] : ['Afrobeats']),
            country: profile.country || "Côte d'Ivoire",
            theme_color: profile.theme_color || '#10b981',
            theme_mode: profile.theme_mode || 'dark',
            avatar_url: profile.avatar_url,
            banner_url: profile.banner_url,
            banner_color: profile.banner_color,
            booking_email: profile.booking_email,
            booking_phone: profile.booking_phone,
            booking_enabled: Boolean(profile.booking_email),
            plan: profile.plan || 'free',
            verified: profile.is_verified || false,
            account_status: profile.account_status || 'active',
            pwa_enabled: profile.pwa_enabled ?? true,
            pwa_name: profile.pwa_name || profile.artist_name,
            pwa_icon_url: profile.pwa_icon_url,
          }
          // Mirror into local storage for zero-delay navigation
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profileData))
            registerInAdminUsers(profileData)
          }
          return profileData
        }
      }
    } catch (err) {
      console.debug('Supabase user fetch fallback to local store', err)
    }
  }

  // 2. Read from localStorage if available
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_USER)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {}
    }
  }

  return null
}

/**
 * Register or update the user inside the admin directory
 */
export function registerInAdminUsers(user: UserProfileData) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS)
    const list: AdminArtistUser[] = raw ? JSON.parse(raw) : [...INITIAL_ADMIN_USERS]

    const existingIdx = list.findIndex(
      (u) => u.username.toLowerCase() === user.username.toLowerCase()
    )

    const adminEntry: AdminArtistUser = {
      id: user.id || `user-${user.username}`,
      email: user.email,
      artist_name: user.artist_name,
      username: user.username,
      full_name: user.full_name,
      plan: user.plan || 'free',
      plan_expires_at: null,
      verified: user.verified || false,
      account_status: user.account_status || 'active',
      created_at: new Date().toISOString(),
      country: user.country || "Côte d'Ivoire",
      genres: user.genres || (user.genre ? [user.genre] : ['Afrobeats']),
      bio: user.bio || null,
      avatar_url: user.avatar_url || null,
      banner_url: user.banner_url || null,
      banner_color: user.banner_color || null,
      theme_color: user.theme_color || '#10b981',
      theme_mode: user.theme_mode || 'dark',
      booking_email: user.booking_email || null,
      booking_phone: user.booking_phone || null,
      booking_enabled: Boolean(user.booking_email),
      pwa_enabled: true,
      pwa_name: user.pwa_name || user.artist_name,
      pwa_icon_url: user.pwa_icon_url || null,
      pwa_splash_url: null,
      releases_count: 0,
      total_streams_preview: 0,
      is_flagged_impostor: false,
      moderation_report_count: 0,
      admin_notes: '',
    }

    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...adminEntry }
    } else {
      list.unshift(adminEntry)
    }

    localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(list))
  } catch (err) {
    console.debug('Failed to register in admin directory', err)
  }
}

/**
 * Fetch public artist profile by username across Supabase and local registries
 */
export async function getPublicProfile(username: string): Promise<UserProfileData | null> {
  const cleanUsername = username.toLowerCase().trim()

  // 1. Try Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single()

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || '',
          artist_name: profile.artist_name || cleanUsername,
          username: profile.username,
          bio: profile.bio || '',
          genre: profile.genre || 'Afrobeats',
          genres: profile.genres || (profile.genre ? [profile.genre] : ['Afrobeats']),
          country: profile.country || "Côte d'Ivoire",
          theme_color: profile.theme_color || '#10b981',
          theme_mode: profile.theme_mode || 'dark',
          avatar_url: profile.avatar_url,
          banner_url: profile.banner_url,
          banner_color: profile.banner_color,
          booking_email: profile.booking_email,
          booking_phone: profile.booking_phone,
          booking_enabled: Boolean(profile.booking_email),
          plan: profile.plan || 'free',
          verified: profile.is_verified || false,
          account_status: profile.account_status || 'active',
          pwa_enabled: profile.pwa_enabled ?? true,
          pwa_name: profile.pwa_name || profile.artist_name,
          pwa_icon_url: profile.pwa_icon_url,
        }
      }
    } catch (err) {
      console.debug('Supabase public profile fetch fallback to local', err)
    }
  }

  // 2. Check local admin users registry
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS)
      if (raw) {
        const list: AdminArtistUser[] = JSON.parse(raw)
        const match = list.find((u) => u.username.toLowerCase() === cleanUsername)
        if (match) {
          return {
            id: match.id,
            email: match.email,
            full_name: match.full_name || '',
            artist_name: match.artist_name,
            username: match.username,
            account_type: (match as any).account_type || 'musician',
            bio: match.bio || '',
            genre: match.genres?.[0] || 'Afrobeats',
            genres: match.genres || ['Afrobeats'],
            country: match.country || "Côte d'Ivoire",
            theme_color: match.theme_color || '#10b981',
            theme_mode: match.theme_mode || 'dark',
            avatar_url: match.avatar_url,
            banner_url: match.banner_url,
            booking_email: match.booking_email,
            booking_phone: match.booking_phone,
            booking_enabled: Boolean(match.booking_email),
            plan: match.plan || 'free',
            verified: match.verified || false,
            account_status: match.account_status || 'active',
            pwa_enabled: true,
            pwa_name: match.pwa_name || match.artist_name,
            pwa_icon_url: match.pwa_icon_url,
          }
        }
      }

      // Check current demo user if matching
      const currentDemo = localStorage.getItem(STORAGE_KEY_USER)
      if (currentDemo) {
        const parsed: UserProfileData = JSON.parse(currentDemo)
        if (parsed.username.toLowerCase() === cleanUsername) {
          return parsed
        }
      }
    } catch {}
  }

  return null
}

/**
 * Fetch releases specifically for a given artist username
 */
export async function getArtistReleases(
  username: string,
  userId?: string
): Promise<Release[]> {
  const cleanUsername = username.toLowerCase().trim()

  // 1. Try Supabase if configured and userId or username is given
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      let query = supabase.from('releases').select('*, platform_links(*)')

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .single()
        if (profile?.id) {
          query = query.eq('user_id', profile.id)
        }
      }

      const { data: releases } = await query.order('display_order', { ascending: true })
      if (releases && releases.length > 0) {
        return releases
      }
    } catch (err) {
      console.debug('Supabase releases fetch fallback to local', err)
    }
  }

  // 2. Check local storage for this specific artist
  if (typeof window !== 'undefined') {
    // Check specific user key first
    const specificReleases = localStorage.getItem(`${STORAGE_KEY_RELEASES_PREFIX}${cleanUsername}`)
    if (specificReleases) {
      try {
        const parsed = JSON.parse(specificReleases)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }

    // If current logged-in demo user matches this username, check general 'monpodium_releases'
    const currentUserRaw = localStorage.getItem(STORAGE_KEY_USER)
    if (currentUserRaw) {
      try {
        const currentUser: UserProfileData = JSON.parse(currentUserRaw)
        if (currentUser.username.toLowerCase() === cleanUsername) {
          const generalReleases = localStorage.getItem('monpodium_releases')
          if (generalReleases) {
            const parsed = JSON.parse(generalReleases)
            if (Array.isArray(parsed)) return parsed
          }
        }
      } catch {}
    }
  }

  // If this is HIMRA or KS Bloom (default showcase demo), return demo songs
  if (cleanUsername === 'himra' || cleanUsername === 'ksbloom') {
    const isHimra = cleanUsername === 'himra'
    return [
      {
        id: 'rel-1',
        user_id: 'usr-himra',
        title: isHimra ? 'LEGENDE' : "C'est Dieu",
        slug: isHimra ? 'legende' : 'cest-dieu',
        cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'single',
        release_date: '2024-05-10',
        is_published: true,
        display_order: 0,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: '1', release_id: 'rel-1', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
          { id: '2', release_id: 'rel-1', platform: 'boomplay', url: 'https://www.boomplay.com', display_order: 1 },
          { id: '3', release_id: 'rel-1', platform: 'youtube', url: 'https://www.youtube.com', display_order: 2 },
          { id: '4', release_id: 'rel-1', platform: 'apple_music', url: 'https://music.apple.com', display_order: 3 },
        ],
      },
      {
        id: 'rel-2',
        user_id: 'usr-himra',
        title: isHimra ? 'DRILL ACT' : 'Enfant de Dieu',
        slug: isHimra ? 'drill-act' : 'enfant-de-dieu',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'album',
        release_date: '2023-11-20',
        is_published: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: '5', release_id: 'rel-2', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
          { id: '6', release_id: 'rel-2', platform: 'deezer', url: 'https://www.deezer.com', display_order: 1 },
          { id: '7', release_id: 'rel-2', platform: 'boomplay', url: 'https://www.boomplay.com', display_order: 2 },
        ],
      },
    ]
  }

  // If this is LAMELO (showcase demo), return his 3 songs
  if (cleanUsername === 'lamelo') {
    return [
      {
        id: 'rel-lamelo-1',
        user_id: 'u2',
        title: 'VBGB',
        slug: 'vbgb',
        cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'single',
        release_date: '2026-11-07',
        is_published: true,
        display_order: 0,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: 'l1', release_id: 'rel-lamelo-1', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
        ],
      },
      {
        id: 'rel-lamelo-2',
        user_id: 'u2',
        title: 'JIOOOO',
        slug: 'jioooo',
        cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'album',
        release_date: '2026-11-07',
        is_published: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: 'l2', release_id: 'rel-lamelo-2', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
          { id: 'l3', release_id: 'rel-lamelo-2', platform: 'youtube', url: 'https://youtube.com', display_order: 1 },
          { id: 'l4', release_id: 'rel-lamelo-2', platform: 'boomplay', url: 'https://boomplay.com', display_order: 2 },
        ],
      },
      {
        id: 'rel-lamelo-3',
        user_id: 'u2',
        title: 'A NOUS ALLER',
        slug: 'a-nous-aller',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'ep',
        release_date: '2026-11-06',
        is_published: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: 'l5', release_id: 'rel-lamelo-3', platform: 'youtube', url: 'https://youtube.com', display_order: 0 },
        ],
      },
    ]
  }

  // If this is Roseline Layo (showcase demo), return her real songs
  if (cleanUsername === 'roselinelayo') {
    return [
      {
        id: 'rel-rose-1',
        user_id: 'usr-3',
        title: 'Élu de Dieu',
        slug: 'elu-de-dieu',
        cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'album',
        release_date: '2024-03-12',
        is_published: true,
        display_order: 0,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: 'r1', release_id: 'rel-rose-1', platform: 'spotify', url: 'https://open.spotify.com', display_order: 0 },
          { id: 'r2', release_id: 'rel-rose-1', platform: 'boomplay', url: 'https://boomplay.com', display_order: 1 },
          { id: 'r3', release_id: 'rel-rose-1', platform: 'youtube', url: 'https://youtube.com', display_order: 2 },
        ],
      },
      {
        id: 'rel-rose-2',
        user_id: 'usr-3',
        title: 'Donnez-nous un peu',
        slug: 'donnez-nous-un-peu',
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'single',
        release_date: '2023-09-18',
        is_published: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: 'r4', release_id: 'rel-rose-2', platform: 'youtube', url: 'https://youtube.com', display_order: 0 },
          { id: 'r5', release_id: 'rel-rose-2', platform: 'spotify', url: 'https://open.spotify.com', display_order: 1 },
        ],
      },
      {
        id: 'rel-rose-3',
        user_id: 'usr-3',
        title: 'C’est la vie',
        slug: 'cest-la-vie',
        cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        preview_audio_url: 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg',
        preview_start_ms: 0,
        preview_end_ms: 15000,
        release_type: 'single',
        release_date: '2023-05-04',
        is_published: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        platform_links: [
          { id: 'r6', release_id: 'rel-rose-3', platform: 'boomplay', url: 'https://boomplay.com', display_order: 0 },
        ],
      },
    ]
  }

  // Any other artist starts with empty releases
  return []
}
