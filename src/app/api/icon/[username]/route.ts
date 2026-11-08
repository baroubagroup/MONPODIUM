import { NextRequest, NextResponse } from 'next/server'
import { INITIAL_ADMIN_USERS } from '@/lib/adminData'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const cleanUsername = (username || 'monpodium').toLowerCase().trim()

  let artistName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)
  let themeColor = '#9333ea'
  let appIconUrl: string | null = null

  // 1. Check in-memory admin/demo registry
  const matchedUser = INITIAL_ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === cleanUsername
  )
  if (matchedUser) {
    artistName = matchedUser.artist_name || artistName
    themeColor = matchedUser.theme_color || '#9333ea'
    appIconUrl = matchedUser.pwa_icon_url || matchedUser.avatar_url || null
  }

  // 2. Try Supabase if available
  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('artist_name, theme_color, pwa_icon_url, avatar_url')
      .eq('username', cleanUsername)
      .single()

    if (profile) {
      if (profile.artist_name) artistName = profile.artist_name
      if (profile.theme_color) themeColor = profile.theme_color
      if (profile.pwa_icon_url || profile.avatar_url) {
        appIconUrl = profile.pwa_icon_url || profile.avatar_url
      }
    }
  } catch {}

  // Special brand fallback for monpodium
  if (cleanUsername === 'monpodium') {
    artistName = 'MonPodium'
    themeColor = '#9333ea'
  }

  // If the user has a custom base64 image data URL
  if (appIconUrl && appIconUrl.startsWith('data:image/')) {
    try {
      const matches = appIconUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        const mimeType = matches[1]
        const buffer = Buffer.from(matches[2], 'base64')
        return new Response(buffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        })
      }
    } catch {}
  }

  // If the user has an external image URL (e.g. Supabase Storage, CDN, Unsplash)
  if (appIconUrl && appIconUrl.startsWith('http') && !appIconUrl.includes('placeholder')) {
    try {
      const imgRes = await fetch(appIconUrl, { next: { revalidate: 86400 } })
      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
        const arrayBuffer = await imgRes.arrayBuffer()
        return new Response(arrayBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          },
        })
      }
    } catch {}
  }

  // Dynamic Ultra-HD SVG App Icon (Custom initial, vinyl groove, theme color gradient)
  const initial = artistName.trim().charAt(0).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" />
      <stop offset="60%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- iOS / Android Squircle Base -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />

  <!-- Outer Vinyl Rim -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4" />
  <circle cx="256" cy="256" r="185" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />
  <circle cx="256" cy="256" r="160" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="3" />

  <!-- Center Vinyl Disc Hub -->
  <circle cx="256" cy="256" r="120" fill="#09090b" filter="url(#shadow)" stroke="${themeColor}" stroke-width="6" />

  <!-- Artist Initial Typography -->
  <text x="256" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="115" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-2">
    ${initial}
  </text>

  <!-- Official Music Pod Sparkle Badge -->
  <circle cx="340" cy="170" r="28" fill="${themeColor}" stroke="#ffffff" stroke-width="4" filter="url(#shadow)" />
  <path d="M334 163v14c-1.2-.7-2.6-1-4-1-4.4 0-8 2.7-8 6s3.6 6 8 6 8-2.7 8-6v-13h10v-6h-14z" fill="#ffffff" />
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
