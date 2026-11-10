'use client'

import React, { useState } from 'react'
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Send,
  CheckCircle2,
  Lock,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { ModerationReport } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/authSync'

interface ReportProfileModalProps {
  isOpen: boolean
  onClose: () => void
  artistName: string
  username: string
  isLight?: boolean
  themeColor?: string
}

export function ReportProfileModal({
  isOpen,
  onClose,
  artistName,
  username,
  isLight = false,
  themeColor = '#10b981',
}: ReportProfileModalProps) {
  const [reason, setReason] = useState<ModerationReport['reason']>('impostor')
  const [description, setDescription] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (reporterEmail.trim() && !reporterEmail.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide ou laisser le champ vide.')
      return
    }

    setIsSubmitting(true)

    try {
      const cleanUsername = username.toLowerCase().trim()
      const finalEmail = reporterEmail.trim() || 'anonyme@visiteur.monpodium.com'
      const finalDescription = description.trim() || `Signalement rapide pour motif : ${reason}`

      const newReport: ModerationReport = {
        id: `rep-${Date.now()}`,
        reported_user_id: `usr-${cleanUsername}`,
        reported_artist_name: artistName,
        reported_username: cleanUsername,
        reporter_email: finalEmail,
        reason,
        description: finalDescription,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      // 1. Save in local storage moderation reports
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('monpodium_moderation_reports')
        const reportsList: ModerationReport[] = raw ? JSON.parse(raw) : []
        reportsList.unshift(newReport)
        localStorage.setItem('monpodium_moderation_reports', JSON.stringify(reportsList))

        // Update target in admin users list if exists
        const adminRaw = localStorage.getItem('monpodium_admin_users')
        if (adminRaw) {
          try {
            const adminList = JSON.parse(adminRaw)
            if (Array.isArray(adminList)) {
              const target = adminList.find(
                (u: any) => (u.username || '').toLowerCase() === cleanUsername
              )
              if (target) {
                target.moderation_report_count = (target.moderation_report_count || 0) + 1
                if (reason === 'impostor' || reason === 'scam_booking') {
                  target.is_flagged_impostor = true
                }
                localStorage.setItem('monpodium_admin_users', JSON.stringify(adminList))
              }
            }
          } catch {}
        }
      }

      // 2. Send to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient()
          await supabase.from('moderation_reports').insert({
            reported_artist_name: artistName,
            reported_username: cleanUsername,
            reporter_email: finalEmail,
            reason,
            description: finalDescription,
            status: 'pending',
          })
        } catch (supaErr) {
          console.debug('Failed to insert report in Supabase', supaErr)
        }
      }

      setSubmitted(true)
      toast.success('Signalement transmis avec succès aux modérateurs MonPodium.')
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 2000)
    } catch {
      toast.error("Une erreur s'est produite lors de l'envoi du signalement.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-[32px] border shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-300 ${
          isLight
            ? 'apple-glass-light border-slate-200/90 text-slate-900 shadow-slate-200/80'
            : 'apple-glass border-white/10 text-white shadow-2xl'
        }`}
      >
        {/* iOS sheet grab bar indicator */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-white/25 mx-auto -mt-2 mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-red-500 flex items-center gap-1.5">
                <span>Signaler ce profil</span>
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {artistName} (@{username})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-all apple-spring active:scale-90 cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base">Signalement bien reçu</h4>
            <p className={`text-xs max-w-xs mx-auto ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Merci pour votre vigilance. L&apos;équipe de modération MonPodium examine ce compte sous 24h.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`p-3 rounded-2xl text-[11px] flex items-start gap-2 border ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
            }`}>
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                MonPodium protège l&apos;identité des artistes. Tout signalement abusif peut faire l&apos;objet de sanctions.
              </span>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Motif du signalement
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'impostor',
                    label: "Usurpation d'identité",
                    desc: 'Ce compte utilise le nom ou l’image d’une célébrité sans autorisation',
                  },
                  {
                    id: 'scam_booking',
                    label: 'Arnaque / Fausse réservation',
                    desc: 'Demande d’argent, faux contact de booking, escroquerie Wave/Orange Money',
                  },
                  {
                    id: 'fake_account',
                    label: 'Faux profil ou spam',
                    desc: 'Compte automatisé, liens frauduleux ou informations trompeuses',
                  },
                  {
                    id: 'copyright',
                    label: "Atteinte aux droits d'auteur",
                    desc: 'Diffusion de morceaux ou contenus sans droit de licence',
                  },
                  {
                    id: 'other',
                    label: 'Autre infraction',
                    desc: 'Non-respect des règles de la plateforme',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      reason === item.id
                        ? 'border-red-500 bg-red-500/10'
                        : isLight
                        ? 'border-slate-200 hover:bg-slate-50'
                        : 'border-zinc-800 hover:bg-zinc-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={item.id}
                      checked={reason === item.id}
                      onChange={() => setReason(item.id as ModerationReport['reason'])}
                      className="mt-1 accent-red-600"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold">{item.label}</span>
                      <span className={`text-[10px] block leading-tight ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description (facultatif) */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                <span>Détails ou explications</span>
                <span className="text-[10px] font-normal opacity-60">facultatif</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Précisez votre signalement si vous le souhaitez (facultatif)..."
                rows={3}
                className={`w-full p-3 rounded-2xl text-xs outline-none border transition-all resize-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500'
                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-red-500'
                }`}
              />
            </div>

            {/* Reporter Email (facultatif) */}
            <div className="space-y-1.5">
              <label className={`text-xs font-bold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                <span>Votre email de contact</span>
                <span className="text-[10px] font-normal opacity-60">facultatif</span>
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="votre.email@exemple.com (laisser vide pour anonyme)"
                className={`w-full p-2.5 rounded-2xl text-xs outline-none border transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500'
                    : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-red-500'
                }`}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all press-scale cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Envoi...' : 'Transmettre'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
