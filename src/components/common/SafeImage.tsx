'use client'

import React, { useState, useEffect } from 'react'
import { Music, Disc3, User } from 'lucide-react'

interface SafeImageProps {
  src?: string | null
  alt: string
  className?: string
  fallbackType?: 'avatar' | 'cover' | 'pwa'
  fallbackText?: string
  themeColor?: string
  isLight?: boolean
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackType = 'cover',
  fallbackText,
  themeColor = '#9333ea',
  isLight = false,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false)
  }, [src])

  const initial = (fallbackText || alt || 'M').trim().charAt(0).toUpperCase()
  const isValidSrc = Boolean(src && typeof src === 'string' && src.trim().length > 5 && !src.startsWith('blob:'))

  if (!isValidSrc || hasError) {
    if (fallbackType === 'avatar' || fallbackType === 'pwa') {
      return (
        <div
          className="w-full h-full flex items-center justify-center font-black select-none shadow-inner"
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, #1e1b4b 100%)`,
            color: '#ffffff',
          }}
          title={alt}
        >
          <span className="text-2xl sm:text-3xl font-black drop-shadow-md">
            {initial}
          </span>
        </div>
      )
    }

    // Default: cover artwork fallback
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-3 select-none relative overflow-hidden transition-colors ${
          isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-900 text-zinc-300'
        }`}
        style={{
          background: isLight
            ? `radial-gradient(circle at 50% 40%, ${themeColor}18 0%, #f1f5f9 100%)`
            : `radial-gradient(circle at 50% 40%, ${themeColor}30 0%, #09090b 100%)`,
        }}
        title={alt}
      >
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 shadow-md border"
          style={{
            backgroundColor: `${themeColor}20`,
            borderColor: `${themeColor}40`,
            color: themeColor,
          }}
        >
          <Disc3 className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
        </div>
        <span
          className="text-[11px] font-black uppercase tracking-wider text-center line-clamp-1 px-1"
          style={{ color: isLight ? '#0f172a' : '#f4f4f5' }}
        >
          {fallbackText || alt}
        </span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src!}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  )
}
