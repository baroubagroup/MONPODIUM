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
}

export function PlatformButton({
  platform,
  url,
  actionLabel,
  artistUsername,
  trackSlug,
}: PlatformButtonProps) {
  const config = PLATFORMS.find(p => p.id === platform) || {
    name: platform,
    color: '#9333ea',
    bgColor: '#9333ea',
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
      className="group relative flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] press-scale"
    >
      <div className="flex items-center gap-3.5">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          <PlatformIcon platform={platform} size={24} />
        </div>
        <div className="text-left">
          <span className="block text-xs uppercase tracking-wider font-semibold text-zinc-400 group-hover:text-zinc-300">
            {displayAction}
          </span>
          <span className="block text-base font-bold text-white tracking-wide">
            {config.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 group-hover:text-white bg-zinc-800/80 group-hover:bg-zinc-700/80 px-3.5 py-1.5 rounded-full transition-colors">
        <span>Ouvrir</span>
        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  )
}
