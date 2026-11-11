'use client'

import React, { useRef } from 'react'
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Radio,
  Eye,
  MousePointerClick,
  Headphones,
  Calendar,
  Share2,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react'
import { SafeImage } from '@/components/common/SafeImage'
import { ArtistDetailedAnalytics } from '@/types/analytics'
import { Release } from '@/types'
import { toast } from 'sonner'

interface MediaKitModalProps {
  isOpen: boolean
  onClose: () => void
  artistName: string
  username: string
  avatarUrl?: string | null
  bio?: string
  country?: string
  genres?: string[]
  themeColor?: string
  bookingEmail?: string | null
  bookingPhone?: string | null
  analytics: ArtistDetailedAnalytics
  releases: Release[]
}

export function MediaKitModal({
  isOpen,
  onClose,
  artistName,
  username,
  avatarUrl,
  bio,
  country = "Côte d'Ivoire",
  genres = ['Afrobeats'],
  themeColor = '#10b981',
  bookingEmail,
  bookingPhone,
  analytics,
  releases,
}: MediaKitModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const handleCopySummary = () => {
    const text = `📊 MEDIA KIT OFFICIEL — ${artistName} (@${username})
• Vues cumulées vitrine : ${analytics.total_page_views.toLocaleString('fr-FR')}
• Clics d'écoutes & streaming : ${analytics.total_streaming_clicks.toLocaleString('fr-FR')}
• Taux de conversion : ${analytics.global_conversion_rate}%
• Pays leaders : ${(analytics.country_breakdown || []).slice(0, 3).map((c) => `${c.name} (${c.percentage}%)`).join(', ')}
• Contact Booking Officiel : ${bookingEmail || 'Non spécifié'} | ${bookingPhone || ''}
Certifié par MonPodium : ${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`

    navigator.clipboard.writeText(text)
    toast.success('Résumé du Media Kit copié dans le presse-papier !')
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl my-auto rounded-[32px] bg-zinc-950 border border-white/15 shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: themeColor }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">Media Kit Officiel Certifié</h3>
              <p className="text-[11px] text-zinc-400">Export haute définition pour marques, sponsors & festivals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Copier le résumé</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 overflow-y-auto print:p-0 print:bg-white print:text-black">
          {/* Header Banner */}
          <div
            className="p-6 rounded-3xl relative overflow-hidden border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-5"
            style={{
              background: `linear-gradient(135deg, ${themeColor}25 0%, rgba(24, 24, 27, 0.95) 70%)`,
            }}
          >
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 shadow-2xl flex-shrink-0 border-2"
              style={{ borderColor: themeColor }}
            >
              <div className="w-full h-full rounded-[12px] overflow-hidden bg-zinc-900">
                <SafeImage
                  src={avatarUrl}
                  alt={artistName}
                  fallbackType="avatar"
                  fallbackText={artistName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Profil Certifié MonPodium</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
                <span>{artistName}</span>
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                monpodium.com/{username} • {country}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {genres.map((g, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Vues Cumulées</p>
              <p className="text-2xl font-black text-white">{analytics.total_page_views.toLocaleString('fr-FR')}</p>
              <span className="text-[10px] text-emerald-400 font-bold">100% Organique</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Clics Streaming</p>
              <p className="text-2xl font-black text-white">{analytics.total_streaming_clicks.toLocaleString('fr-FR')}</p>
              <span className="text-[10px] text-emerald-400 font-bold">Écoutes qualifiées</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Conversion</p>
              <p className="text-2xl font-black" style={{ color: themeColor }}>
                {analytics.global_conversion_rate}%
              </p>
              <span className="text-[10px] text-zinc-400 font-semibold">Visiteur → Auditeur</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Sorties Actives</p>
              <p className="text-2xl font-black text-white">{releases.length}</p>
              <span className="text-[10px] text-zinc-400 font-semibold">Singles & Albums</span>
            </div>
          </div>

          {/* Top Audience & Platforms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Countries */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Répartition Géographique Clé</span>
              </div>
              <div className="space-y-2">
                {(analytics.country_breakdown || []).slice(0, 4).map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="text-zinc-400">{c.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.percentage}%`, backgroundColor: themeColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Streaming Services */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                <Radio className="w-4 h-4 text-blue-400" />
                <span>Plateformes de Streaming Leaders</span>
              </div>
              <div className="space-y-2">
                {(analytics.streaming_breakdown || []).slice(0, 4).map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{p.name}</span>
                      <span className="text-zinc-400">{p.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.percentage}%`, backgroundColor: '#3b82f6' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking & Management Section */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Contact Professionnel & Booking</h4>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 pt-1">
                {bookingEmail && (
                  <span className="flex items-center gap-1.5 font-mono text-white">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{bookingEmail}</span>
                  </span>
                )}
                {bookingPhone && (
                  <span className="flex items-center gap-1.5 font-mono text-white">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{bookingPhone}</span>
                  </span>
                )}
                {!bookingEmail && !bookingPhone && (
                  <span>Contacter directement via le profil officiel MonPodium</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 font-mono block">Document généré automatiquement le</span>
              <span className="text-xs font-bold text-zinc-300 font-mono">
                {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
