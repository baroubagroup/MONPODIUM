'use client'

import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { SafeImage } from '@/components/common/SafeImage'

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
    </svg>
  )
}

interface ShareProfileModalProps {
  isOpen: boolean
  onClose: () => void
  artistName: string
  username: string
  avatarUrl?: string | null
  themeColor?: string
  isLight?: boolean
  accountType?: 'musician' | 'public_figure'
}

export function ShareProfileModal({
  isOpen,
  onClose,
  artistName,
  username,
  avatarUrl,
  themeColor = '#10b981',
  isLight = false,
  accountType = 'musician',
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://monpodium.com'
  const profileUrl = `${origin}/${username}`

  const shareText =
    accountType === 'public_figure'
      ? `Retrouvez le profil officiel et tous les réseaux certifiés de ${artistName} sur MonPodium : ${profileUrl}`
      : `Découvrez la vitrine officielle et toutes les sorties musicales de ${artistName} sur MonPodium : ${profileUrl}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success('Lien officiel copié dans le presse-papier !')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Impossible de copier le lien automatiquement.')
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `MonPodium • ${artistName}`,
          text: shareText,
          url: profileUrl,
        })
        onClose()
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink()
    }
  }

  // Pre-configured sharing channels
  const channels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bg: 'bg-[#25D366] hover:bg-[#20ba59]',
      text: 'text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      action: 'Partager sur WhatsApp',
    },
    {
      name: 'Facebook',
      icon: Share2,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      text: 'text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      action: 'Partager sur Facebook',
    },
    {
      name: 'X (ex-Twitter)',
      icon: ExternalLink,
      bg: 'bg-black hover:bg-zinc-800 border border-zinc-700',
      text: 'text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      action: 'Publier sur X',
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      bg: 'bg-[#0A66C2] hover:bg-[#095196]',
      text: 'text-white',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      action: 'Partager sur LinkedIn',
    },
    {
      name: 'Telegram',
      icon: Send,
      bg: 'bg-[#229ED9] hover:bg-[#1d8dc4]',
      text: 'text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`,
      action: 'Envoyer sur Telegram',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-[32px] border shadow-2xl p-5 sm:p-6 space-y-5 animate-in slide-in-from-bottom-8 duration-300 ${
          isLight ? 'apple-glass-light text-slate-900' : 'apple-glass text-white'
        }`}
      >
        {/* iOS Sheet Grab Indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-2 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ borderColor: themeColor }}
            >
              <SafeImage
                src={avatarUrl}
                alt={artistName}
                fallbackType="avatar"
                fallbackText={artistName}
                themeColor={themeColor}
                isLight={isLight}
              />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight flex items-center gap-1.5">
                <span>Partager ce profil</span>
                <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {artistName} (@{username})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`apple-spring-subtle p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Direct Link Box */}
        <div className="space-y-1.5">
          <label className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Lien officiel du profil
          </label>
          <div
            className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition-all ${
              isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-zinc-950/80 border-white/10'
            }`}
          >
            <span className="text-xs font-mono truncate px-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              {profileUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="apple-spring flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        {/* Direct Social Channels Grid */}
        <div className="space-y-2">
          <label className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Partager directement sur vos réseaux
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {channels.map((ch) => {
              const Icon = ch.icon
              return (
                <a
                  key={ch.name}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`apple-spring flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-md ${ch.bg} ${ch.text}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{ch.action}</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Native Mobile Share Sheet Button */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={handleNativeShare}
            className={`apple-spring w-full py-2.5 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Plus d&apos;options de partage (système)</span>
          </button>
        )}
      </div>
    </div>
  )
}
