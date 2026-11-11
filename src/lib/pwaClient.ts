'use client'

import { computePwaIconVersion, getEffectivePwaIconSource } from '@/lib/pwa'

export interface ClientPwaProfileInput {
  username: string
  artist_name?: string | null
  pwa_name?: string | null
  pwa_icon_url?: string | null
  avatar_url?: string | null
  theme_color?: string | null
  bio?: string | null
}

const syncedVersions = new Map<string, string>()

export function hasLocalStoredArtistProfile(username: string): boolean {
  if (typeof window === 'undefined') return false
  const clean = (username || '').toLowerCase().trim()
  if (!clean) return false
  try {
    if (localStorage.getItem(`monpodium_profile_${clean}`)) return true
    const demoRaw = localStorage.getItem('monpodium_demo_user')
    if (demoRaw) {
      const demo = JSON.parse(demoRaw)
      if ((demo?.username || '').toLowerCase().trim() === clean) return true
    }
    const adminRaw = localStorage.getItem('monpodium_admin_users')
    if (adminRaw) {
      const list = JSON.parse(adminRaw)
      if (Array.isArray(list) && list.some((u: any) => (u?.username || '').toLowerCase().trim() === clean)) {
        return true
      }
    }
  } catch {}
  return false
}

async function normalizeUnsupportedDataUri(src: string | null): Promise<string | null> {
  if (!src) return null
  if (!src.startsWith('data:image/')) return src
  if (/^data:image\/(png|jpeg|jpg);base64,/i.test(src)) return src

  // Convert webp/gif/svg data URLs client-side to square PNG for server ImageResponse compatibility
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const size = 512
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(src)
          return
        }
        const side = Math.min(img.width || size, img.height || size)
        const sx = ((img.width || size) - side) / 2
        const sy = ((img.height || size) - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(src)
      }
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

export async function syncPwaProfileToServer(
  profile: ClientPwaProfileInput,
  options?: { force?: boolean }
): Promise<string> {
  const cleanUsername = (profile.username || '').toLowerCase().trim()
  const rawPwaIcon = profile.pwa_icon_url || null
  const rawAvatar = profile.avatar_url || null
  const normalizedPwaIcon = await normalizeUnsupportedDataUri(rawPwaIcon)
  const normalizedAvatar = await normalizeUnsupportedDataUri(rawAvatar)

  const effectiveIcon = getEffectivePwaIconSource({
    pwa_icon_url: normalizedPwaIcon,
    avatar_url: normalizedAvatar,
  })
  const localVersion = computePwaIconVersion(
    profile.artist_name,
    profile.pwa_name,
    effectiveIcon,
    profile.theme_color
  )

  if (!options?.force && syncedVersions.get(cleanUsername) === localVersion) {
    return localVersion
  }

  try {
    const res = await fetch(`/api/manifest/${encodeURIComponent(cleanUsername)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_name: profile.artist_name || null,
        pwa_name: profile.pwa_name || profile.artist_name || null,
        pwa_icon_url: normalizedPwaIcon,
        avatar_url: normalizedAvatar,
        theme_color: profile.theme_color || null,
        bio: profile.bio || null,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const finalVersion = (data?.version as string) || localVersion
      syncedVersions.set(cleanUsername, finalVersion)
      return finalVersion
    }
  } catch {
    // Non-fatal offline fallback
  }

  return localVersion
}

function upsertHeadLink(
  selector: string,
  attrs: Record<string, string>
): HTMLLinkElement {
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  return el
}

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

export async function applyArtistPwaHeadLinks(
  profile: ClientPwaProfileInput,
  options?: { isResolvedProfile?: boolean }
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const cleanUsername = (profile.username || '').toLowerCase().trim()
  if (!cleanUsername) return

  const hasLocal = hasLocalStoredArtistProfile(cleanUsername)
  if (!hasLocal && !options?.isResolvedProfile) {
    // Keep server-rendered manifest & icons when client only holds generic fallback state
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    return
  }

  const appName = (profile.pwa_name || profile.artist_name || cleanUsername).trim()
  let version = computePwaIconVersion(
    profile.artist_name,
    profile.pwa_name,
    getEffectivePwaIconSource(profile),
    profile.theme_color
  )

  if (hasLocal) {
    version = await syncPwaProfileToServer(profile)
  }

  const icon192 = `/api/icon/${cleanUsername}?size=192&v=${version}`
  const icon512 = `/api/icon/${cleanUsername}?size=512&v=${version}`
  const icon180 = `/api/icon/${cleanUsername}?size=180&v=${version}`
  const manifestHref = `/api/manifest/${cleanUsername}?v=${version}`

  // Remove any stale generic /icons/icon-*.png links injected before hydration
  document.head
    .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')
    .forEach((node) => {
      const href = node.getAttribute('href') || ''
      if (href.startsWith('/icons/icon-') || href === `/api/icon/${cleanUsername}`) {
        node.remove()
      }
    })

  upsertHeadLink('link[rel="icon"][sizes="192x192"]', {
    rel: 'icon',
    type: 'image/png',
    sizes: '192x192',
    href: icon192,
  })
  upsertHeadLink('link[rel="icon"][sizes="512x512"]', {
    rel: 'icon',
    type: 'image/png',
    sizes: '512x512',
    href: icon512,
  })
  upsertHeadLink('link[rel="apple-touch-icon"]', {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: icon180,
  })
  upsertHeadLink('link[rel="manifest"]', {
    rel: 'manifest',
    href: manifestHref,
  })

  upsertMeta('apple-mobile-web-app-capable', 'yes')
  upsertMeta('apple-mobile-web-app-title', appName)
  if (profile.theme_color) {
    upsertMeta('theme-color', profile.theme_color)
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
}
