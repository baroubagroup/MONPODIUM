import { User } from '@/types'

export function generateManifest(user: User) {
  const appName = user.pwa_name || user.artist_name || 'MonPodium'
  const cleanUsername = (user.username || 'profil').toLowerCase().trim()
  const customIcon = user.pwa_icon_url || user.avatar_url

  const icons: Array<{ src: string; sizes: string; type: string; purpose?: string }> = [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ]

  // If user has a real uploaded avatar/icon image (not SVG), prepend it as high priority
  if (customIcon && (customIcon.startsWith('http') || customIcon.startsWith('data:image/png') || customIcon.startsWith('data:image/jpeg'))) {
    icons.unshift(
      {
        src: customIcon,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: customIcon,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      }
    )
  }

  // Include SVG dynamic icon for browsers supporting vector icons
  icons.push({
    src: `/api/icon/${cleanUsername}`,
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any',
  })

  return {
    id: `/${cleanUsername}`,
    name: appName,
    short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
    description: user.bio
      ? `${user.bio.slice(0, 100)}...`
      : `Application officielle de ${appName}`,
    start_url: `/${cleanUsername}?source=pwa`,
    scope: `/${cleanUsername}`,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: user.theme_color || '#10b981',
    background_color: '#09090b',
    icons,
    categories: ['music', 'entertainment'],
    lang: 'fr',
    dir: 'ltr',
  }
}
