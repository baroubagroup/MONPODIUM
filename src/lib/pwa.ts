import { User } from '@/types'

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

export function generateManifest(user: User) {
  const appName = (user.pwa_name || user.artist_name || 'MonPodium').trim()
  const cleanUsername = (user.username || 'profil').toLowerCase().trim()
  const customIcon = getEffectivePwaIconSource(user)
  const version = computePwaIconVersion(
    user.artist_name,
    user.pwa_name,
    customIcon,
    user.theme_color
  )

  // Always point to same-origin exact-size PNG routes rendered by /api/icon/[username].
  // Separating "any" and "maskable" satisfies Chrome/Android WebAPK and Desktop PWA rules
  // without ever letting generic fallback icons override the artist's predefined photo.
  const icons: Array<{ src: string; sizes: string; type: string; purpose: string }> = [
    {
      src: `/api/icon/${cleanUsername}?size=192&v=${version}`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `/api/icon/${cleanUsername}?size=192&v=${version}`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: `/api/icon/${cleanUsername}?size=512&v=${version}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: `/api/icon/${cleanUsername}?size=512&v=${version}`,
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
