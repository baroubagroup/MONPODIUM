'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Release, Platform, PLATFORMS } from '@/types'
import { ChevronLeft, ChevronRight, Play, ArrowRight, Disc3 } from 'lucide-react'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { SafeImage } from '@/components/common/SafeImage'

interface ReleasesCarouselProps {
  releases: Release[]
  username: string
  themeColor?: string
  themeMode?: 'dark' | 'light'
}

export function ReleasesCarousel({
  releases,
  username,
  themeColor = '#10b981',
  themeMode = 'dark',
}: ReleasesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const isLight = themeMode === 'light'

  // Update scroll arrow states
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [releases])

  // Gentle auto-scroll when not hovered
  useEffect(() => {
    if (releases.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      // If at end, loop back smoothly to start
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isHovered, releases.length])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -240 : 240
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (!releases || releases.length === 0) return null

  return (
    <div
      className="w-full space-y-3 text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Header with Title and "Toutes les pistes" button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            <Disc3 className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <div>
            <h2 className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
              Sorties Musicales ({releases.length})
            </h2>
          </div>
        </div>

        {/* Right Actions: Link to full library + Carousel arrows */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${username}/discographie`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs group border cursor-pointer press-scale"
            style={{
              backgroundColor: `${themeColor}15`,
              borderColor: `${themeColor}40`,
              color: themeColor,
            }}
          >
            <span>Toutes les pistes</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Sortie précédente"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                canScrollLeft
                  ? isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 shadow-sm border border-slate-200 cursor-pointer'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer'
                  : 'opacity-30 cursor-not-allowed bg-transparent text-zinc-500'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Sortie suivante"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                canScrollRight
                  ? isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 shadow-sm border border-slate-200 cursor-pointer'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer'
                  : 'opacity-30 cursor-not-allowed bg-transparent text-zinc-500'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track (One line, swipeable) */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {releases.map((rel) => (
          <Link
            key={rel.id}
            href={`/${username}/${rel.slug}`}
            className={`group apple-spring flex-shrink-0 w-[190px] sm:w-[210px] snap-start rounded-3xl p-3 border transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer ${
              isLight
                ? 'apple-glass-light hover:bg-white text-slate-900'
                : 'apple-glass hover:bg-zinc-800/80 text-white'
            }`}
          >
            {/* Square Cover with Apple-style rounded corner and specular gloss */}
            <div className={`relative aspect-square w-full rounded-2xl overflow-hidden shadow-md ring-1 ${
              isLight ? 'bg-slate-100 ring-black/5' : 'bg-zinc-950 ring-white/10'
            }`}>
              <SafeImage
                src={rel.cover_url}
                alt={rel.title}
                fallbackType="cover"
                fallbackText={rel.title}
                themeColor={themeColor}
                isLight={isLight}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
              />

              {/* Release Type Badge */}
              <div className="absolute top-2.5 left-2.5">
                <span
                  className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[9px] font-black uppercase tracking-wider border border-white/15 shadow-sm"
                  style={{ color: themeColor }}
                >
                  {rel.release_type}
                </span>
              </div>

              {/* Play Overlay with spring animation */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ backgroundColor: themeColor }}
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="pt-3 space-y-1 text-left">
              <h3 className="text-xs sm:text-sm font-black tracking-tight truncate transition-colors">
                {rel.title}
              </h3>

              {/* Platforms mini dots */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {rel.platform_links?.slice(0, 4).map((l) => {
                    const cfg = PLATFORMS.find((p) => p.id === l.platform)
                    return (
                      <div
                        key={l.platform}
                        title={cfg?.name}
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{
                          backgroundColor: cfg?.bgColor || '#27272a',
                          color: cfg?.textColor || '#fff',
                        }}
                      >
                        <PlatformIcon platform={l.platform} size={9} />
                      </div>
                    )
                  })}
                  {rel.platform_links && rel.platform_links.length > 4 && (
                    <span className={`text-[9px] font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                      +{rel.platform_links.length - 4}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-extrabold flex items-center gap-0.5" style={{ color: themeColor }}>
                  <span>Écouter</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Final Card: "Explorer toute la discographie" */}
        <Link
          href={`/${username}/discographie`}
          className={`group flex-shrink-0 w-[140px] sm:w-[160px] snap-start rounded-2xl p-4 border border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-102 cursor-pointer ${
            isLight
              ? 'bg-slate-50/80 hover:bg-slate-100/90'
              : 'bg-zinc-900/40 hover:bg-zinc-900'
          }`}
          style={{
            borderColor: `${themeColor}60`,
            backgroundColor: `${themeColor}0a`,
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
          >
            <Disc3 className="w-5 h-5 animate-spin-slow" />
          </div>
          <span className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
            Voir toute la discographie
          </span>
          <span className="text-[10px] opacity-90 mt-1 flex items-center gap-1 font-extrabold" style={{ color: themeColor }}>
            <span>Explorer</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  )
}
