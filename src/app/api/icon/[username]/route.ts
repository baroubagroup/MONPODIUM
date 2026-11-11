import React from 'react'
import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'
import { resolveServerArtistPwaProfile } from '@/lib/pwaServerStore'
import {
  decodeThumbToDataUri,
  getEffectivePwaIconSource,
  getPwaCookieName,
  parseCompactPwaCookie,
  sanitizeCompactThumbParam,
  sanitizePublicHttpImageUrl,
} from '@/lib/pwa'

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

function isExactSquarePngBuffer(buf: Buffer, size: number): boolean {
  if (buf.length < 24) return false
  const isPng =
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  if (!isPng) return false
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  return width === size && height === size
}

function sniffRasterMime(buf: Buffer, rawContentType: string): 'image/png' | 'image/jpeg' | 'image/gif' | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buf.length >= 6 && buf.subarray(0, 6).toString('ascii').startsWith('GIF8')) {
    return 'image/gif'
  }
  const ct = rawContentType.split(';')[0].trim().toLowerCase()
  if (ct === 'image/png') return 'image/png'
  if (ct === 'image/jpeg' || ct === 'image/jpg') return 'image/jpeg'
  if (ct === 'image/gif') return 'image/gif'
  return null
}

async function renderRasterSquarePngBytes(
  srcDataUri: string,
  size: number
): Promise<ArrayBuffer> {
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
        width: size,
        height: size,
        alt: '',
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      })
    ),
    { width: size, height: size }
  )
  const out = await imageResponse.arrayBuffer()
  if (out.byteLength < 64) {
    throw new Error('Rendered PNG was unexpectedly empty')
  }
  return out
}

async function renderDataUriCandidate(
  dataUri: string,
  size: number,
  headers: HeadersInit
): Promise<Response | null> {
  const match = dataUri.match(
    /^\s*data:(image\/(?:png|jpeg|jpg|gif));(?:charset=[^;]+;)?base64,([A-Za-z0-9+/=\s]+)\s*$/i
  )
  if (!match) return null

  try {
    const rawMime = match[1].toLowerCase()
    const mime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime
    const cleanB64 = match[2].replace(/\s+/g, '')
    const rawBuf = Buffer.from(cleanB64, 'base64')

    if (mime === 'image/png' && isExactSquarePngBuffer(rawBuf, size)) {
      return new Response(new Uint8Array(rawBuf), { headers })
    }

    const normalizedUri = `data:${mime};base64,${cleanB64}`
    const pngBytes = await renderRasterSquarePngBytes(normalizedUri, size)
    return new Response(pngBytes, { headers })
  } catch {
    return null
  }
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

  const cookieOverrides = parseCompactPwaCookie(
    request.cookies.get(getPwaCookieName(cleanUsername))?.value
  )
  const querySrc = sanitizePublicHttpImageUrl(request.nextUrl.searchParams.get('src'))
  const queryFb = sanitizeCompactThumbParam(request.nextUrl.searchParams.get('fb'))

  const overrides =
    querySrc || queryFb || cookieOverrides
      ? {
          ...cookieOverrides,
          src: querySrc || cookieOverrides?.src || null,
          fb: queryFb || cookieOverrides?.fb || null,
        }
      : null

  const profile = await resolveServerArtistPwaProfile(cleanUsername, overrides)
  const artistName =
    cleanUsername === 'monpodium'
      ? 'MonPodium'
      : profile.pwa_name || profile.artist_name || cleanUsername
  const themeColor =
    cleanUsername === 'monpodium' ? '#9333ea' : profile.theme_color || '#10b981'

  const appIconUrl =
    getEffectivePwaIconSource(profile) ||
    querySrc ||
    decodeThumbToDataUri(queryFb)

  // 1. Custom base64 Data URL (from dashboard upload or server store)
  if (appIconUrl && appIconUrl.startsWith('data:image/')) {
    const rendered = await renderDataUriCandidate(appIconUrl, size, headers)
    if (rendered) return rendered
  }

  // 2. External HTTP(S) image URL (Unsplash, Supabase Storage, CDN)
  const safeRemoteUrl = sanitizePublicHttpImageUrl(appIconUrl)
  if (safeRemoteUrl) {
    try {
      let fetchUrl = safeRemoteUrl
      let isUnsplashPng = false
      try {
        const parsed = new URL(safeRemoteUrl)
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
        // Keep raw sanitized URL
      }

      const imgRes = await fetch(fetchUrl, {
        headers: {
          Accept: 'image/png, image/jpeg, */*;q=0.1',
          'User-Agent': 'MonPodiumPWA/1.0',
        },
        next: { revalidate: 86400 },
      })

      if (imgRes.ok) {
        const rawCt = imgRes.headers.get('content-type') || ''
        const buf = Buffer.from(await imgRes.arrayBuffer())
        const sniffedMime = sniffRasterMime(buf, rawCt)

        if ((isUnsplashPng || isExactSquarePngBuffer(buf, size)) && sniffedMime === 'image/png') {
          return new Response(new Uint8Array(buf), { headers })
        }

        if (sniffedMime) {
          const dataUri = `data:${sniffedMime};base64,${buf.toString('base64')}`
          const rendered = await renderRasterSquarePngBytes(dataUri, size)
          return new Response(rendered, { headers })
        }
      }
    } catch {
      // Fall through to compact fb thumbnail if available
    }
  }

  // 3. Stateless compact photo fallback (?fb=...) across serverless containers / WebAPK
  const fbDataUri = decodeThumbToDataUri(queryFb || overrides?.fb)
  if (fbDataUri && fbDataUri !== appIconUrl) {
    const rendered = await renderDataUriCandidate(fbDataUri, size, headers)
    if (rendered) return rendered
  }

  // 4. Final fallback only when no artist photo exists anywhere
  return renderFallbackBadgePng(artistName, themeColor, size, headers)
}
