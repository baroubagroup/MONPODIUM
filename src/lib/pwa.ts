import { User } from '@/types'

export interface ManifestGenerationOptions {
  version?: string | null
  iconSrc?: string | null
  iconFallbackThumb?: string | null
  hasLocalOverrides?: boolean
}

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[?::1\]?$/,
  /\.local$/i,
  /\.internal$/i,
]

export function sanitizePublicHttpImageUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 1500 || trimmed.includes('placeholder')) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    if (PRIVATE_HOST_PATTERNS.some((re) => re.test(parsed.hostname))) return null
    return parsed.toString()
  } catch {
    return null
  }
}

export function sanitizeCompactThumbParam(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 8000) return null
  if (!/^[A-Za-z0-9\-_]+$/.test(trimmed)) return null
  return trimmed
}

export function decodeThumbToDataUri(raw?: string | null): string | null {
  const safe = sanitizeCompactThumbParam(raw)
  if (!safe) return null
  let b64 = safe.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4 !== 0) b64 += '='
  return `data:image/jpeg;base64,${b64}`
}

export function getPwaCookieName(cleanUsername: string): string {
  return `mp_pwa_${cleanUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`
}

export interface CompactPwaOverrides {
  v?: string | null
  artist_name?: string | null
  pwa_name?: string | null
  theme_color?: string | null
  src?: string | null
  fb?: string | null
}

export function parseCompactPwaCookie(rawCookie?: string | null): CompactPwaOverrides | null {
  if (!rawCookie || typeof rawCookie !== 'string') return null
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie)) as {
      v?: unknown
      n?: unknown
      c?: unknown
      s?: unknown
      f?: unknown
    }
    if (!parsed || typeof parsed !== 'object') return null
    const name =
      typeof parsed.n === 'string' && parsed.n.trim() ? parsed.n.trim().slice(0, 80) : null
    const color =
      typeof parsed.c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(parsed.c.trim())
        ? parsed.c.trim()
        : null
    const version =
      typeof parsed.v === 'string' && /^[a-z0-9]{1,16}$/i.test(parsed.v.trim())
        ? parsed.v.trim()
        : null
    return {
      v: version,
      artist_name: name,
      pwa_name: name,
      theme_color: color,
      src: sanitizePublicHttpImageUrl(typeof parsed.s === 'string' ? parsed.s : null),
      fb: sanitizeCompactThumbParam(typeof parsed.f === 'string' ? parsed.f : null),
    }
  } catch {
    return null
  }
}

export function buildManifestHref(
  cleanUsername: string,
  version: string,
  overrides?: CompactPwaOverrides | null
): string {
  const params = new URLSearchParams()
  params.set('v', version)
  if (overrides?.pwa_name || overrides?.artist_name) {
    params.set('name', (overrides.pwa_name || overrides.artist_name || '').slice(0, 80))
  }
  if (overrides?.theme_color && /^#[0-9a-fA-F]{3,8}$/.test(overrides.theme_color)) {
    params.set('color', overrides.theme_color)
  }
  const safeSrc = sanitizePublicHttpImageUrl(overrides?.src)
  const safeFb = !safeSrc ? sanitizeCompactThumbParam(overrides?.fb) : null
  if (safeSrc) {
    params.set('src', safeSrc)
  } else if (safeFb) {
    params.set('fb', safeFb)
  }
  return `/api/manifest/${cleanUsername}?${params.toString()}`
}

/**
 * Deterministic short hash used to cache-bust artist PWA manifests and icons
 * whenever the predefined photo, artist name, or theme color changes.
 */
export function computePwaIconVersion(
  artistName?: string | null,
  pwaName?: string | null,
  iconUrl?: string | null,
  themeColor?: string | null
): string {
  const input = `${artistName || ''}|${pwaName || ''}|${iconUrl || ''}|${themeColor || ''}`
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function getEffectivePwaIconSource(user: {
  pwa_icon_url?: string | null
  avatar_url?: string | null
}): string | null {
  const candidate = user.pwa_icon_url || user.avatar_url || null
  if (!candidate || candidate.includes('placeholder')) return null
  return candidate
}

export function buildArtistIconUrl(
  cleanUsername: string,
  size: number,
  version: string,
  options?: { src?: string | null; fb?: string | null }
): string {
  const params = new URLSearchParams()
  params.set('size', String(size))
  params.set('v', version)

  const safeSrc = sanitizePublicHttpImageUrl(options?.src)
  const safeFb = !safeSrc ? sanitizeCompactThumbParam(options?.fb) : null

  if (safeSrc) {
    params.set('src', safeSrc)
  } else if (safeFb) {
    params.set('fb', safeFb)
  }

  return `/api/icon/${cleanUsername}?${params.toString()}`
}

export function generateManifest(
  user: User,
  options?: ManifestGenerationOptions
) {
  const appName = (user.pwa_name || user.artist_name || 'MonPodium').trim()
  const cleanUsername = (user.username || 'profil').toLowerCase().trim()
  const customIcon = getEffectivePwaIconSource(user)
  const version =
    options?.version ||
    computePwaIconVersion(
      user.artist_name,
      user.pwa_name,
      customIcon,
      user.theme_color
    )

  const safeHttpSrc = sanitizePublicHttpImageUrl(options?.iconSrc ?? customIcon)
  const safeFb = !safeHttpSrc ? sanitizeCompactThumbParam(options?.iconFallbackThumb) : null

  const icon192 = buildArtistIconUrl(cleanUsername, 192, version, {
    src: safeHttpSrc,
    fb: safeFb,
  })
  const icon512 = buildArtistIconUrl(cleanUsername, 512, version, {
    src: safeHttpSrc,
    fb: safeFb,
  })

  // Always point to same-origin exact-size PNG routes rendered by /api/icon/[username].
  // Separating "any" and "maskable" satisfies Chrome/Android WebAPK and Desktop PWA rules
  // without ever letting generic fallback icons override the artist's predefined photo.
  const icons: Array<{ src: string; sizes: string; type: string; purpose: string }> = [
    {
      src: icon192,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: icon192,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: icon512,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: icon512,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ]

  return {
    id: `/${cleanUsername}`,
    name: appName,
    short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
    description: user.bio
      ? `${user.bio.slice(0, 100)}...`
      : `Application officielle de ${appName}`,
    start_url: `/${cleanUsername}?source=pwa`,
    scope: `/${cleanUsername}`,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: user.theme_color || '#10b981',
    background_color: '#09090b',
    icons,
    categories: ['music', 'entertainment'],
    lang: 'fr',
    dir: 'ltr',
  }
}
