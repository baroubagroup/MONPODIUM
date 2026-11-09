import type { Metadata } from 'next'
import React from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()
  const capitalized = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)

  return {
    title: `${capitalized} • MonPodium Officiel`,
    description: `Découvrez la vitrine officielle, les réseaux vérifiés et l'univers de ${capitalized} sur MonPodium.`,
    manifest: `/api/manifest/${cleanUsername}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: capitalized,
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
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
