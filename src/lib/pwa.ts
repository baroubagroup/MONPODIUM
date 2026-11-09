import { User } from '@/types'

export function generateManifest(user: User) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monpodium.com'
  const startUrl = `${baseUrl}/${user.username}`

  const appName = user.pwa_name || user.artist_name
  const iconEndpoint = `${baseUrl}/api/icon/${user.username}`

  return {
    name: appName,
    short_name: appName,
    description: user.bio
      ? `${user.bio.slice(0, 100)}...`
      : `Application officielle de ${appName}`,
    start_url: startUrl,
    scope: `/${user.username}`,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: user.theme_color || '#10b981',
    background_color: '#09090b',
    icons: [
      {
        src: iconEndpoint,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconEndpoint,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: iconEndpoint,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    categories: ['music', 'entertainment'],
    lang: 'fr',
    dir: 'ltr',
  }
}
