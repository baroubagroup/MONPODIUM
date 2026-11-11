'use client'

import React from 'react'
import { SafeImage } from '@/components/common/SafeImage'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { SocialPlatform, AccountType, SocialLink } from '@/types'
import {
  ShieldCheck,
  Disc3,
  Sparkles,
  ExternalLink,
  Heart,
  Share2,
  Calendar,
  Lock,
} from 'lucide-react'

interface LivePhonePreviewProps {
  artistName: string
  username: string
  accountType: AccountType
  bio: string
  country: string
  themeColor: string
  themeMode: 'dark' | 'light'
  avatarUrl: string | null
  bannerUrl: string | null
  bannerColor: string
  genres: string[]
  socialLinks: { platform: SocialPlatform; url: string; display_order?: number }[]
  bookingEnabled: boolean
  tipEnabled?: boolean
}

export function LivePhonePreview({
  artistName,
  username,
  accountType,
  bio,
  country,
  themeColor,
  themeMode,
  avatarUrl,
  bannerUrl,
  bannerColor,
  genres,
  socialLinks,
  bookingEnabled,
  tipEnabled = false,
}: LivePhonePreviewProps) {
  const isLight = themeMode === 'light'
  const displayGenres = Array.from(new Set(genres.map(g => g.trim()).filter(Boolean)))
  const validLinks = socialLinks.filter(l => l.url && l.url.trim() !== '')

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px]">
      {/* Header bar indicator */}
      <div className="flex items-center justify-between pb-2 px-2 text-[11px] font-bold text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Aperçu iPhone en temps réel</span>
        </span>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
          {themeMode === 'light' ? 'Mode Clair' : 'Mode Sombre'}
        </span>
      </div>

      {/* iPhone Outer Hardware Frame */}
      <div className="relative rounded-[44px] p-3 bg-zinc-950 border-[6px] border-zinc-800 shadow-2xl ring-1 ring-white/10">
        {/* Dynamic Island Speaker Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
        </div>

        {/* Screen Viewport (Scrollable with hidden scrollbar) */}
        <div
          className={`relative rounded-[36px] overflow-hidden overflow-y-auto max-h-[640px] transition-colors select-none ${
            isLight ? 'bg-slate-100 text-slate-900' : 'bg-black text-white'
          }`}
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Top Mock Header */}
          <div className={`pt-9 pb-2 px-4 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20 ${
            isLight ? 'bg-white/80 border-slate-200' : 'bg-black/60 border-white/5'
          }`}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                style={{ backgroundColor: themeColor }}
              >
                <Disc3 className="w-3 h-3 animate-spin-slow" />
              </div>
              <span className="text-xs font-black truncate max-w-[120px]">
                {artistName || 'Nom Artiste'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-zinc-800/80 flex items-center justify-center text-[10px] text-zinc-300">
                <Share2 className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Hero Banner */}
          <div
            className="w-full h-32 relative bg-zinc-950"
            style={{
              background: bannerUrl ? `url(${bannerUrl}) center/cover no-repeat` : bannerColor,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isLight ? 'from-slate-100 via-slate-100/30' : 'from-black via-black/40'
            }`} />
          </div>

          {/* Avatar & Profile Information */}
          <div className="px-4 pb-6 pt-0 relative -mt-12 text-center space-y-3">
            {/* Avatar */}
            <div
              className={`relative mx-auto w-24 h-24 rounded-2xl overflow-hidden p-0.5 shadow-xl border-2 ${
                isLight ? 'bg-white' : 'bg-zinc-950'
              }`}
              style={{
                borderColor: themeColor,
                boxShadow: `0 0 20px ${themeColor}40`,
              }}
            >
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-900">
                <SafeImage
                  src={avatarUrl}
                  alt={artistName}
                  fallbackType="avatar"
                  fallbackText={artistName || 'MP'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] border border-black shadow-sm">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight flex items-center justify-center gap-1 truncate">
                <span>{artistName || 'Votre Nom'}</span>
                <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </h3>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1 pt-0.5">
                {displayGenres.slice(0, 3).map((g, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                    style={
                      isLight
                        ? {
                            backgroundColor: `${themeColor}15`,
                            borderColor: `${themeColor}40`,
                            color: themeColor,
                          }
                        : {
                            backgroundColor: themeColor,
                            borderColor: 'rgba(255, 255, 255, 0.25)',
                            color: '#ffffff',
                            boxShadow: `0 2px 8px ${themeColor}40`,
                          }
                    }
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio snippet */}
            {bio && (
              <p className={`text-[11px] leading-relaxed p-2.5 rounded-xl border text-left line-clamp-3 ${
                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-200'
              }`}>
                {bio}
              </p>
            )}

            {/* Booking Action */}
            {bookingEnabled && (
              <div
                className="w-full py-2 px-3 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5"
                style={{ backgroundColor: themeColor }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Contact & Booking Officiel</span>
              </div>
            )}

            {/* Tip Action if enabled */}
            {tipEnabled && (
              <div className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#1EBBD7] text-white shadow-md flex items-center justify-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Soutenir l&apos;artiste (Wave)</span>
              </div>
            )}

            {/* Verified Social Links Preview */}
            <div className="pt-2 text-left space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-400 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  <span>Réseaux Vérifiés ({validLinks.length})</span>
                </span>
                <span className="text-[9px] opacity-70">Anti-usurpation</span>
              </div>

              {validLinks.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-zinc-700 text-center text-[10px] text-zinc-500">
                  Ajoute tes liens ci-contre pour les voir apparaître ici
                </div>
              ) : (
                validLinks.slice(0, 5).map((l, i) => (
                  <div
                    key={`${l.platform}-${i}`}
                    className={`p-2 rounded-xl border flex items-center justify-between shadow-xs ${
                      isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-white">
                        <PlatformIcon platform={l.platform as any} size={14} />
                      </div>
                      <span className="text-xs font-bold capitalize">
                        {l.platform}
                      </span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white bg-emerald-500">
                      Ouvrir
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
