'use client'

import React from 'react'
import { Platform, PLATFORMS } from '@/types'
import { PlatformIcon } from './PlatformIcons'
import { ExternalLink } from 'lucide-react'
import { recordStreamClick } from '@/lib/tracker'

interface PlatformButtonProps {
  platform: Platform
  url: string
  actionLabel?: string
  artistUsername?: string
  trackSlug?: string
  themeMode?: 'dark' | 'light'
}

const STREAMING_BRAND_CONFIG: Partial<
  Record<
    Platform,
    {
      name: string
      color: string
      bgColor: string
      btnBg: string
      btnText: string
      btnLabel: string
      btnShadow: string
    }
  >
> = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    bgColor: '#1DB954',
    btnBg: '#1DB954',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(29, 185, 84, 0.45)',
  },
  boomplay: {
    name: 'Boomplay',
    color: '#00D285',
    bgColor: '#00D285',
    btnBg: '#00D285',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(0, 210, 133, 0.45)',
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    bgColor: '#FF0000',
    btnBg: '#FF0000',
    btnText: '#ffffff',
    btnLabel: 'Regarder',
    btnShadow: '0 2px 12px rgba(255, 0, 0, 0.45)',
  },
  youtube_music: {
    name: 'YouTube Music',
    color: '#FF0000',
    bgColor: '#FF0000',
    btnBg: '#FF0000',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(255, 0, 0, 0.45)',
  },
  apple_music: {
    name: 'Apple Music',
    color: '#FA243C',
    bgColor: 'linear-gradient(135deg, #FA243C 0%, #FA2D55 100%)',
    btnBg: 'linear-gradient(135deg, #FA243C 0%, #FA2D55 100%)',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(250, 36, 60, 0.45)',
  },
  deezer: {
    name: 'Deezer',
    color: '#A238FF',
    bgColor: 'linear-gradient(135deg, #A238FF 0%, #7B2FBE 100%)',
    btnBg: 'linear-gradient(135deg, #A238FF 0%, #7B2FBE 100%)',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(162, 56, 255, 0.45)',
  },
  audiomack: {
    name: 'Audiomack',
    color: '#FFA500',
    bgColor: '#FFA500',
    btnBg: '#FFA500',
    btnText: '#000000',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(255, 165, 0, 0.45)',
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',
    bgColor: '#FF5500',
    btnBg: '#FF5500',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(255, 85, 0, 0.45)',
  },
  amazon_music: {
    name: 'Amazon Music',
    color: '#00A8E1',
    bgColor: '#00A8E1',
    btnBg: '#00A8E1',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(0, 168, 225, 0.45)',
  },
  tidal: {
    name: 'Tidal',
    color: '#00FFFF',
    bgColor: '#000000',
    btnBg: '#000000',
    btnText: '#00FFFF',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(0, 255, 255, 0.35)',
  },
  shazam: {
    name: 'Shazam',
    color: '#0088FF',
    bgColor: '#0088FF',
    btnBg: '#0088FF',
    btnText: '#ffffff',
    btnLabel: 'Identifier',
    btnShadow: '0 2px 12px rgba(0, 136, 255, 0.45)',
  },
  anghami: {
    name: 'Anghami',
    color: '#7B2FBE',
    bgColor: '#7B2FBE',
    btnBg: '#7B2FBE',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(123, 47, 190, 0.45)',
  },
  napster: {
    name: 'Napster',
    color: '#009BFF',
    bgColor: '#009BFF',
    btnBg: '#009BFF',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(0, 155, 255, 0.45)',
  },
  pandora: {
    name: 'Pandora',
    color: '#3668FF',
    bgColor: '#3668FF',
    btnBg: '#3668FF',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(54, 104, 255, 0.45)',
  },
  iheartradio: {
    name: 'iHeartRadio',
    color: '#C6002B',
    bgColor: '#C6002B',
    btnBg: '#C6002B',
    btnText: '#ffffff',
    btnLabel: 'Écouter',
    btnShadow: '0 2px 12px rgba(198, 0, 43, 0.45)',
  },
}

export function PlatformButton({
  platform,
  url,
  actionLabel,
  artistUsername,
  trackSlug,
  themeMode = 'dark',
}: PlatformButtonProps) {
  const isLight = themeMode === 'light'
  const brand = STREAMING_BRAND_CONFIG[platform]
  const fallbackConfig = PLATFORMS.find(p => p.id === platform)

  const name = brand?.name || fallbackConfig?.name || platform
  const iconBg = brand?.bgColor || fallbackConfig?.bgColor || '#10b981'
  const btnBg = brand?.btnBg || fallbackConfig?.color || '#10b981'
  const btnText = brand?.btnText || '#ffffff'
  const btnShadow = brand?.btnShadow || '0 2px 10px rgba(16, 185, 129, 0.4)'
  const defaultAction = brand?.btnLabel || (platform === 'youtube' ? 'Regarder' : 'Écouter')
  const displayAction = actionLabel || defaultAction

  const handleClick = () => {
    if (artistUsername) {
      recordStreamClick({
        artistUsername,
        platformId: platform,
        trackSlug,
      })
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group relative apple-spring flex items-center justify-between w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
        isLight
          ? 'apple-glass-light hover:bg-white text-slate-900 border-slate-200/90'
          : 'apple-glass hover:bg-zinc-850/80 text-white border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
          style={{ background: iconBg, color: '#ffffff' }}
        >
          <PlatformIcon platform={platform} size={22} />
        </div>
        <div className="text-left min-w-0">
          <span className={`block text-[10px] uppercase tracking-wider font-extrabold truncate ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}>
            {displayAction}
          </span>
          <span className={`block text-sm sm:text-base font-black tracking-tight truncate ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {name}
          </span>
        </div>
      </div>

      {/* Button colored exactly to the platform's brand */}
      <div
        className="apple-spring flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full transition-all duration-200 group-hover:scale-105 group-hover:brightness-110 active:scale-95 flex-shrink-0 shadow-sm"
        style={{
          background: btnBg,
          color: btnText,
          boxShadow: btnShadow,
        }}
      >
        <span>{displayAction}</span>
        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  )
}
