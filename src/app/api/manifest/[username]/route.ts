import { NextRequest, NextResponse } from 'next/server'
import {
  CompactPwaOverrides,
  buildManifestHref,
  generateManifest,
  getPwaCookieName,
  parseCompactPwaCookie,
  sanitizeCompactThumbParam,
  sanitizePublicHttpImageUrl,
} from '@/lib/pwa'
import { resolveServerArtistPwaBundle, saveSyncedPwaProfile, isSupabaseServerConfigured } from '@/lib/pwaServerStore'
import { createClient } from '@/lib/supabase/server'

function extractQueryOverrides(request: NextRequest): CompactPwaOverrides | null {
  const sp = request.nextUrl.searchParams
  const v = sp.get('v')?.trim() || null
  const name = sp.get('name')?.trim() || null
  const color = sp.get('color')?.trim() || null
  const src = sanitizePublicHttpImageUrl(sp.get('src'))
  const fb = sanitizeCompactThumbParam(sp.get('fb'))

  if (!v && !name && !color && !src && !fb) return null
  return {
    v: v && /^[a-z0-9]{1,16}$/i.test(v) ? v : null,
    artist_name: name ? name.slice(0, 120) : null,
    pwa_name: name ? name.slice(0, 120) : null,
    theme_color: color && /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : null,
    src,
    fb,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()

  const cookieOverrides = parseCompactPwaCookie(
    request.cookies.get(getPwaCookieName(cleanUsername))?.value
  )
  const queryOverrides = extractQueryOverrides(request)
  const mergedOverrides: CompactPwaOverrides | null =
    cookieOverrides || queryOverrides
      ? {
          v: queryOverrides?.v || cookieOverrides?.v || null,
          artist_name: queryOverrides?.artist_name || cookieOverrides?.artist_name || null,
          pwa_name: queryOverrides?.pwa_name || cookieOverrides?.pwa_name || null,
          theme_color: queryOverrides?.theme_color || cookieOverrides?.theme_color || null,
          src: queryOverrides?.src || cookieOverrides?.src || null,
          fb: queryOverrides?.fb || cookieOverrides?.fb || null,
        }
      : null

  const bundle = await resolveServerArtistPwaBundle(cleanUsername, mergedOverrides)
  const manifest = generateManifest(bundle.profile, {
    version: bundle.version,
    iconSrc: bundle.iconSrc,
    iconFallbackThumb: bundle.iconFallbackThumb,
  })

  const hasVersion = Boolean(request.nextUrl.searchParams.get('v'))

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': hasVersion
        ? 'public, max-age=300, stale-while-revalidate=3600'
        : 'no-store, no-cache, must-revalidate',
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const cleanUsername = (username || '').toLowerCase().trim()
    if (!cleanUsername) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const body = await request.json()
    saveSyncedPwaProfile(cleanUsername, {
      artist_name: body?.artist_name,
      pwa_name: body?.pwa_name,
      pwa_icon_url: body?.pwa_icon_url,
      avatar_url: body?.avatar_url,
      pwa_thumb: body?.pwa_thumb,
      pwa_version: body?.pwa_version,
      theme_color: body?.theme_color,
      bio: body?.bio,
    })

    // Persist pwa_thumb and any https:// icon URL back to Supabase DB so manifest
    // GET requests on cold lambdas (no RAM/disk store) can resolve the icon correctly.
    if (isSupabaseServerConfigured()) {
      try {
        const supabase = await createClient()
        const { data: matchedUser } = await supabase
          .from('profiles')
          .select('id, pwa_icon_url, avatar_url')
          .ilike('username', cleanUsername)
          .limit(1)
          .maybeSingle()
        if (matchedUser?.id) {
          const updatePayload: Record<string, string | null> = {}
          const cleanIcon = sanitizePublicHttpImageUrl(body?.pwa_icon_url)
          const cleanAvatar = sanitizePublicHttpImageUrl(body?.avatar_url)
          const cleanThumb = sanitizeCompactThumbParam(body?.pwa_thumb)
          // Only overwrite with https:// URLs — don't store data URIs in DB
          if (cleanIcon && cleanIcon !== matchedUser.pwa_icon_url) {
            updatePayload.pwa_icon_url = cleanIcon
          }
          if (cleanAvatar && cleanAvatar !== matchedUser.avatar_url) {
            updatePayload.avatar_url = cleanAvatar
          }
          if (cleanThumb) {
            updatePayload.pwa_thumb = cleanThumb
          }
          if (Object.keys(updatePayload).length > 0) {
            await supabase.from('profiles').update(updatePayload).eq('id', matchedUser.id)
          }
        }
      } catch {
        // Non-fatal: Supabase write failure should not break manifest sync
      }
    }

    const bundle = await resolveServerArtistPwaBundle(cleanUsername)
    const manifestUrl = buildManifestHref(
      cleanUsername,
      bundle.version,
      bundle.hasStatelessOverrides
        ? {
            artist_name: bundle.profile.artist_name,
            pwa_name: bundle.profile.pwa_name,
            theme_color: bundle.profile.theme_color,
            src: bundle.iconSrc,
            fb: bundle.iconFallbackThumb,
          }
        : null
    )

    return NextResponse.json({
      ok: true,
      version: bundle.version,
      manifestUrl,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid PWA sync payload' }, { status: 400 })
  }
}
