'use client'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/authSync'
import {
  buildArtistIconUrl,
  buildManifestHref,
  computePwaIconVersion,
  getEffectivePwaIconSource,
  getPwaCookieName,
  sanitizePublicHttpImageUrl,
} from '@/lib/pwa'

export interface ClientPwaProfileInput {
  username: string
  artist_name?: string | null
  pwa_name?: string | null
  pwa_icon_url?: string | null
  avatar_url?: string | null
  theme_color?: string | null
  bio?: string | null
}

interface SyncedMeta {
  version: string
  src: string | null
  thumb: string | null
}

const syncedMetaCache = new Map<string, SyncedMeta>()
const thumbCache = new Map<string, string | null>()

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

export async function uploadImageToSupabaseIfConfigured(
  imageSrc: string,
  kind: 'avatar' | 'pwa-icon'
): Promise<string> {
  if (!imageSrc || !imageSrc.startsWith('data:image/') || !isSupabaseConfigured()) {
    return imageSrc
  }

  try {
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return imageSrc

    const match = imageSrc.match(/^data:(image\/[a-z0-9+.-]+);base64,(.+)$/i)
    if (!match) return imageSrc

    const mime = match[1].toLowerCase()
    const ext = mime.includes('png') ? 'png' : 'jpg'
    const byteChars = atob(match[2])
    const byteNumbers = new Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i)
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime })
    const filePath = `${userId}/${kind}.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        upsert: true,
        contentType: mime,
        cacheControl: '31536000',
      })

    if (error) return imageSrc

    const { data: pubData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    if (pubData?.publicUrl) {
      return `${pubData.publicUrl}?v=${Date.now().toString(36)}`
    }
  } catch {
    // Graceful fallback to compressed data URI when storage upload is unavailable
  }

  return imageSrc
}

async function normalizeUnsupportedDataUri(src: string | null): Promise<string | null> {
  if (!src) return null
  if (!src.startsWith('data:image/')) return src
  if (/^data:image\/(png|jpeg|jpg);base64,/i.test(src)) return src

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

async function createCompactPwaThumb(src: string | null): Promise<string | null> {
  if (!src || !src.startsWith('data:image/')) return null
  if (thumbCache.has(src)) return thumbCache.get(src) || null

  const result = await new Promise<string | null>((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const attempts: Array<[number, number]> = [
          [112, 0.65],
          [96, 0.58],
          [80, 0.5],
          [64, 0.45],
        ]
        for (const [size, quality] of attempts) {
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) continue
          const side = Math.min(img.width || size, img.height || size)
          const sx = ((img.width || size) - side) / 2
          const sy = ((img.height || size) - side) / 2
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          const b64 = dataUrl.split(',')[1] || ''
          const urlSafe = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
          if (urlSafe && urlSafe.length <= 2200) {
            resolve(urlSafe)
            return
          }
        }
        resolve(null)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })

  if (thumbCache.size > 20) thumbCache.clear()
  thumbCache.set(src, result)
  return result
}

function writeCompactPwaCookie(
  cleanUsername: string,
  payload: {
    v: string
    n?: string | null
    c?: string | null
    s?: string | null
    f?: string | null
  }
) {
  if (typeof document === 'undefined') return
  try {
    const cookieName = getPwaCookieName(cleanUsername)
    const jsonObj: Record<string, string> = { v: payload.v }
    if (payload.n) jsonObj.n = payload.n.trim().slice(0, 60)
    if (payload.c && /^#[0-9a-fA-F]{3,8}$/.test(payload.c)) jsonObj.c = payload.c
    if (payload.s) jsonObj.s = payload.s
    else if (payload.f) jsonObj.f = payload.f

    let encoded = encodeURIComponent(JSON.stringify(jsonObj))
    if (encoded.length > 3600 && jsonObj.f) {
      delete jsonObj.f
      encoded = encodeURIComponent(JSON.stringify(jsonObj))
    }
    if (encoded.length <= 3800) {
      document.cookie = `${cookieName}=${encoded}; Path=/; Max-Age=2592000; SameSite=Lax`
    }
  } catch {
    // Ignore cookie quota errors
  }
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

  const cached = syncedMetaCache.get(cleanUsername)
  if (!options?.force && cached && cached.version === localVersion) {
    return localVersion
  }

  const safeHttpSrc = sanitizePublicHttpImageUrl(effectiveIcon)
  const thumb = !safeHttpSrc ? await createCompactPwaThumb(effectiveIcon) : null
  const displayName = (profile.pwa_name || profile.artist_name || cleanUsername).trim()

  writeCompactPwaCookie(cleanUsername, {
    v: localVersion,
    n: displayName,
    c: profile.theme_color || null,
    s: safeHttpSrc,
    f: thumb,
  })

  syncedMetaCache.set(cleanUsername, {
    version: localVersion,
    src: safeHttpSrc,
    thumb,
  })

  try {
    const res = await fetch(`/api/manifest/${encodeURIComponent(cleanUsername)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_name: profile.artist_name || null,
        pwa_name: profile.pwa_name || profile.artist_name || null,
        pwa_icon_url: normalizedPwaIcon,
        avatar_url: normalizedAvatar,
        pwa_thumb: thumb,
        pwa_version: localVersion,
        theme_color: profile.theme_color || null,
        bio: profile.bio || null,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      const finalVersion = (data?.version as string) || localVersion
      syncedMetaCache.set(cleanUsername, {
        version: finalVersion,
        src: safeHttpSrc,
        thumb,
      })
      return finalVersion
    }
  } catch {
    // Non-fatal offline fallback
  }

  return localVersion
}

function upsertHeadLink(
  selector: string,
  attrs: Record<string, string>,
  replaceOnHrefChange = false
): HTMLLinkElement {
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (el) {
    const allMatch = Object.entries(attrs).every(([k, v]) => el!.getAttribute(k) === v)
    if (allMatch) return el
    if (replaceOnHrefChange && attrs.href && el.getAttribute('href') !== attrs.href) {
      el.remove()
      el = null
    }
  }
  if (!el) {
    el = document.createElement('link')
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v)
    }
    document.head.appendChild(el)
    return el
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (el.getAttribute(k) !== v) {
      el.setAttribute(k, v)
    }
  }
  return el
}

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    el.content = content
    document.head.appendChild(el)
    return
  }
  if (el.content !== content) {
    el.content = content
  }
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    return
  }

  const appName = (profile.pwa_name || profile.artist_name || cleanUsername).trim()
  const effectiveIcon = getEffectivePwaIconSource(profile)
  let version = computePwaIconVersion(
    profile.artist_name,
    profile.pwa_name,
    effectiveIcon,
    profile.theme_color
  )

  let meta = syncedMetaCache.get(cleanUsername)
  if (hasLocal) {
    version = await syncPwaProfileToServer(profile)
    meta = syncedMetaCache.get(cleanUsername)
  }

  const safeSrc = meta?.src ?? sanitizePublicHttpImageUrl(effectiveIcon)
  const thumb = meta?.thumb ?? (!safeSrc ? await createCompactPwaThumb(effectiveIcon) : null)

  // Fast exit if SSR manifest link already matches the current artist & version
  const existingManifest = document.head.querySelector('link[rel="manifest"]')?.getAttribute('href') || ''
  const targetManifest = hasLocal
    ? buildManifestHref(cleanUsername, version, {
        artist_name: profile.artist_name,
        pwa_name: appName,
        theme_color: profile.theme_color,
        src: safeSrc,
        fb: thumb,
      })
    : `/api/manifest/${cleanUsername}?v=${version}`

  const icon192 = buildArtistIconUrl(cleanUsername, 192, version, { src: safeSrc, fb: thumb })
  const icon512 = buildArtistIconUrl(cleanUsername, 512, version, { src: safeSrc, fb: thumb })
  const icon180 = buildArtistIconUrl(cleanUsername, 180, version, { src: safeSrc, fb: thumb })

  // Remove stale generic /icons/icon-*.png links if any exist
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

  if (existingManifest !== targetManifest) {
    // Only replace manifest if SSR did not already match v=${version} for same-origin resolved profiles
    const ssrAlreadyMatchesVersion =
      !hasLocal &&
      existingManifest.startsWith(`/api/manifest/${cleanUsername}`) &&
      existingManifest.includes(`v=${version}`)

    if (!ssrAlreadyMatchesVersion) {
      upsertHeadLink(
        'link[rel="manifest"]',
        {
          rel: 'manifest',
          href: targetManifest,
        },
        true
      )
    }
  }

  upsertMeta('apple-mobile-web-app-capable', 'yes')
  upsertMeta('apple-mobile-web-app-title', appName)
  if (profile.theme_color) {
    upsertMeta('theme-color', profile.theme_color)
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
}
