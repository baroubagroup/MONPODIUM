'use client'

import React from 'react'
import { SocialPlatform, SocialLink } from '@/types'
import { ShieldCheck, ArrowUpRight, Globe } from 'lucide-react'
import { recordSocialClick } from '@/lib/tracker'

interface SocialLinksProps {
  links: SocialLink[]
  artistName: string
  artistUsername?: string
  themeMode?: 'dark' | 'light'
  themeColor?: string
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'whatsapp':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'twitter':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'snapchat':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.001 0C5.372 0 0 5.373 0 12s5.372 12 12.001 12c6.626 0 11.999-5.373 11.999-12s-5.373-12-11.999-12zm.23 18.79c-3.136 0-4.664-1.89-4.87-2.73-.09-.37.19-.51.41-.39 1.13.62 2.45.93 4.46.93 2.01 0 3.33-.31 4.46-.93.22-.12.5.02.41.39-.21.84-1.74 2.73-4.87 2.73zm5.72-4.71c-.72-.37-1.28-.71-1.38-1.5-.1-.78.58-1.42 1.05-2.07.61-.83.89-1.92.51-2.9-.53-1.39-2.09-2.08-3.73-2.08-1.63 0-3.19.69-3.73 2.08-.38.98-.1 2.07.51 2.9.47.65 1.15 1.29 1.05 2.07-.1.79-.66 1.13-1.38 1.5-1.11.58-1.99 1.34-1.92 2.65.04.7.53 1.09 1.17 1.09.97 0 1.95-.57 2.93-.97.74-.31 1.5-.47 2.27-.47.78 0 1.53.16 2.27.47.98.4 1.96.97 2.93.97.64 0 1.13-.39 1.17-1.09.07-1.31-.81-2.07-1.92-2.65z" />
        </svg>
      )
    default:
      return <Globe className="w-5 h-5" />
  }
}

const SOCIAL_CONFIG: Record<
  SocialPlatform,
  { name: string; bg: string; btnBg: string; btnText: string; btnLabel?: string; btnShadow?: string }
> = {
  whatsapp: {
    name: 'WhatsApp Officiel',
    bg: '#25D366',
    btnBg: '#25D366',
    btnText: '#ffffff',
    btnLabel: 'Discuter',
    btnShadow: '0 2px 10px rgba(37, 211, 102, 0.35)',
  },
  facebook: {
    name: 'Facebook Officiel',
    bg: '#1877F2',
    btnBg: '#1877F2',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(24, 119, 242, 0.35)',
  },
  instagram: {
    name: 'Instagram Officiel',
    bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    btnBg: 'linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(220, 39, 67, 0.35)',
  },
  tiktok: {
    name: 'TikTok Officiel',
    bg: '#000000',
    btnBg: '#000000',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
  },
  youtube: {
    name: 'Chaîne YouTube Officielle',
    bg: '#FF0000',
    btnBg: '#FF0000',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(255, 0, 0, 0.35)',
  },
  twitter: {
    name: 'X (Twitter) Officiel',
    bg: '#0f0f12',
    btnBg: '#0f0f12',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(15, 15, 18, 0.35)',
  },
  snapchat: {
    name: 'Snapchat Officiel',
    bg: '#FFFC00',
    btnBg: '#FFFC00',
    btnText: '#000000',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(255, 252, 0, 0.35)',
  },
  threads: {
    name: 'Threads Officiel',
    bg: '#101010',
    btnBg: '#101010',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(16, 16, 16, 0.35)',
  },
  telegram: {
    name: 'Canal Telegram',
    bg: '#229ED9',
    btnBg: '#229ED9',
    btnText: '#ffffff',
    btnLabel: 'Rejoindre',
    btnShadow: '0 2px 10px rgba(34, 158, 217, 0.35)',
  },
  linkedin: {
    name: 'LinkedIn Officiel',
    bg: '#0A66C2',
    btnBg: '#0A66C2',
    btnText: '#ffffff',
    btnLabel: 'Accéder',
    btnShadow: '0 2px 10px rgba(10, 102, 194, 0.35)',
  },
  website: {
    name: 'Site Web Officiel',
    bg: '#10b981',
    btnBg: '#10b981',
    btnText: '#ffffff',
    btnLabel: 'Visiter',
    btnShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
  },
}

export function SocialLinks({
  links,
  artistName,
  artistUsername,
  themeMode = 'dark',
  themeColor = '#10b981',
}: SocialLinksProps) {
  if (!links || links.length === 0) return null

  const isLight = themeMode === 'light'
  const sortedLinks = [...links].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  const handleLinkClick = (platform: SocialPlatform) => {
    if (artistUsername) {
      recordSocialClick({
        artistUsername,
        socialPlatform: platform,
      })
    }
  }

  return (
    <div className="w-full space-y-3 text-left">
      <div className="flex items-center justify-between px-1">
        <div className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
          <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>Réseaux Sociaux Vérifiés</span>
        </div>
        <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>Protection anti-usurpation</span>
      </div>

      <div className="space-y-2.5">
        {sortedLinks.map((link) => {
          const cfg = SOCIAL_CONFIG[link.platform] || {
            name: link.platform,
            bg: '#18181b',
            btnBg: '#18181b',
            btnText: '#ffffff',
            btnLabel: 'Accéder',
          }

          const label = link.title || cfg.name

          const isWebsite = link.platform === 'website'
          const iconBg = isWebsite ? themeColor : cfg.bg
          const btnBg = isWebsite ? themeColor : cfg.btnBg
          const btnShadow = isWebsite ? `0 2px 12px ${themeColor}50` : cfg.btnShadow

          return (
            <a
              key={link.id || `${link.platform}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleLinkClick(link.platform)}
              className={`group flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-900'
                  : 'bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/90 text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                  style={{ background: iconBg }}
                >
                  <SocialIcon platform={link.platform} />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-bold flex items-center gap-1.5 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <span>{label}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                  </div>
                </div>
              </div>

              {/* Colored Action Button matching platform branding */}
              <div
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200 group-hover:scale-105 group-hover:brightness-110 active:scale-95 shadow-sm"
                style={{
                  background: btnBg,
                  color: cfg.btnText,
                  boxShadow: btnShadow,
                }}
              >
                <span>{cfg.btnLabel || 'Accéder'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
