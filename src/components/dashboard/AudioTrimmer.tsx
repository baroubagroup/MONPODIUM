'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, Play, Pause, Scissors, Music, CheckCircle2, RotateCcw } from 'lucide-react'
import { useDashboardTheme } from '@/context/DashboardThemeContext'

interface AudioTrimmerProps {
  onAudioSelected: (file: File | null, startMs: number, endMs: number) => void
  initialStartMs?: number
  initialEndMs?: number
}

export function AudioTrimmer({
  onAudioSelected,
  initialStartMs = 0,
  initialEndMs = 15000,
}: AudioTrimmerProps) {
  const { isLight } = useDashboardTheme()
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(initialStartMs / 1000)
  const [windowLength, setWindowLength] = useState<number>(Math.min(15, (initialEndMs - initialStartMs) / 1000))
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle file drop or selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    const url = URL.createObjectURL(selected)
    setAudioUrl(url)
    setStartTime(0)
    setWindowLength(15)
  }

  // When audio metadata is loaded
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    const audioDur = audioRef.current.duration
    setDuration(audioDur)
    const maxLen = Math.min(15, audioDur)
    setWindowLength(maxLen)
    onAudioSelected(file, 0, maxLen * 1000)
  }

  // Handle live playback tracking within the 15s window
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const current = audio.currentTime
      setCurrentTime(current)
      const endTime = startTime + windowLength

      if (current >= endTime) {
        audio.pause()
        audio.currentTime = startTime
        setIsPlaying(false)
        setCurrentTime(startTime)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      audio.currentTime = startTime
      setCurrentTime(startTime)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [startTime, windowLength])

  // Play/Pause snippet preview
  const togglePlaySnippet = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.currentTime = startTime
      audio.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  // Update selection start
  const handleStartChange = (val: number) => {
    const maxStart = Math.max(0, duration - windowLength)
    const newStart = Math.min(Math.max(0, val), maxStart)
    setStartTime(newStart)
    setCurrentTime(newStart)
    if (audioRef.current) {
      audioRef.current.currentTime = newStart
    }
    onAudioSelected(file, Math.round(newStart * 1000), Math.round((newStart + windowLength) * 1000))
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-4 rounded-2xl border p-5 transition-all shadow-sm ${
      isLight
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-zinc-900/80 border-zinc-800 text-white'
    }`}>
      <div className="flex items-center justify-between">
        <label className={`text-sm font-semibold flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          <Scissors className="w-4 h-4 text-purple-600" />
          <span>Extrait audio (15s max)</span>
        </label>
        <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Ce que les visiteurs entendront en premier
        </span>
      </div>

      {!audioUrl ? (
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-colors ${
          isLight
            ? 'border-slate-300 bg-slate-50/70 hover:bg-slate-100 hover:border-purple-500'
            : 'border-zinc-700 bg-zinc-950/40 hover:bg-zinc-800/40 hover:border-purple-500'
        }`}>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Importer le morceau complet ou un extrait
          </p>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            MP3, WAV, AAC, M4A ou OGG (tu pourras découper les 15s idéales)
          </p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4 pt-1">
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
          />

          {/* File info banner */}
          <div className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
          }`}>
            <div className="flex items-center gap-2 truncate">
              <Music className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="truncate font-semibold">{file?.name}</span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>({formatTime(duration)})</span>
            </div>
            <label className="cursor-pointer text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1">
              <span>Changer</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Waveform & Scrubber Visualization */}
          <div className={`relative rounded-xl p-3 border overflow-hidden ${
            isLight
              ? 'bg-slate-900 border-slate-800 shadow-inner'
              : 'bg-zinc-950 border-zinc-800'
          }`}>
            <div className="h-16 flex items-center justify-between gap-1 px-2 relative">
              {/* Simulated waveform bars */}
              {[...Array(40)].map((_, i) => {
                const barRatio = i / 40
                const barTime = barRatio * duration
                const inSnippet = barTime >= startTime && barTime <= startTime + windowLength
                return (
                  <div
                    key={i}
                    className="w-1.5 rounded-full transition-colors"
                    style={{
                      height: `${12 + Math.abs(Math.sin(i * 1.5)) * 36}px`,
                      backgroundColor: inSnippet ? '#a855f7' : '#475569',
                    }}
                  />
                )
              })}

              {/* Progress Playhead Marker */}
              {duration > 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none transition-all duration-75"
                  style={{
                    left: `${(currentTime / duration) * 100}%`,
                  }}
                />
              )}
            </div>

            {/* Slider to adjust the start of the 15-second cut */}
            <div className="mt-3 space-y-1">
              <input
                type="range"
                min={0}
                max={Math.max(0, duration - windowLength)}
                step={0.5}
                value={startTime}
                onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Début : {formatTime(startTime)}</span>
                <span className="text-purple-400 font-semibold">
                  Extrait : {windowLength.toFixed(0)}s sélectionnées
                </span>
                <span>Fin : {formatTime(startTime + windowLength)}</span>
              </div>
            </div>
          </div>

          {/* Controls: Play/Pause preview */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={togglePlaySnippet}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md press-scale"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  <span>Tester l'extrait ({windowLength.toFixed(0)}s)</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Prêt pour la vitrine</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
