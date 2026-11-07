'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plan } from '@/types'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { toast } from 'sonner'
import {
  Sparkles,
  Check,
  CreditCard,
  Smartphone,
  CheckCircle2,
} from 'lucide-react'

export default function UpgradePlanPage() {
  const router = useRouter()
  const { isLight } = useDashboardTheme()
  const [currentPlan, setCurrentPlan] = useState<Plan>('free')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    const localUser = localStorage.getItem('monpodium_demo_user')
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser)
        if (parsed.plan) setCurrentPlan(parsed.plan)
      } catch {}
    }
  }, [])

  const handleSelectPlan = (plan: Plan) => {
    const localUser = localStorage.getItem('monpodium_demo_user')
    const current = localUser ? JSON.parse(localUser) : {}
    localStorage.setItem(
      'monpodium_demo_user',
      JSON.stringify({
        ...current,
        plan,
      })
    )
    setCurrentPlan(plan)
    toast.success(`Félicitations ! Vous êtes sur le Plan ${plan.toUpperCase()}`)
    setSuccessMsg(`Félicitations ! Votre compte est maintenant sur le Plan ${plan.toUpperCase()}.`)
    setTimeout(() => {
      setSuccessMsg(null)
      router.push('/dashboard')
    }, 1800)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Fais grandir ta carrière musicale
        </h1>
        <p className={`text-xs sm:text-sm max-w-lg mx-auto ${
          isLight ? 'text-slate-500' : 'text-zinc-400'
        }`}>
          Débloque jusqu&apos;à 20 sorties, ton nom de domaine personnalisé et offre une vitrine d&apos;exception à tes auditeurs.
        </p>
      </div>

      {successMsg && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center justify-center gap-2 ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Gratuit */}
        <div className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className="space-y-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'
            }`}>
              Gratuit
            </div>
            <div>
              <div className="text-3xl font-black">0 FCFA</div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>À vie</div>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Pour tester et lancer ton premier morceau.
            </p>

            <ul className={`space-y-2.5 pt-4 border-t text-xs ${
              isLight ? 'border-slate-200 text-slate-700' : 'border-zinc-800 text-zinc-300'
            }`}>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>1 musique active</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Extrait audio 15s</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Tous les liens plateformes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Application PWA pour fans</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan('free')}
            disabled={currentPlan === 'free'}
            className={`w-full py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer press-scale ${
              currentPlan === 'free'
                ? isLight
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-zinc-800 text-zinc-500 cursor-default'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {currentPlan === 'free' ? 'Plan Actuel' : 'Basculer en Gratuit'}
          </button>
        </div>

        {/* Starter (10 000 FCFA) */}
        <div className={`rounded-3xl border-2 border-purple-500 p-6 sm:p-7 flex flex-col justify-between space-y-6 relative shadow-xl ${
          isLight
            ? 'bg-white text-slate-900 shadow-purple-500/10'
            : 'bg-zinc-900/90 text-white shadow-purple-600/20'
        }`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
            Populaire
          </div>

          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              Starter
            </div>
            <div>
              <div className="text-3xl font-black">10 000 FCFA</div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Par an (~830 F / mois)
              </div>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Pour mettre en avant 2 à 5 morceaux.
            </p>

            <ul className={`space-y-2.5 pt-4 border-t text-xs ${
              isLight ? 'border-slate-200 text-slate-700' : 'border-zinc-800 text-zinc-300'
            }`}>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span><strong>Jusqu&apos;à 5 musiques</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Carrousel & Discographie complète</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Réseaux sociaux vérifiés</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Page d&apos;accueil artiste vitrine</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan('starter')}
            disabled={currentPlan === 'starter'}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer press-scale ${
              currentPlan === 'starter'
                ? isLight
                  ? 'bg-purple-100 text-purple-700 cursor-default'
                  : 'bg-purple-900/50 text-purple-300 cursor-default border border-purple-500/40'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:scale-105 active:scale-95'
            }`}
          >
            {currentPlan === 'starter' ? 'Plan Actuel' : 'Choisir Starter (10 000 FCFA)'}
          </button>
        </div>

        {/* Pro Illimité (15 000 FCFA) */}
        <div className={`rounded-3xl border p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className="space-y-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'
            }`}>
              Pro Illimité
            </div>
            <div>
              <div className="text-3xl font-black">15 000 FCFA</div>
              <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Par an (~1 250 F / mois)
              </div>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Pour toute ta discographie et ton branding officiel.
            </p>

            <ul className={`space-y-2.5 pt-4 border-t text-xs ${
              isLight ? 'border-slate-200 text-slate-700' : 'border-zinc-800 text-zinc-300'
            }`}>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span><strong>Jusqu&apos;à 20 musiques</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span><strong>Sous-domaine officiel dédié</strong> (ex: ksbloom.monpodium.com)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Support prioritaire</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Statistiques des écoutes</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleSelectPlan('pro')}
            disabled={currentPlan === 'pro'}
            className={`w-full py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer press-scale ${
              currentPlan === 'pro'
                ? isLight
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-zinc-800 text-zinc-500 cursor-default'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {currentPlan === 'pro' ? 'Plan Actuel' : 'Choisir Pro (15 000 FCFA)'}
          </button>
        </div>
      </div>

      {/* Payment methods note */}
      <div className={`p-6 rounded-3xl border text-center space-y-2 ${
        isLight ? 'bg-slate-100/70 border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
      }`}>
        <div className="flex items-center justify-center gap-2 text-xs font-bold">
          <Smartphone className="w-4 h-4 text-purple-600" />
          <span>Moyens de paiement acceptés prochainement</span>
        </div>
        <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Paiement mobile instantané par <strong>Orange Money</strong>, <strong>MTN MoMo</strong>, <strong>Wave</strong> et carte bancaire.
        </p>
      </div>
    </div>
  )
}
