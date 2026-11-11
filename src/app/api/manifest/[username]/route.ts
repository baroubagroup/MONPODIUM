import { NextRequest, NextResponse } from 'next/server'
import { generateManifest, computePwaIconVersion, getEffectivePwaIconSource } from '@/lib/pwa'
import { resolveServerArtistPwaProfile, saveSyncedPwaProfile } from '@/lib/pwaServerStore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()
  const artist = await resolveServerArtistPwaProfile(cleanUsername)
  const manifest = generateManifest(artist)

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
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
      theme_color: body?.theme_color,
      bio: body?.bio,
    })

    const resolved = await resolveServerArtistPwaProfile(cleanUsername)
    const version = computePwaIconVersion(
      resolved.artist_name,
      resolved.pwa_name,
      getEffectivePwaIconSource(resolved),
      resolved.theme_color
    )

    return NextResponse.json({
      ok: true,
      version,
      manifestUrl: `/api/manifest/${cleanUsername}?v=${version}`,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid PWA sync payload' }, { status: 400 })
  }
}
