'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { recordAudioPreview } from '@/lib/tracker'
import { useAudioPlayer } from '@/context/AudioPlayerContext'

interface AudioPreviewProps {
  src: string | null
  title?: string
  artistName?: string
  artistUsername?: string
  trackSlug?: string
  themeColor?: string
  maxSeconds?: number
}

export function AudioPreview({
  src,
  title,
  artistName,
  artistUsername,
  trackSlug,
  themeColor = '#10b981',
  maxSeconds = 15,
}: AudioPreviewProps) {
  const { currentTrack, isPlaying: isGlobalPlaying, currentTime: globalTime, playTrack, togglePlay: toggleGlobalPlay } = useAudioPlayer()

  const fallbackAudio = src || 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg'
  const isThisTrack = currentTrack?.title === (title || 'Extrait officiel')
  const isPlaying = isThisTrack && isGlobalPlaying
  const currentTime = isThisTrack ? globalTime : 0

  const togglePlay = () => {
    if (isThisTrack) {
      toggleGlobalPlay()
    } else {
      playTrack({
        title: title || 'Extrait officiel',
        artistName: artistName || 'Artiste',
        artistUsername,
        trackSlug,
        audioUrl: fallbackAudio,
        themeColor,
        maxSeconds,
      })
      if (artistUsername) {
        recordAudioPreview({ artistUsername, trackSlug })
      }
    }
  }

  const restartAudio = () => {
    playTrack({
      title: title || 'Extrait officiel',
      artistName: artistName || 'Artiste',
      artistUsername,
      trackSlug,
      audioUrl: fallbackAudio,
      themeColor,
      maxSeconds,
    })
  }

  const progressPercent = Math.min((currentTime / maxSeconds) * 100, 100)

  return (
    <div className="w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 apple-spring cursor-pointer"
          style={{ backgroundColor: themeColor }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </button>

        {/* Info & Soundwave Track */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-zinc-300 truncate">
              {title ? `Extrait : ${title}` : 'Extrait officiel (15s)'}
            </span>
            <span className="font-mono text-zinc-400">
              0:{Math.floor(currentTime).toString().padStart(2, '0')} / 0:{maxSeconds.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Progress bar with animated equalizer bars */}
          <div className="relative w-full h-8 bg-zinc-800/80 rounded-lg overflow-hidden flex items-center px-2 cursor-pointer" onClick={togglePlay}>
            {/* Filled background progress */}
            <div
              className="absolute left-0 top-0 bottom-0 opacity-30 transition-all duration-100"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: themeColor,
              }}
            />

            {/* Equalizer visuals */}
            <div className="relative z-10 w-full flex items-center justify-between gap-1 h-full py-1">
              {[...Array(24)].map((_, i) => {
                const isPassed = (i / 24) * 100 <= progressPercent
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlaying
                        ? `bar-anim bar-anim-${(i % 6) + 1}`
                        : 'h-2'
                    }`}
                    style={{
                      backgroundColor: isPassed ? themeColor : '#52525b',
                      height: isPlaying ? undefined : `${4 + (Math.sin(i) + 1) * 6}px`,
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Actions (Restart) */}
        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={restartAudio}
            className="p-2 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors apple-spring active:scale-90 cursor-pointer"
            title="Recommencer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
