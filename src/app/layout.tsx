import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { AudioPlayerProvider } from '@/context/AudioPlayerContext'
import { FloatingPlayer } from '@/components/artist/FloatingPlayer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#10b981',
}

export const metadata: Metadata = {
  title: 'MonPodium — Toute ta musique. Un seul lien.',
  description:
    'MonPodium te donne une page artiste professionnelle avec toutes tes sorties musicales et leurs liens vers toutes les plateformes.',
  keywords: ['artiste', 'musique', 'link in bio', 'spotify', 'youtube', 'boomplay'],
  icons: {
    icon: '/api/icon/monpodium',
    apple: '/api/icon/monpodium',
  },
  openGraph: {
    title: 'MonPodium',
    description: 'Toute ta musique. Un seul lien.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <AudioPlayerProvider>
          {children}
          <FloatingPlayer />
        </AudioPlayerProvider>
        <Toaster richColors position="top-center" closeButton duration={2500} />
      </body>
    </html>
  )
}
