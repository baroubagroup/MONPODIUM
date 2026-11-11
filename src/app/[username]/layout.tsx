import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import React from 'react'
import { resolveServerArtistPwaBundle } from '@/lib/pwaServerStore'
import {
  buildArtistIconUrl,
  buildManifestHref,
  getPwaCookieName,
  parseCompactPwaCookie,
} from '@/lib/pwa'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()

  let cookieOverrides = null
  try {
    const cookieStore = await cookies()
    cookieOverrides = parseCompactPwaCookie(
      cookieStore.get(getPwaCookieName(cleanUsername))?.value
    )
  } catch {
    // Non-fatal fallback without cookie store
  }

  const bundle = await resolveServerArtistPwaBundle(cleanUsername, cookieOverrides)
  const { profile, version, iconSrc, iconFallbackThumb, hasStatelessOverrides } = bundle

  const displayName =
    profile.artist_name ||
    cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)
  const pwaTitle = (profile.pwa_name || displayName).trim()

  const manifestHref = hasStatelessOverrides
    ? buildManifestHref(cleanUsername, version, {
        artist_name: profile.artist_name,
        pwa_name: profile.pwa_name,
        theme_color: profile.theme_color,
        src: iconSrc,
        fb: iconFallbackThumb,
      })
    : `/api/manifest/${cleanUsername}?v=${version}`

  const icon192 = buildArtistIconUrl(cleanUsername, 192, version, {
    src: iconSrc,
    fb: iconFallbackThumb,
  })
  const icon512 = buildArtistIconUrl(cleanUsername, 512, version, {
    src: iconSrc,
    fb: iconFallbackThumb,
  })
  const icon180 = buildArtistIconUrl(cleanUsername, 180, version, {
    src: iconSrc,
    fb: iconFallbackThumb,
  })

  return {
    title: `${displayName} • MonPodium Officiel`,
    description: `Découvrez la vitrine officielle, les réseaux vérifiés et l'univers de ${displayName} sur MonPodium.`,
    manifest: manifestHref,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: pwaTitle,
    },
    icons: {
      icon: [
        { url: icon192, sizes: '192x192', type: 'image/png' },
        { url: icon512, sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: icon180, sizes: '180x180', type: 'image/png' },
      ],
    },
  }
}

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
