'use client'

import React, { useState } from 'react'
import { X, Heart, ShieldCheck, Copy, Check, ExternalLink, Sparkles, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  artistName: string
  username: string
  themeColor?: string
  isLight?: boolean
  tipNumber?: string | null
  tipProvider?: 'wave' | 'orange_money' | 'all'
  tipNote?: string | null
}

const PRESET_AMOUNTS = [
  { label: '500 F', value: 500 },
  { label: '1 000 F', value: 1000 },
  { label: '2 500 F', value: 2500 },
  { label: '5 000 F', value: 5000 },
  { label: '10 000 F', value: 10000 },
]

export function TipModal({
  isOpen,
  onClose,
  artistName,
  username,
  themeColor = '#10b981',
  isLight = false,
  tipNumber,
  tipProvider = 'wave',
  tipNote,
}: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1000)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const effectiveNumber = tipNumber || '+225 07 00 00 00'
  const cleanPhone = effectiveNumber.replace(/[^\d+]/g, '')

  const handleWaveDirect = () => {
    // Open Wave mobile send interface or deep link
    const waveUrl = `https://wave.com/send?phone=${encodeURIComponent(cleanPhone)}`
    window.open(waveUrl, '_blank')
    toast.success('Redirection vers Wave...')
  }

  const copyPhone = () => {
    navigator.clipboard.writeText(effectiveNumber)
    setCopied(true)
    toast.success(`Numéro ${effectiveNumber} copié !`, {
      description: 'Ouvrez votre application Wave ou Orange Money pour valider.',
    })
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-[32px] border shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-300 ${
          isLight
            ? 'apple-glass-light border-slate-200/90 text-slate-900 shadow-slate-200/80'
            : 'apple-glass border-white/10 text-white shadow-2xl'
        }`}
      >
        {/* iOS sheet grab bar indicator */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-white/20 mx-auto -mt-2 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                <span>Soutenir {artistName}</span>
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Pourboire direct Wave & Mobile Money
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

        {/* Note from artist */}
        <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800/40 text-amber-200'
        }`}>
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            {tipNote || 'Votre soutien direct permet de financer les prochains morceaux, clips et concerts en toute indépendance.'}
          </p>
        </div>

        {/* Preset Amounts */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            Choisissez un montant indicatif :
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt.value}
                onClick={() => setSelectedAmount(amt.value)}
                className={`py-2 px-1 rounded-xl text-xs font-black transition-all apple-spring active:scale-90 border text-center cursor-pointer ${
                  selectedAmount === amt.value
                    ? 'border-transparent text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
                style={selectedAmount === amt.value ? { backgroundColor: themeColor } : {}}
              >
                {amt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Number Box with Copy */}
        <div className={`p-4 rounded-2xl border space-y-2 text-center ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/80 border-white/10'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>Numéro Wave / Mobile Money :</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certifié</span>
            </span>
          </div>
          <div className="text-lg font-black tracking-wide font-mono text-emerald-400">
            {effectiveNumber}
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Wave Direct Button */}
          <button
            onClick={handleWaveDirect}
            className="w-full py-3 px-4 rounded-2xl text-xs font-black text-white bg-[#1EBBD7] hover:brightness-110 shadow-lg shadow-[#1EBBD7]/30 transition-all apple-spring active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Payer avec Wave ({selectedAmount.toLocaleString('fr-FR')} FCFA)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Copy Number */}
          <button
            onClick={copyPhone}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all apple-spring active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Numéro copié !' : 'Copier le numéro'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
