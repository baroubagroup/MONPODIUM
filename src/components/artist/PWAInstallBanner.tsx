'use client'

import React, { useState, useEffect } from 'react'
import { Download, Smartphone, X, Share } from 'lucide-react'
import { SafeImage } from '@/components/common/SafeImage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallBannerProps {
  appName: string
  iconUrl?: string | null
  themeColor?: string
  username: string
  themeMode?: 'dark' | 'light'
}

export function PWAInstallBanner({
  appName,
  iconUrl,
  themeColor = '#10b981',
  username,
  themeMode = 'dark',
}: PWAInstallBannerProps) {
  const isLight = themeMode === 'light'
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already running in standalone mode (already installed & running)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      // @ts-expect-error navigator.standalone is iOS Safari specific
      || window.navigator.standalone === true
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(iosDevice)

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true)
      return
    }

    if (!deferredPrompt) {
      alert(
        `Pour installer ${appName} sur ton écran d'accueil, ouvre le menu de ton navigateur puis choisis "Installer l'application" ou "Ajouter à l'écran d'accueil".`
      )
      return
    }

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  if (isInstalled || dismissed) {
    return null
  }

  return (
    <>
      {/* Floating Sticker Pill Dock at the bottom */}
      <aside
        aria-label="Application mobile de l'artiste"
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[430px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      >
        <div className={`relative rounded-2xl border p-2 sm:p-2.5 backdrop-blur-2xl overflow-hidden flex items-center justify-between gap-2.5 transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-300 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.18),0_0_20px_rgba(147,51,234,0.15)] text-slate-900'
            : 'bg-zinc-950/90 border-white/15 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.9),0_0_25px_rgba(168,85,247,0.3)] text-white'
        }`}>
          {/* Subtle Ambient Color Glow */}
          <div
            className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-25 blur-2xl pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />

          {/* Left: App Icon & Name */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 relative z-10">
            {/* App Icon */}
            <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md ${
              isLight ? 'bg-slate-100 border border-slate-300' : 'bg-zinc-900 border border-white/20'
            }`}>
              <SafeImage
                src={iconUrl}
                alt={appName}
                fallbackType="pwa"
                fallbackText={appName}
                themeColor={themeColor}
                isLight={isLight}
              />
              <div
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-tl-md flex items-center justify-center shadow-xs"
                style={{ backgroundColor: themeColor }}
              >
                <Smartphone className="w-2 h-2 text-white" />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-black truncate drop-shadow-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {appName}
                </span>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md flex-shrink-0 border"
                  style={{
                    backgroundColor: `${themeColor}20`,
                    borderColor: `${themeColor}45`,
                    color: themeColor,
                  }}
                >
                  App
                </span>
              </div>
              <p className={`text-[10px] truncate flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Installer sur l&apos;écran d&apos;accueil</span>
              </p>
            </div>
          </div>

          {/* Right: Install Button & Close */}
          <div className="flex items-center gap-1.5 relative z-10 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 4px 15px ${themeColor}66`,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>

            {/* Dismiss X button */}
            <button
              onClick={() => setDismissed(true)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Masquer"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">
                Installer {appName} sur iPhone
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-300">
              Pour ajouter <strong>{appName}</strong> sur ton écran d'accueil :
            </p>

            <ol className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-emerald-400 flex-shrink-0">
                  1
                </span>
                <span>
                  Appuie sur le bouton <strong>Partager</strong> en bas de Safari (icône <Share className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-emerald-400 flex-shrink-0">
                  2
                </span>
                <span>
                  Fais défiler et appuie sur <strong>Sur l&apos;écran d&apos;accueil</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-emerald-400 flex-shrink-0">
                  3
                </span>
                <span>
                  Appuie sur <strong>Ajouter</strong>. C&apos;est prêt !
                </span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm transition-all press-scale cursor-pointer"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </>
  )
}
