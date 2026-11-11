import React from 'react'
import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'
import { resolveServerArtistPwaProfile } from '@/lib/pwaServerStore'
import { getEffectivePwaIconSource } from '@/lib/pwa'

function parseRequestedSize(request: NextRequest): number {
  const raw = request.nextUrl.searchParams.get('size')
  const parsed = raw ? parseInt(raw, 10) : 512
  if (!Number.isFinite(parsed) || parsed < 64) return 192
  if (parsed > 1024) return 512
  return parsed
}

function getCacheHeaders(request: NextRequest, contentType = 'image/png'): HeadersInit {
  const hasVersion = Boolean(request.nextUrl.searchParams.get('v'))
  return {
    'Content-Type': contentType,
    'Cache-Control': hasVersion
      ? 'public, max-age=86400, stale-while-revalidate=604800'
      : 'no-cache, must-revalidate',
  }
}

function renderRasterSquarePng(
  srcDataUri: string,
  size: number,
  headers: HeadersInit
): Response {
  const imageResponse = new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          overflow: 'hidden',
        },
      },
      React.createElement('img', {
        src: srcDataUri,
        alt: '',
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      })
    ),
    { width: size, height: size, headers }
  )
  return imageResponse
}

function renderFallbackBadgePng(
  artistName: string,
  themeColor: string,
  size: number,
  headers: HeadersInit
): Response {
  const initial = (artistName || 'M').trim().charAt(0).toUpperCase() || 'M'
  const ringOuter = Math.round(size * 0.78)
  const ringInner = Math.round(size * 0.56)
  const fontSize = Math.round(size * 0.3)

  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${themeColor} 0%, #18181b 65%, #09090b 100%)`,
          position: 'relative',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            width: ringOuter,
            height: ringOuter,
            borderRadius: '9999px',
            border: `${Math.max(2, Math.round(size * 0.01))}px solid rgba(255,255,255,0.12)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              width: ringInner,
              height: ringInner,
              borderRadius: '9999px',
              backgroundColor: '#09090b',
              border: `${Math.max(3, Math.round(size * 0.015))}px solid ${themeColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize,
              fontWeight: 900,
            },
          },
          initial
        )
      )
    ),
    { width: size, height: size, headers }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const cleanUsername = (username || 'monpodium').toLowerCase().trim()
  const size = parseRequestedSize(request)
  const headers = getCacheHeaders(request, 'image/png')

  const profile = await resolveServerArtistPwaProfile(cleanUsername)
  const artistName =
    cleanUsername === 'monpodium'
      ? 'MonPodium'
      : profile.pwa_name || profile.artist_name || cleanUsername
  const themeColor =
    cleanUsername === 'monpodium' ? '#9333ea' : profile.theme_color || '#10b981'
  const appIconUrl = getEffectivePwaIconSource(profile)

  // 1. Custom base64 Data URL (e.g. uploaded from dashboard)
  if (appIconUrl && appIconUrl.startsWith('data:image/')) {
    const match = appIconUrl.match(/^data:(image\/(?:png|jpeg|jpg));base64,([A-Za-z0-9+/=]+)$/i)
    if (match) {
      try {
        const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase()
        const normalizedUri = `data:${mime};base64,${match[2]}`
        return renderRasterSquarePng(normalizedUri, size, headers)
      } catch {
        // Fall through to fallback
      }
    }
  }

  // 2. External HTTP(S) image URL (e.g. Unsplash, Supabase Storage, CDN)
  if (appIconUrl && appIconUrl.startsWith('http')) {
    try {
      let fetchUrl = appIconUrl
      let isUnsplashPng = false
      try {
        const parsed = new URL(appIconUrl)
        if (parsed.hostname === 'images.unsplash.com') {
          parsed.searchParams.set('w', String(size))
          parsed.searchParams.set('h', String(size))
          parsed.searchParams.set('fit', 'crop')
          parsed.searchParams.set('fm', 'png')
          parsed.searchParams.set('q', '85')
          fetchUrl = parsed.toString()
          isUnsplashPng = true
        }
      } catch {
        // Use raw URL
      }

      const imgRes = await fetch(fetchUrl, {
        headers: { Accept: 'image/png, image/jpeg, */*;q=0.1' },
        next: { revalidate: 86400 },
      })

      if (imgRes.ok) {
        const rawCt = (imgRes.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
        const arrayBuffer = await imgRes.arrayBuffer()

        if (isUnsplashPng && rawCt === 'image/png') {
          return new Response(arrayBuffer, { headers })
        }

        if (rawCt === 'image/png' || rawCt === 'image/jpeg' || rawCt === 'image/jpg') {
          const mime = rawCt === 'image/jpg' ? 'image/jpeg' : rawCt
          const dataUri = `data:${mime};base64,${Buffer.from(arrayBuffer).toString('base64')}`
          return renderRasterSquarePng(dataUri, size, headers)
        }
      }
    } catch {
      // Fall through to initial badge PNG
    }
  }

  // 3. Always return a real square PNG (iOS & Android PWA compatible)
  return renderFallbackBadgePng(artistName, themeColor, size, headers)
}
