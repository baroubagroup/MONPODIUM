'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

export interface ActiveTrack {
  id?: string
  title: string
  artistName: string
  artistUsername?: string
  trackSlug?: string
  coverUrl?: string | null
  audioUrl?: string | null
  themeColor?: string
  maxSeconds?: number
}

interface AudioPlayerContextType {
  currentTrack: ActiveTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playTrack: (track: ActiveTrack) => void
  pauseTrack: () => void
  togglePlay: () => void
  stopTrack: () => void
  seekTo: (time: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(15)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const audio = new Audio()
    audioRef.current = audio

    const handleTimeUpdate = () => {
      const maxSec = currentTrack?.maxSeconds || 15
      if (audio.currentTime >= maxSec) {
        audio.pause()
        audio.currentTime = 0
        setIsPlaying(false)
        setCurrentTime(0)
      } else {
        setCurrentTime(audio.currentTime)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrack])

  const playTrack = (track: ActiveTrack) => {
    if (!audioRef.current) return
    const isSameTrack = currentTrack?.audioUrl === track.audioUrl && currentTrack?.title === track.title

    if (isSameTrack && isPlaying) {
      return
    }

    const finalSrc = track.audioUrl || 'https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg'
    setCurrentTrack(track)
    setDuration(track.maxSeconds || 15)

    if (!isSameTrack || audioRef.current.src !== finalSrc) {
      audioRef.current.src = finalSrc
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }

    audioRef.current.play().then(() => {
      setIsPlaying(true)
    }).catch(err => {
      console.warn('Audio play prevented by browser:', err)
      setIsPlaying(false)
    })
  }

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      pauseTrack()
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentTrack(null)
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        togglePlay,
        stopTrack,
        seekTo,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 15,
      playTrack: () => {},
      pauseTrack: () => {},
      togglePlay: () => {},
      stopTrack: () => {},
      seekTo: () => {},
    }
  }
  return context
}
