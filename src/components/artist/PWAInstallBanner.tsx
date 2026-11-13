'use client'

import React, { useState, useEffect } from 'react'
import { Download, Smartphone, X, Share, CheckCircle2, Sparkles } from 'lucide-react'
import { SafeImage } from '@/components/common/SafeImage'
import { toast } from 'sonner'

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
  const [isPrompting, setIsPrompting] = useState(false)

  useEffect(() => {
    // 1. Register service worker immediately for Chromium PWA installability
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

    // 3. Check per-artist localStorage installed flag (persists across page navigations)
    try {
      if (username && localStorage.getItem(`pwa_installed_${username}`) === '1') {
        setIsInstalled(true)
        return
      }
    } catch {
      // localStorage may be unavailable in private mode
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(iosDevice)

    const syncFromWindowPrompt = () => {
      if (typeof window !== 'undefined' && (window as any).__pwaPrompt) {
        setDeferredPrompt((window as any).__pwaPrompt as BeforeInstallPromptEvent)
      }
    }

    // Pick up early beforeinstallprompt captured before React mounted
    syncFromWindowPrompt()

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      const p = e as BeforeInstallPromptEvent
      setDeferredPrompt(p)
      if (typeof window !== 'undefined') {
        ;(window as any).__pwaPrompt = p
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      if (typeof window !== 'undefined') {
        ;(window as any).__pwaPrompt = null
      }
      // Persist installed state per artist so it survives page navigations
      try {
        if (username) localStorage.setItem(`pwa_installed_${username}`, '1')
      } catch {
        // localStorage may be unavailable in private mode
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('monpodium:pwa-prompt-ready', syncFromWindowPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('monpodium:pwa-prompt-ready', syncFromWindowPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const triggerNativePrompt = async (promptEvent: BeforeInstallPromptEvent) => {
    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true)
        toast.success("Application installée avec succès sur votre écran d'accueil !")
        // Persist installed state per artist so the banner doesn't reappear on next visit
        try {
          if (username) localStorage.setItem(`pwa_installed_${username}`, '1')
        } catch {
          // localStorage may be unavailable in private mode
        }
      }
    } catch (err) {
      console.error('PWA prompt error:', err)
      setShowGuide(true)
    } finally {
      setDeferredPrompt(null)
      if (typeof window !== 'undefined') {
        ;(window as any).__pwaPrompt = null
      }
    }
  }

  const handleInstallClick = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const promptEvent =
      deferredPrompt ||
      (typeof window !== 'undefined' ? ((window as any).__pwaPrompt as BeforeInstallPromptEvent | null) : null)

    if (promptEvent) {
      await triggerNativePrompt(promptEvent)
      return
    }

    // On Chromium/Android, if beforeinstallprompt is still arriving right after load, wait briefly before showing manual guide
    if (!isIOS && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsPrompting(true)
      const waitedPrompt = await new Promise<BeforeInstallPromptEvent | null>((resolve) => {
        let done = false
        const finish = (ev: BeforeInstallPromptEvent | null) => {
          if (done) return
          done = true
          window.removeEventListener('beforeinstallprompt', onBip)
          window.removeEventListener('monpodium:pwa-prompt-ready', onReady)
          clearTimeout(timer)
          resolve(ev)
        }
        const onReady = () => {
          const p = (window as any).__pwaPrompt as BeforeInstallPromptEvent | null
          if (p) finish(p)
        }
        const onBip = (ev: Event) => {
          ev.preventDefault()
          const p = ev as BeforeInstallPromptEvent
          ;(window as any).__pwaPrompt = p
          finish(p)
        }
        window.addEventListener('beforeinstallprompt', onBip)
        window.addEventListener('monpodium:pwa-prompt-ready', onReady)
        const timer = setTimeout(() => {
          finish(((window as any).__pwaPrompt as BeforeInstallPromptEvent | null) || null)
        }, 1200)
      })
      setIsPrompting(false)

      if (waitedPrompt) {
        await triggerNativePrompt(waitedPrompt)
        return
      }
    }

    setShowGuide(true)
  }

  if (isInstalled || dismissed) {
    return null
  }

  return (
    <>
      {/* Floating Sticker Pill Dock at the bottom - Apple Dynamic Island Style */}
      <aside
        aria-label="Application mobile de l'artiste"
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      >
        <div
          className={`relative rounded-3xl p-2.5 sm:p-3 overflow-hidden flex items-center justify-between gap-3 transition-all ${
            isLight
              ? 'apple-dock-light text-slate-900'
              : 'apple-dock text-white'
          }`}
        >
          {/* Subtle Ambient Color Glow */}
          <div
            className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-30 blur-2xl pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />

          {/* Left: App Icon & Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
            {/* App Icon */}
            <div
              className={`relative w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg transition-transform ${
                isLight ? 'bg-slate-100 ring-2 ring-slate-200/80' : 'bg-zinc-900 ring-2 ring-white/15'
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
                className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-lg flex items-center justify-center shadow-xs"
                style={{ backgroundColor: themeColor }}
              >
                <Smartphone className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-black truncate tracking-tight drop-shadow-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
                <span className="truncate">Application officielle • Accès direct 1-clic</span>
              </p>
            </div>
          </div>

          {/* Right: Install Button & Close */}
          <div className="flex items-center gap-1.5 relative z-10 flex-shrink-0">
            <button
              type="button"
              disabled={isPrompting}
              onClick={(e) => handleInstallClick(e)}
              className="apple-spring flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black text-white shadow-xl cursor-pointer z-20 pointer-events-auto disabled:opacity-75"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 4px 18px ${themeColor}60, 0 0 0 1px rgba(255,255,255,0.2) inset`,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isPrompting ? 'Activation...' : 'Installer'}</span>
            </button>

            {/* Dismiss X button */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className={`apple-spring-subtle w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/80' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Masquer"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Elegant Installation Guide Modal - iOS Sheet Design */}
      {showGuide && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-4 pointer-events-auto animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[32px] apple-dock border border-white/20 p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-8 duration-300">
            {/* iOS Sheet Grab Indicator */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-2 mb-3" />

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ring-1 ring-white/20"
                  style={{ backgroundColor: themeColor }}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">Installer {appName}</h3>
                  <p className="text-[11px] text-zinc-400 font-medium">Application PWA officielle certifiée</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="apple-spring-subtle text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
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
