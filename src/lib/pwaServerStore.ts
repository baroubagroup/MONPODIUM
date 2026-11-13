import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { INITIAL_ADMIN_USERS } from '@/lib/adminData'
import {
  CompactPwaOverrides,
  computePwaIconVersion,
  decodeThumbToDataUri,
  getEffectivePwaIconSource,
  sanitizeCompactThumbParam,
  sanitizePublicHttpImageUrl,
} from '@/lib/pwa'
import { User } from '@/types'

export interface SyncedPwaProfile {
  username: string
  artist_name?: string | null
  pwa_name?: string | null
  pwa_icon_url?: string | null
  avatar_url?: string | null
  pwa_thumb?: string | null
  pwa_version?: string | null
  theme_color?: string | null
  bio?: string | null
  updated_at: number
}

export interface ResolvedServerPwaBundle {
  profile: User
  version: string
  iconSrc: string | null
  iconFallbackThumb: string | null
  hasStatelessOverrides: boolean
}

const STORE_FILE = path.join(os.tmpdir(), 'monpodium-pwa-profiles.json')
const MAX_IMAGE_LENGTH = 2_000_000

const globalForPwa = globalThis as typeof globalThis & {
  __monpodiumPwaStore?: Map<string, SyncedPwaProfile>
  __monpodiumPwaStoreLoaded?: boolean
}

function getMemoryStore(): Map<string, SyncedPwaProfile> {
  if (!globalForPwa.__monpodiumPwaStore) {
    globalForPwa.__monpodiumPwaStore = new Map()
  }
  if (!globalForPwa.__monpodiumPwaStoreLoaded) {
    globalForPwa.__monpodiumPwaStoreLoaded = true
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf8')
        const parsed = JSON.parse(raw) as Record<string, SyncedPwaProfile>
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === 'object') {
              globalForPwa.__monpodiumPwaStore.set(k.toLowerCase(), v)
            }
          }
        }
      }
    } catch {
      // Ignore corrupt cache file on disk
    }
  }
  return globalForPwa.__monpodiumPwaStore
}

function persistStoreToDisk(store: Map<string, SyncedPwaProfile>) {
  try {
    const obj: Record<string, SyncedPwaProfile> = {}
    for (const [k, v] of store.entries()) {
      obj[k] = v
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj), 'utf8')
  } catch {
    // Non-fatal in read-only serverless environments
  }
}

function sanitizeImageCandidate(val: unknown): string | null {
  if (typeof val !== 'string') return null
  const trimmed = val.trim()
  if (!trimmed || trimmed.length > MAX_IMAGE_LENGTH || trimmed.includes('placeholder')) {
    return null
  }
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    /^\s*data:image\/(png|jpeg|jpg|webp|gif);(?:charset=[^;]+;)?base64,[A-Za-z0-9+/=\s]+$/i.test(trimmed)
  ) {
    return trimmed
  }
  return null
}

export function isSupabaseServerConfigured(): boolean {
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

export function saveSyncedPwaProfile(
  username: string,
  payload: {
    artist_name?: string | null
    pwa_name?: string | null
    pwa_icon_url?: string | null
    avatar_url?: string | null
    pwa_thumb?: string | null
    pwa_version?: string | null
    theme_color?: string | null
    bio?: string | null
  }
): SyncedPwaProfile {
  const cleanUsername = username.toLowerCase().trim()
  const store = getMemoryStore()
  const existing = store.get(cleanUsername)

  const sanitizedPwaIcon = sanitizeImageCandidate(payload.pwa_icon_url)
  const sanitizedAvatar = sanitizeImageCandidate(payload.avatar_url)
  const sanitizedThumb = sanitizeCompactThumbParam(payload.pwa_thumb)

  const record: SyncedPwaProfile = {
    username: cleanUsername,
    artist_name:
      typeof payload.artist_name === 'string' && payload.artist_name.trim()
        ? payload.artist_name.trim().slice(0, 120)
        : existing?.artist_name ?? null,
    pwa_name:
      typeof payload.pwa_name === 'string' && payload.pwa_name.trim()
        ? payload.pwa_name.trim().slice(0, 120)
        : existing?.pwa_name ?? null,
    pwa_icon_url: sanitizedPwaIcon ?? (payload.pwa_icon_url === null ? null : existing?.pwa_icon_url ?? null),
    avatar_url: sanitizedAvatar ?? (payload.avatar_url === null ? null : existing?.avatar_url ?? null),
    pwa_thumb: sanitizedThumb ?? existing?.pwa_thumb ?? null,
    pwa_version:
      typeof payload.pwa_version === 'string' && /^[a-z0-9]{1,16}$/i.test(payload.pwa_version.trim())
        ? payload.pwa_version.trim()
        : existing?.pwa_version ?? null,
    theme_color:
      typeof payload.theme_color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(payload.theme_color.trim())
        ? payload.theme_color.trim()
        : existing?.theme_color ?? null,
    bio:
      typeof payload.bio === 'string'
        ? payload.bio.slice(0, 500)
        : existing?.bio ?? null,
    updated_at: Date.now(),
  }

  store.set(cleanUsername, record)
  persistStoreToDisk(store)
  return record
}

export function getSyncedPwaProfile(username: string): SyncedPwaProfile | null {
  const cleanUsername = username.toLowerCase().trim()
  const store = getMemoryStore()
  return store.get(cleanUsername) || null
}

/**
 * Resolves artist profile + stateless manifest/icon parameters across:
 * 1) Supabase Postgres (case-insensitive username match)
 * 2) Synced local RAM/tmp store
 * 3) Stateless cookie/query overrides (resilient across Vercel cold lambdas & Google WebAPK)
 * 4) INITIAL_ADMIN_USERS seed profiles
 */
export async function resolveServerArtistPwaBundle(
  username: string,
  overrides?: CompactPwaOverrides | null
): Promise<ResolvedServerPwaBundle> {
  const cleanUsername = (username || 'monpodium').toLowerCase().trim()
  const fallbackDisplay =
    cleanUsername === 'monpodium'
      ? 'MonPodium'
      : cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)

  let supaProfile: any = null
  if (isSupabaseServerConfigured() && cleanUsername !== 'monpodium') {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .limit(1)
        .maybeSingle()
      if (data) supaProfile = data
    } catch {
      // Fall back cleanly
    }
  }

  const synced = getSyncedPwaProfile(cleanUsername)
  const adminMatch = INITIAL_ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === cleanUsername
  )

  const overrideSrc = sanitizePublicHttpImageUrl(overrides?.src)
  const overrideFb = !overrideSrc ? sanitizeCompactThumbParam(overrides?.fb || synced?.pwa_thumb || supaProfile?.pwa_thumb) : null
  const overrideDataUri = decodeThumbToDataUri(overrideFb)
  const overrideName =
    typeof overrides?.pwa_name === 'string' && overrides.pwa_name.trim()
      ? overrides.pwa_name.trim().slice(0, 120)
      : typeof overrides?.artist_name === 'string' && overrides.artist_name.trim()
      ? overrides.artist_name.trim().slice(0, 120)
      : null
  const overrideColor =
    typeof overrides?.theme_color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(overrides.theme_color.trim())
      ? overrides.theme_color.trim()
      : null

  let profile: User

  if (supaProfile) {
    const dbIcon = getEffectivePwaIconSource(supaProfile)
    profile = {
      ...supaProfile,
      username: cleanUsername,
      artist_name: supaProfile.artist_name || synced?.artist_name || overrideName || fallbackDisplay,
      pwa_name: supaProfile.pwa_name || synced?.pwa_name || overrideName || supaProfile.artist_name || fallbackDisplay,
      pwa_icon_url: dbIcon || synced?.pwa_icon_url || overrideSrc || synced?.avatar_url || overrideDataUri || null,
      avatar_url: supaProfile.avatar_url || synced?.avatar_url || overrideSrc || overrideDataUri || null,
      theme_color: supaProfile.theme_color || synced?.theme_color || overrideColor || '#10b981',
      bio: supaProfile.bio || synced?.bio || null,
    } as User
  } else if (synced || adminMatch || overrides) {
    const seed = adminMatch
    const resolvedName =
      synced?.artist_name || overrideName || seed?.artist_name || fallbackDisplay
    const resolvedPwaName =
      synced?.pwa_name || overrideName || seed?.pwa_name || resolvedName
    const resolvedIcon =
      synced?.pwa_icon_url ||
      overrideSrc ||
      synced?.avatar_url ||
      overrideDataUri ||
      seed?.pwa_icon_url ||
      seed?.avatar_url ||
      null

    profile = {
      ...(seed || {
        id: `demo-${cleanUsername}`,
        email: `${cleanUsername}@monpodium.com`,
        full_name: resolvedName,
        username: cleanUsername,
        banner_url: null,
        banner_color: null,
        genres: ['Musique'],
        country: "Côte d'Ivoire",
        booking_email: null,
        booking_phone: null,
        booking_enabled: false,
        plan: 'free' as const,
        plan_expires_at: null,
        pwa_enabled: true,
        pwa_splash_url: null,
        created_at: new Date().toISOString(),
      }),
      username: cleanUsername,
      artist_name: resolvedName,
      pwa_name: resolvedPwaName,
      pwa_icon_url: resolvedIcon,
      avatar_url: synced?.avatar_url || overrideSrc || seed?.avatar_url || overrideDataUri || null,
      theme_color:
        synced?.theme_color ||
        overrideColor ||
        seed?.theme_color ||
        (cleanUsername === 'monpodium' ? '#9333ea' : '#10b981'),
      bio: synced?.bio || seed?.bio || `Page officielle de ${resolvedName}`,
    } as User
  } else {
    profile = {
      id: `demo-${cleanUsername}`,
      email: `${cleanUsername}@monpodium.com`,
      full_name: cleanUsername,
      artist_name: fallbackDisplay,
      username: cleanUsername,
      avatar_url: null,
      banner_url: null,
      banner_color: null,
      bio: `Page officielle de ${fallbackDisplay}`,
      genres: ['Musique'],
      country: "Côte d'Ivoire",
      booking_email: null,
      booking_phone: null,
      booking_enabled: false,
      plan: 'free',
      plan_expires_at: null,
      theme_color: cleanUsername === 'monpodium' ? '#9333ea' : '#10b981',
      pwa_enabled: true,
      pwa_name: fallbackDisplay,
      pwa_icon_url: null,
      pwa_splash_url: null,
      created_at: new Date().toISOString(),
    }
  }

  const effectiveSource = getEffectivePwaIconSource(profile)
  const iconSrc = sanitizePublicHttpImageUrl(overrideSrc || effectiveSource)
  const iconFallbackThumb = !iconSrc ? overrideFb : null
  const computedVersion = computePwaIconVersion(
    profile.artist_name,
    profile.pwa_name,
    effectiveSource,
    profile.theme_color
  )
  const version = synced?.pwa_version || overrides?.v || computedVersion
  const hasStatelessOverrides = Boolean(overrides || (synced && !supaProfile))

  return {
    profile,
    version,
    iconSrc,
    iconFallbackThumb,
    hasStatelessOverrides,
  }
}

export async function resolveServerArtistPwaProfile(
  username: string,
  overrides?: CompactPwaOverrides | null
): Promise<User> {
  const bundle = await resolveServerArtistPwaBundle(username, overrides)
  return bundle.profile
}
