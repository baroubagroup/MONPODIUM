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

export function PlatformButton({
  platform,
  url,
  actionLabel,
  artistUsername,
  trackSlug,
  themeMode = 'dark',
}: PlatformButtonProps) {
  const isLight = themeMode === 'light'
  const config = PLATFORMS.find(p => p.id === platform) || {
    name: platform,
    color: '#10b981',
    bgColor: '#10b981',
    textColor: '#ffffff',
  }

  // Format intelligent labels: "Regarder" for YouTube, "Écouter" for audio platforms
  const isVideo = platform === 'youtube'
  const defaultAction = isVideo ? 'Regarder' : 'Écouter'
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
      className={`group relative flex items-center justify-between w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] press-scale ${
        isLight
          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 text-white'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          <PlatformIcon platform={platform} size={22} />
        </div>
        <div className="text-left">
          <span className={`block text-[11px] uppercase tracking-wider font-bold ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}>
            {displayAction}
          </span>
          <span className={`block text-sm sm:text-base font-black tracking-wide ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {config.name}
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex-shrink-0 ${
        isLight
          ? 'bg-slate-100 group-hover:bg-slate-200 text-slate-700'
          : 'bg-zinc-800/80 group-hover:bg-zinc-700 text-zinc-300 group-hover:text-white'
      }`}>
        <span>Ouvrir</span>
        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  )
}
