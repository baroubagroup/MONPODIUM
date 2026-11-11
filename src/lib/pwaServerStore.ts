import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createClient } from '@/lib/supabase/server'
import { INITIAL_ADMIN_USERS } from '@/lib/adminData'
import { User } from '@/types'

export interface SyncedPwaProfile {
  username: string
  artist_name?: string | null
  pwa_name?: string | null
  pwa_icon_url?: string | null
  avatar_url?: string | null
  theme_color?: string | null
  bio?: string | null
  updated_at: number
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
    /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)
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
    theme_color?: string | null
    bio?: string | null
  }
): SyncedPwaProfile {
  const cleanUsername = username.toLowerCase().trim()
  const store = getMemoryStore()
  const existing = store.get(cleanUsername)

  const sanitizedPwaIcon = sanitizeImageCandidate(payload.pwa_icon_url)
  const sanitizedAvatar = sanitizeImageCandidate(payload.avatar_url)

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
 * Shared server resolver for artist PWA metadata & icon rendering.
 * Combines Supabase (when configured), local synced profiles (demo/offline saves),
 * and INITIAL_ADMIN_USERS seed profiles.
 */
export async function resolveServerArtistPwaProfile(username: string): Promise<User> {
  const cleanUsername = (username || 'monpodium').toLowerCase().trim()
  const fallbackDisplay =
    cleanUsername === 'monpodium'
      ? 'MonPodium'
      : cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)

  let supaProfile: any = null
  if (isSupabaseServerConfigured()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername)
        .single()
      if (data) supaProfile = data
    } catch {
      // Fall back to synced/seed profiles
    }
  }

  const synced = getSyncedPwaProfile(cleanUsername)
  const adminMatch = INITIAL_ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === cleanUsername
  )

  if (supaProfile) {
    return {
      ...supaProfile,
      artist_name: supaProfile.artist_name || synced?.artist_name || fallbackDisplay,
      pwa_name: supaProfile.pwa_name || synced?.pwa_name || supaProfile.artist_name || fallbackDisplay,
      pwa_icon_url: supaProfile.pwa_icon_url || synced?.pwa_icon_url || supaProfile.avatar_url || synced?.avatar_url || null,
      avatar_url: supaProfile.avatar_url || synced?.avatar_url || null,
      theme_color: supaProfile.theme_color || synced?.theme_color || '#10b981',
      bio: supaProfile.bio || synced?.bio || null,
    } as User
  }

  if (synced || adminMatch) {
    const base = adminMatch || {
      id: `demo-${cleanUsername}`,
      email: `${cleanUsername}@monpodium.com`,
      full_name: synced?.artist_name || fallbackDisplay,
      artist_name: synced?.artist_name || fallbackDisplay,
      username: cleanUsername,
      avatar_url: null,
      banner_url: null,
      banner_color: null,
      bio: synced?.bio || `Page officielle de ${synced?.artist_name || fallbackDisplay}`,
      genres: ['Musique'],
      country: "Côte d'Ivoire",
      booking_email: null,
      booking_phone: null,
      booking_enabled: false,
      plan: 'free' as const,
      plan_expires_at: null,
      theme_color: cleanUsername === 'monpodium' ? '#9333ea' : '#10b981',
      pwa_enabled: true,
      pwa_name: synced?.pwa_name || synced?.artist_name || fallbackDisplay,
      pwa_icon_url: null,
      pwa_splash_url: null,
      created_at: new Date().toISOString(),
    }

    return {
      ...base,
      artist_name: synced?.artist_name || base.artist_name,
      pwa_name: synced?.pwa_name || base.pwa_name || synced?.artist_name || base.artist_name,
      pwa_icon_url: synced?.pwa_icon_url || synced?.avatar_url || base.pwa_icon_url || base.avatar_url || null,
      avatar_url: synced?.avatar_url || base.avatar_url || null,
      theme_color: synced?.theme_color || base.theme_color,
      bio: synced?.bio || base.bio,
    }
  }

  return {
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
