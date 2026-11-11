'use client'

import React from 'react'
import { useAudioPlayer } from '@/context/AudioPlayerContext'
import { Play, Pause, X, Disc3 } from 'lucide-react'
import { SafeImage } from '@/components/common/SafeImage'

export function FloatingPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, stopTrack } = useAudioPlayer()

  if (!currentTrack) return null

  const progressPercent = Math.min((currentTime / (duration || 15)) * 100, 100)
  const themeColor = currentTrack.themeColor || '#10b981'

  const formatTime = (secs: number) => {
    const s = Math.floor(secs)
    return `0:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-md pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
      <div
        className="apple-dock relative overflow-hidden rounded-full p-2 pl-2.5 pr-3 shadow-2xl border flex items-center justify-between gap-3 backdrop-blur-2xl"
        style={{
          boxShadow: `0 12px 36px rgba(0,0,0,0.6), 0 0 20px ${themeColor}30`,
        }}
      >
        {/* Cover / Vinyl */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20 bg-zinc-900 shadow-md">
          {currentTrack.coverUrl ? (
            <SafeImage
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              fallbackType="cover"
              fallbackText={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-white ${
                isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''
              }`}
              style={{ backgroundColor: themeColor }}
            >
              <Disc3 className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Track Info & Visualizer */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white truncate max-w-[140px] sm:max-w-[180px]">
              {currentTrack.title}
            </span>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
            <span className="truncate">{currentTrack.artistName}</span>
            <span>•</span>
            <span className="font-mono text-zinc-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg apple-spring active:scale-90 cursor-pointer"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 2px 10px ${themeColor}60`,
            }}
            title={isPlaying ? 'Pause' : 'Reprendre la lecture'}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Close / Dismiss */}
          <button
            onClick={stopTrack}
            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors apple-spring active:scale-90 cursor-pointer"
            title="Fermer le lecteur"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom subtle progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10 overflow-hidden">
          <div
            className="h-full transition-all duration-150"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: themeColor,
            }}
          />
        </div>
      </div>
    </div>
  )
}
