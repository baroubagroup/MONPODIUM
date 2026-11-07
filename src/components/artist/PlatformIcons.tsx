import React from 'react'
import { Platform } from '@/types'

interface IconProps {
  className?: string
  size?: number
}

export function PlatformIcon({ platform, className = 'w-5 h-5', size = 20 }: { platform: Platform } & IconProps) {
  switch (platform) {
    case 'spotify':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      )
    case 'youtube':
    case 'youtube_music':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'apple_music':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.64-.78 1.08-1.86.96-2.95-1 .04-2.14.65-2.81 1.43-.59.68-1.11 1.76-.97 2.82 1.11.09 2.19-.55 2.82-1.3" />
        </svg>
      )
    case 'deezer':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.06 9.48v2.34H3.72V9.48h2.34zm0 3.52v2.34H3.72V13h2.34zm0 3.52v2.34H3.72v-2.34h2.34zM10.2 6v2.34H7.86V6h2.34zm0 3.48v2.34H7.86V9.48h2.34zm0 3.52v2.34H7.86V13h2.34zm0 3.52v2.34H7.86v-2.34h2.34zM14.34 6v2.34H12V6h2.34zm0 3.48v2.34H12V9.48h2.34zm0 3.52v2.34H12V13h2.34zm0 3.52v2.34H12v-2.34h2.34zm4.14-7v2.34h-2.34V9.48h2.34zm0 3.52v2.34h-2.34V13h2.34zm0 3.52v2.34h-2.34v-2.34h2.34zM22.62 13v2.34h-2.34V13h2.34zm0 3.52v2.34h-2.34v-2.34h2.34z" />
        </svg>
      )
    case 'boomplay':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>
      )
    case 'audiomack':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.5 13.5h3v-3h-3v3zm4.5 2.25h3v-7.5H6v7.5zm4.5 2.25h3v-12h-3v12zm4.5-2.25h3v-7.5h-3v7.5zm4.5-2.25h3v-3h-3v3z" />
        </svg>
      )
    case 'tidal':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.001 8l4 4-4 4-4-4 4-4zm8 0l4 4-4 4-4-4 4-4zm8 0l4 4-4 4-4-4 4-4zm-8-8l4 4-4 4-4-4 4-4z" />
        </svg>
      )
    case 'amazon_music':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.88 15.65c-2.42 1.78-5.94 2.73-8.95 2.73-4.22 0-8.03-1.54-10.9-4.13-.23-.2-.02-.48.24-.33 3.1 1.79 6.88 2.87 10.74 2.87 2.67 0 5.62-.64 8.3-1.95.4-.2.72.31.57.81zM14.6 14.4c-.31-.4-.61-1.07-.61-1.63 0-.82.61-1.43 1.43-1.43.82 0 1.43.61 1.43 1.43 0 .56-.3 1.23-.61 1.63l1.83 2.45h-1.63l-1.02-1.43-1.02 1.43h-1.63l1.83-2.45z" />
        </svg>
      )
    case 'soundcloud':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.175 12.225c-.075 0-.15.075-.15.15v2.85c0 .075.075.15.15.15s.15-.075.15-.15v-2.85c0-.075-.075-.15-.15-.15zm1.5-.9c-.1 0-.175.075-.175.175v4.5c0 .1.075.175.175.175s.175-.075.175-.175v-4.5c0-.1-.075-.175-.175-.175zm1.5-.75c-.1 0-.175.075-.175.175v6c0 .1.075.175.175.175s.175-.075.175-.175v-6c0-.1-.075-.175-.175-.175zm1.5-.45c-.1 0-.175.075-.175.175v6.9c0 .1.075.175.175.175s.175-.075.175-.175v-6.9c0-.1-.075-.175-.175-.175zm13.125-1.8c-.375 0-.725.075-1.05.2-.275-1.575-1.65-2.775-3.325-2.775-.6 0-1.15.15-1.65.425-.325.175-.6.425-.8.725-.1-.05-.225-.075-.35-.075-.425 0-.75.325-.75.75v7.2c0 .425.325.75.75.75h7.175c1.9 0 3.425-1.525 3.425-3.425s-1.525-3.425-3.425-3.425z" />
        </svg>
      )
    default:
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      )
  }
}
