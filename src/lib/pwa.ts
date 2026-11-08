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
      : `Toute la musique officielle de ${appName}`,
    start_url: startUrl,
    scope: startUrl,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: user.theme_color || '#7C3AED',
    background_color: '#08080a',
    icons: [
      {
        src: iconEndpoint,
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: iconEndpoint,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    categories: ['music', 'entertainment'],
    lang: 'fr',
    dir: 'ltr',
  }
}
