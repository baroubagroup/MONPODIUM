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
  tip_enabled?: boolean
  tip_provider?: 'wave' | 'orange_money' | 'all'
  tip_number?: string | null
  tip_note?: string | null
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
 * Normalize and sanitize social media URLs, handles, or phone numbers
 */
export function formatSocialUrl(platform: string, raw: string): string {
  const trimmed = (raw || '').trim()
  if (!trimmed) return ''

  // Already a full valid protocol URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Handle WhatsApp (e.g. phone numbers like +225..., 07..., or wa.me/...)
  if (platform === 'whatsapp') {
    if (trimmed.includes('wa.me/')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`
    }
    const digitsOnly = trimmed.replace(/[^\d+]/g, '')
    const cleanNum = digitsOnly.startsWith('+') ? digitsOnly.slice(1) : digitsOnly
    return `https://wa.me/${cleanNum || '22507000000'}`
  }

  // Handle Instagram (@username or username or instagram.com/...)
  if (platform === 'instagram') {
    const handle = trimmed.replace(/^@/, '').replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/\/$/, '')
    return `https://instagram.com/${handle}`
  }

  // Handle Facebook (username or facebook.com/...)
  if (platform === 'facebook') {
    const handle = trimmed.replace(/^(https?:\/\/)?(www\.)?facebook\.com\//i, '').replace(/\/$/, '')
    return `https://facebook.com/${handle}`
  }

  // Handle TikTok (@username or username)
  if (platform === 'tiktok') {
    const clean = trimmed.replace(/^(https?:\/\/)?(www\.)?tiktok\.com\/@?/i, '').replace(/\/$/, '')
    const handle = clean.startsWith('@') ? clean : `@${clean}`
    return `https://tiktok.com/${handle}`
  }

  // Handle YouTube (@channel or youtube.com/...)
  if (platform === 'youtube') {
    if (trimmed.includes('youtube.com/') || trimmed.includes('youtu.be/')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`
    }
    const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`
    return `https://youtube.com/${handle}`
  }

  // Handle Twitter / X
  if (platform === 'twitter') {
    const handle = trimmed.replace(/^@/, '').replace(/^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\//i, '').replace(/\/$/, '')
    return `https://x.com/${handle}`
  }

  // Handle LinkedIn
  if (platform === 'linkedin') {
    if (trimmed.includes('linkedin.com/')) {
      return `https://${trimmed.replace(/^https?:\/\//, '')}`
    }
    return `https://linkedin.com/in/${trimmed.replace(/^@/, '')}`
  }

  // Default web URL
  return `https://${trimmed}`
}

export function getDefaultSocialLinks(username: string, userId?: string): SocialLink[] {
  const clean = username.toLowerCase().trim()
  const uid = userId || `usr-${clean}`
  return [
    { id: `sl-1-${clean}`, user_id: uid, platform: 'whatsapp', url: `https://wa.me/22507000000`, title: 'WhatsApp Pro', display_order: 0 },
    { id: `sl-2-${clean}`, user_id: uid, platform: 'instagram', url: `https://instagram.com/${clean}`, title: 'Instagram Officiel', display_order: 1 },
    { id: `sl-3-${clean}`, user_id: uid, platform: 'facebook', url: `https://facebook.com/${clean}`, title: 'Facebook Officiel', display_order: 2 },
    { id: `sl-4-${clean}`, user_id: uid, platform: 'tiktok', url: `https://tiktok.com/@${clean}`, title: 'TikTok Officiel', display_order: 3 },
    { id: `sl-5-${clean}`, user_id: uid, platform: 'youtube', url: `https://youtube.com/@${clean}`, title: 'YouTube Officiel', display_order: 4 },
  ]
}

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
  // 1. Check local storage first for active user session data to prevent data loss
  let localData: UserProfileData | null = null
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER)
      if (raw) localData = JSON.parse(raw)
    } catch {}
  }

  // 2. Try Supabase Auth first if configured
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
          // Fetch social links from Supabase
          const { data: supaLinks } = await supabase
            .from('social_links')
            .select('*')
            .eq('user_id', user.id)
            .order('display_order', { ascending: true })

          let dedicatedLocal: any = null
          if (typeof window !== 'undefined') {
            try {
              const dRaw = localStorage.getItem(`monpodium_profile_${(profile.username || '').toLowerCase()}`)
              if (dRaw) dedicatedLocal = JSON.parse(dRaw)
            } catch {}
          }

          const effectiveLinks =
            supaLinks && supaLinks.length > 0
              ? supaLinks
              : dedicatedLocal?.social_links && dedicatedLocal.social_links.length > 0
              ? dedicatedLocal.social_links
              : localData?.social_links && localData.social_links.length > 0
              ? localData.social_links
              : getDefaultSocialLinks(profile.username || 'artiste', user.id)

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
            tip_enabled: profile.tip_enabled ?? dedicatedLocal?.tip_enabled ?? localData?.tip_enabled ?? false,
            tip_provider: profile.tip_provider || dedicatedLocal?.tip_provider || localData?.tip_provider || 'wave',
            tip_number: profile.tip_number || dedicatedLocal?.tip_number || localData?.tip_number || null,
            tip_note: profile.tip_note || dedicatedLocal?.tip_note || localData?.tip_note || null,
            plan: profile.plan || 'free',
            verified: profile.is_verified || false,
            account_status: profile.account_status || 'active',
            pwa_enabled: profile.pwa_enabled ?? true,
            pwa_name: profile.pwa_name || profile.artist_name,
            pwa_icon_url: profile.pwa_icon_url,
            social_links: effectiveLinks,
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

  // 3. Read from localStorage if available
  if (localData) {
    return localData
  }

  return null
}

/**
 * Register or update the user inside the admin directory and dedicated profile store
 */
export function registerInAdminUsers(user: UserProfileData) {
  if (typeof window === 'undefined') return
  try {
    const cleanUsername = user.username.toLowerCase().trim()

    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS)
    const list: (AdminArtistUser & { banner_color?: string | null; social_links?: SocialLink[]; account_type?: AccountType })[] = raw ? JSON.parse(raw) : [...INITIAL_ADMIN_USERS]

    const existingIdx = list.findIndex(
      (u) => u.username.toLowerCase() === cleanUsername
    )
    const existingEntry = existingIdx >= 0 ? list[existingIdx] : null

    // Determine final non-empty social links
    const finalLinks =
      user.social_links && user.social_links.length > 0
        ? user.social_links
        : existingEntry?.social_links && existingEntry.social_links.length > 0
        ? existingEntry.social_links
        : getDefaultSocialLinks(cleanUsername, user.id)

    const userWithLinks = {
      ...user,
      social_links: finalLinks,
    }

    // Dedicated per-user key for 100% reliable instantaneous lookup
    localStorage.setItem(`monpodium_profile_${cleanUsername}`, JSON.stringify(userWithLinks))

    const adminEntry = {
      id: user.id || `user-${cleanUsername}`,
      email: user.email,
      artist_name: user.artist_name,
      username: cleanUsername,
      full_name: user.full_name,
      account_type: user.account_type || 'musician',
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
      pwa_enabled: user.pwa_enabled ?? true,
      pwa_name: user.pwa_name || user.artist_name,
      pwa_icon_url: user.pwa_icon_url || null,
      pwa_splash_url: null,
      releases_count: 0,
      total_streams_preview: 0,
      is_flagged_impostor: false,
      moderation_report_count: 0,
      admin_notes: '',
      social_links: finalLinks,
    }

    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...adminEntry }
    } else {
      list.unshift(adminEntry as any)
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
        // Also fetch social links from Supabase
        const { data: links } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', profile.id)
          .order('display_order', { ascending: true })

        // Check local storage for recent client-side edits to avoid wiping data
        let localOverride: any = null
        if (typeof window !== 'undefined') {
          try {
            const dedicatedRaw = localStorage.getItem(`monpodium_profile_${cleanUsername}`)
            if (dedicatedRaw) {
              localOverride = JSON.parse(dedicatedRaw)
            } else {
              const demoRaw = localStorage.getItem(STORAGE_KEY_USER)
              if (demoRaw) {
                const demo = JSON.parse(demoRaw)
                if ((demo.username || '').toLowerCase() === cleanUsername) {
                  localOverride = demo
                }
              }
            }
          } catch {}
        }

        const effectiveLinks =
          links && links.length > 0
            ? links
            : localOverride?.social_links && localOverride.social_links.length > 0
            ? localOverride.social_links
            : getDefaultSocialLinks(cleanUsername, profile.id)

        return {
          id: profile.id,
          email: profile.email,
          full_name: localOverride?.full_name || profile.full_name || '',
          artist_name: localOverride?.artist_name || profile.artist_name || cleanUsername,
          username: profile.username,
          account_type: localOverride?.account_type || profile.account_type || 'musician',
          bio: localOverride?.bio || profile.bio || '',
          genre: localOverride?.genre || profile.genre || 'Afrobeats',
          genres: localOverride?.genres || profile.genres || (profile.genre ? [profile.genre] : ['Afrobeats']),
          country: localOverride?.country || profile.country || "Côte d'Ivoire",
          theme_color: localOverride?.theme_color || profile.theme_color || '#10b981',
          theme_mode: localOverride?.theme_mode || profile.theme_mode || 'dark',
          avatar_url: localOverride?.avatar_url || profile.avatar_url,
          banner_url: localOverride?.banner_url !== undefined ? localOverride.banner_url : profile.banner_url,
          banner_color: localOverride?.banner_color || profile.banner_color,
          booking_email: localOverride?.booking_email || profile.booking_email,
          booking_phone: localOverride?.booking_phone || profile.booking_phone,
          booking_enabled: Boolean(localOverride?.booking_email || profile.booking_email),
          tip_enabled: localOverride?.tip_enabled ?? profile.tip_enabled ?? false,
          tip_provider: localOverride?.tip_provider || profile.tip_provider || 'wave',
          tip_number: localOverride?.tip_number || profile.tip_number || null,
          tip_note: localOverride?.tip_note || profile.tip_note || null,
          plan: profile.plan || 'free',
          verified: profile.is_verified || false,
          account_status: profile.account_status || 'active',
          pwa_enabled: profile.pwa_enabled ?? true,
          pwa_name: localOverride?.pwa_name || profile.pwa_name || profile.artist_name,
          pwa_icon_url: localOverride?.pwa_icon_url || profile.pwa_icon_url,
          social_links: effectiveLinks,
        }
      }
    } catch (err) {
      console.debug('Supabase public profile fetch fallback to local', err)
    }
  }

  // 2. Client-side storage priority check
  if (typeof window !== 'undefined') {
    try {
      // Priority 2A: Dedicated per-profile key (most recent, direct, never overwritten)
      const dedicatedRaw = localStorage.getItem(`monpodium_profile_${cleanUsername}`)
      if (dedicatedRaw) {
        const parsed: UserProfileData = JSON.parse(dedicatedRaw)
        if (!parsed.social_links || parsed.social_links.length === 0) {
          parsed.social_links = getDefaultSocialLinks(cleanUsername, parsed.id)
        }
        return parsed
      }

      // Priority 2B: Active user session if username matches
      const currentDemo = localStorage.getItem(STORAGE_KEY_USER)
      if (currentDemo) {
        const parsed: UserProfileData = JSON.parse(currentDemo)
        if (parsed.username.toLowerCase() === cleanUsername) {
          if (!parsed.social_links || parsed.social_links.length === 0) {
            parsed.social_links = getDefaultSocialLinks(cleanUsername, parsed.id)
          }
          return parsed
        }
      }

      // Priority 2C: Local admin users registry
      const raw = localStorage.getItem(STORAGE_KEY_ADMIN_USERS)
      if (raw) {
        const list: any[] = JSON.parse(raw)
        const match = list.find((u) => u.username.toLowerCase() === cleanUsername)
        if (match) {
          return {
            id: match.id,
            email: match.email,
            full_name: match.full_name || '',
            artist_name: match.artist_name,
            username: match.username,
            account_type: match.account_type || 'musician',
            bio: match.bio || '',
            genre: match.genres?.[0] || 'Afrobeats',
            genres: match.genres || ['Afrobeats'],
            country: match.country || "Côte d'Ivoire",
            theme_color: match.theme_color || '#10b981',
            theme_mode: match.theme_mode || 'dark',
            avatar_url: match.avatar_url,
            banner_url: match.banner_url,
            banner_color: match.banner_color || 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
            booking_email: match.booking_email,
            booking_phone: match.booking_phone,
            booking_enabled: Boolean(match.booking_email),
            plan: match.plan || 'free',
            verified: match.verified || false,
            account_status: match.account_status || 'active',
            pwa_enabled: true,
            pwa_name: match.pwa_name || match.artist_name,
            pwa_icon_url: match.pwa_icon_url,
            social_links: match.social_links && match.social_links.length > 0
              ? match.social_links
              : getDefaultSocialLinks(cleanUsername, match.id),
          }
        }
      }
    } catch (err) {
      console.debug('Failed to load local profile', err)
    }
  }

  // Priority 3: Fallback seed list from INITIAL_ADMIN_USERS
  const fallbackMatch = INITIAL_ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === cleanUsername
  )
  if (fallbackMatch) {
    return {
      id: fallbackMatch.id,
      email: fallbackMatch.email,
      full_name: fallbackMatch.full_name || '',
      artist_name: fallbackMatch.artist_name,
      username: fallbackMatch.username,
      account_type: (fallbackMatch as any).account_type || 'musician',
      bio: fallbackMatch.bio || '',
      genre: fallbackMatch.genres?.[0] || 'Afrobeats',
      genres: fallbackMatch.genres || ['Afrobeats'],
      country: fallbackMatch.country || "Côte d'Ivoire",
      theme_color: fallbackMatch.theme_color || '#10b981',
      theme_mode: fallbackMatch.theme_mode || 'dark',
      avatar_url: fallbackMatch.avatar_url,
      banner_url: fallbackMatch.banner_url,
      banner_color: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
      booking_email: fallbackMatch.booking_email,
      booking_phone: fallbackMatch.booking_phone,
      booking_enabled: Boolean(fallbackMatch.booking_email),
      plan: fallbackMatch.plan || 'free',
      verified: fallbackMatch.verified || false,
      account_status: fallbackMatch.account_status || 'active',
      pwa_enabled: true,
      pwa_name: fallbackMatch.pwa_name || fallbackMatch.artist_name,
      pwa_icon_url: fallbackMatch.pwa_icon_url,
      social_links: (fallbackMatch as any).social_links && (fallbackMatch as any).social_links.length > 0
        ? (fallbackMatch as any).social_links
        : getDefaultSocialLinks(cleanUsername, fallbackMatch.id),
    }
  }

  // Priority 4: Default generated profile
  return {
    id: `usr-${cleanUsername}`,
    email: `${cleanUsername}@monpodium.com`,
    full_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
    artist_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
    username: cleanUsername,
    account_type: 'musician',
    bio: "Retrouvez ici toutes mes sorties officielles, mes clips et mes réseaux sociaux certifiés.",
    genres: ['Afrobeats'],
    country: "Côte d'Ivoire",
    theme_color: '#10b981',
    theme_mode: 'dark',
    plan: 'free',
    verified: false,
    account_status: 'active',
    pwa_enabled: true,
    social_links: getDefaultSocialLinks(cleanUsername, `usr-${cleanUsername}`),
  }
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
