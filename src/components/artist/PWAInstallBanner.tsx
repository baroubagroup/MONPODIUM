'use client'

import React, { useState, useEffect } from 'react'
import { Download, Smartphone, X, Share, CheckCircle2, Sparkles } from 'lucide-react'
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
  const [showGuide, setShowGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // 1. Register service worker for Chromium PWA installability requirements
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('MonPodium PWA SW register notice:', err)
      })
    }

    // 2. Check if already running in standalone mode (already installed & running)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error navigator.standalone is iOS Safari specific
      window.navigator.standalone === true
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(iosDevice)

    // Check if prompt was already captured globally
    if (typeof window !== 'undefined' && (window as any).__pwaPrompt) {
      setDeferredPrompt((window as any).__pwaPrompt)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      const p = e as BeforeInstallPromptEvent
      setDeferredPrompt(p)
      if (typeof window !== 'undefined') {
        ;(window as any).__pwaPrompt = p
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      if (typeof window !== 'undefined') {
        ;(window as any).__pwaPrompt = null
      }
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== 'undefined' ? (window as any).__pwaPrompt : null)

    if (promptEvent) {
      try {
        await promptEvent.prompt()
        const choice = await promptEvent.userChoice
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
        }
      } catch (err) {
        console.error('PWA prompt error:', err)
      } finally {
        setDeferredPrompt(null)
        if (typeof window !== 'undefined') {
          ;(window as any).__pwaPrompt = null
        }
      }
      return
    }

    if (isIOS) {
      setShowGuide(true)
      return
    }

    // Fallback if browser prompt event is postponed or already prompted
    setShowGuide(true)
  }

  if (isInstalled || dismissed) {
    return null
  }

  return (
    <>
      {/* Floating Sticker Pill Dock at the bottom */}
      <aside
        aria-label="Application mobile de l'artiste"
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[470px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      >
        <div
          className={`relative rounded-2xl border p-2 sm:p-2.5 backdrop-blur-2xl overflow-hidden flex items-center justify-between gap-2.5 transition-colors ${
            isLight
              ? 'bg-white/95 border-slate-300 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.18),0_0_20px_rgba(16,185,129,0.15)] text-slate-900'
              : 'bg-zinc-950/90 border-white/15 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.9),0_0_25px_rgba(16,185,129,0.3)] text-white'
          }`}
        >
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
            <div
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md ${
                isLight ? 'bg-slate-100 border border-slate-300' : 'bg-zinc-900 border border-white/20'
              }`}
            >
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
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md flex-shrink-0 border flex items-center gap-1"
                  style={{
                    backgroundColor: `${themeColor}20`,
                    borderColor: `${themeColor}45`,
                    color: themeColor,
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  App
                </span>
              </div>
              <p className={`text-[10px] truncate flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="truncate">Application officielle • Accès direct en 1 clic sans store</span>
              </p>
            </div>
          </div>

          {/* Right: Install Button & Close */}
          <div className="flex items-center gap-1.5 relative z-10 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 4px 15px ${themeColor}66`,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l&apos;App</span>
            </button>

            {/* Dismiss X button */}
            <button
              onClick={() => setDismissed(true)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
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

      {/* Elegant Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Installer {appName}</h3>
                  <p className="text-[11px] text-zinc-400">Application PWA certifiée sécurisée</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-white flex-shrink-0" style={{ color: themeColor }}>
                    1
                  </span>
                  <span>
                    Touchez l&apos;icône <strong>Partager</strong> en bas de Safari (<Share className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-white flex-shrink-0" style={{ color: themeColor }}>
                    2
                  </span>
                  <span>
                    Faites défiler et sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-white flex-shrink-0" style={{ color: themeColor }}>
                    3
                  </span>
                  <span>
                    Validez en touchant <strong>Ajouter</strong> en haut à droite.
                  </span>
                </li>
              </ol>
            ) : (
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Installation Rapide Directe</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Si votre navigateur n&apos;a pas encore affiché la boîte de dialogue native, appuyez sur <strong>Installer l&apos;application</strong> dans la barre d&apos;adresse ou dans le menu de votre navigateur pour créer le raccourci officiel.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 px-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Aucun store requis • Chargement instantané • Mode hors-ligne</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-xl font-bold text-sm text-zinc-950 transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>J&apos;ai compris</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
