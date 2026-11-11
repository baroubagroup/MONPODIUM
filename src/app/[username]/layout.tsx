import type { Metadata } from 'next'
import React from 'react'
import { resolveServerArtistPwaProfile } from '@/lib/pwaServerStore'
import { computePwaIconVersion, getEffectivePwaIconSource } from '@/lib/pwa'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()
  const profile = await resolveServerArtistPwaProfile(cleanUsername)

  const displayName =
    profile.artist_name ||
    cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)
  const pwaTitle = (profile.pwa_name || displayName).trim()
  const iconVersion = computePwaIconVersion(
    profile.artist_name,
    profile.pwa_name,
    getEffectivePwaIconSource(profile),
    profile.theme_color
  )

  return {
    title: `${displayName} • MonPodium Officiel`,
    description: `Découvrez la vitrine officielle, les réseaux vérifiés et l'univers de ${displayName} sur MonPodium.`,
    manifest: `/api/manifest/${cleanUsername}?v=${iconVersion}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: pwaTitle,
    },
    icons: {
      icon: [
        { url: `/api/icon/${cleanUsername}?size=192&v=${iconVersion}`, sizes: '192x192', type: 'image/png' },
        { url: `/api/icon/${cleanUsername}?size=512&v=${iconVersion}`, sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: `/api/icon/${cleanUsername}?size=180&v=${iconVersion}`, sizes: '180x180', type: 'image/png' },
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
