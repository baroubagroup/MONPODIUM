'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SafeImage } from '@/components/common/SafeImage'
import {
  Sparkles,
  Smartphone,
  Globe2,
  Music,
  ArrowRight,
  ShieldCheck,
  Play,
  Calendar,
  Disc3,
  ExternalLink,
  ChevronDown,
  BarChart3,
  Flame,
  CheckCircle2,
  XCircle,
  X,
  Check,
  Star,
  MessageCircle,
  Share2,
  Sliders,
  BadgeCheck,
} from 'lucide-react'

export default function HomePage() {
  const [activePreviewTab, setActivePreviewTab] = useState<'artist' | 'public_figure' | 'pwa'>('artist')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const faqs = [
    {
      q: 'Est-ce que je peux démarrer 100% gratuitement ?',
      a: 'Oui, à 100% ! Notre plan Gratuit vous permet de créer votre vitrine officielle, de regrouper vos réseaux sociaux vérifiés, d\'ajouter votre WhatsApp professionnel, et de permettre à votre communauté d\'installer votre propre application mobile PWA sur leur téléphone. Pour les artistes, vous pouvez téléverser votre première sortie musicale avec son extrait 15s découpé. Aucune carte bancaire n\'est demandée.',
    },
    {
      q: 'Je ne suis pas musicien mais personnalité publique ou créateur, est-ce adapté ?',
      a: 'Absolument ! MonPodium est conçu pour deux univers : les Artistes Musiciens et les Personnalités Publiques / Créateurs d\'impact. Dès l\'inscription, vous choisissez votre profil. Si vous êtes une personnalité publique, votre page se concentre sur votre biographie, votre badge officiel anti-usurpation, votre WhatsApp Pro, vos réseaux officiels réorganisables (vous décidez quel lien est affiché en premier) et votre lien de collaboration / boutique.',
    },
    {
      q: 'Comment fonctionne la réorganisation des liens ?',
      a: 'Vous avez le contrôle total. Dans votre tableau de bord, vous pouvez déplacer n\'importe quel lien vers le haut ou vers le bas (⬆️ / ⬇️). Si vous voulez que votre WhatsApp pro ou votre boutique en ligne apparaisse en tête de liste avant vos réseaux sociaux, 1 seul clic suffit !',
    },
    {
      q: 'Comment ma communauté installe-t-elle mon application sur son téléphone ?',
      a: 'Dès qu\'un visiteur ouvre votre lien officiel (ex: monpodium.com/votre-nom) sur Safari (iPhone) ou Chrome (Android), un bandeau élégant lui propose d\'ajouter votre application sur son écran d\'accueil. En 1 clic, votre icône officielle et votre nom s\'installent à côté de ses applications habituelles, sans passer par l\'App Store ni le Play Store !',
    },
    {
      q: 'Et si un artiste a plusieurs morceaux ou tout un album à ajouter ?',
      a: 'Vous testez d\'abord la plateforme en toute liberté avec votre single phare. Si vous êtes conquis et que votre discographie s\'agrandit, vous pourrez à tout moment débloquer un pack multi-titres ou le catalogue complet directement depuis votre tableau de bord, à tarif très accessible.',
    },
    {
      q: 'Puis-je suivre le nombre de visites par pays et les clics par réseau ?',
      a: 'Absolument ! Votre tableau de bord intègre un module d\'audiences en temps réel qui vous montre exactement d\'où viennent vos visiteurs (Côte d\'Ivoire, Burkina Faso, France, Sénégal, Mali, etc.) et sur quels boutons ils cliquent le plus (WhatsApp, Spotify, YouTube, Instagram, etc.).',
    },
  ]

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#070709] text-white selection:bg-emerald-500 selection:text-zinc-950">
      <Navbar />

      {/* HERO SECTION - 100% Mobile-First & Anti-Overflow */}
      <section className="relative w-full max-w-full overflow-hidden pt-6 sm:pt-14 pb-12 sm:pb-20 px-3.5 sm:px-4">
        {/* Ambient atmospheric glows strictly contained in Green */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10 w-full">
          {/* Left Column: Mobile-First Pitch */}
          <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Pour Artistes Musiciens & Personnalités Publiques</span>
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Toute ton audience. <br />
              <span className="text-emerald-400">
                Un seul lien officiel certifié.
              </span>
            </h1>

            <p className="text-xs sm:text-base md:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Que tu sois <strong>artiste musicien</strong> ou <strong>personnalité publique</strong>, regroupe tes sorties, ton <strong>WhatsApp pro</strong>, tes réseaux et tes projets dans un hub officiel anti-usurpation avec une <strong>application mobile installable</strong> par ta communauté.
            </p>

            {/* Mobile CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 w-full">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 press-scale"
              >
                <span>Créer mon lien officiel gratuit</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/himra"
                target="_blank"
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:border-emerald-500/50 press-scale"
              >
                <span>Voir un exemple live</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>

            {/* Trust points - Responsive Grid */}
            <div className="pt-4 sm:pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-1.5 sm:gap-3 text-center lg:text-left">
              <div className="p-1 sm:p-0">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-[11px] sm:text-xs font-black text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>100% Gratuit</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">Zéro frais • Sans CB</p>
              </div>

              <div className="p-1 sm:p-0">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-[11px] sm:text-xs font-black text-white">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>App Mobile PWA</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">Sur l&apos;écran des fans</p>
              </div>

              <div className="p-1 sm:p-0">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-[11px] sm:text-xs font-black text-white">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Stats Pays</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">Suivi de tes clics</p>
              </div>
            </div>
          </div>

          {/* Right Column: INTERACTIVE SMARTPHONE SHOWCASE */}
          <div className="w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[390px] mx-auto">
            {/* Interactive Preview Switcher Tabs */}
            <div className="flex items-center justify-between p-1 bg-zinc-900/95 border border-zinc-800 rounded-xl sm:rounded-2xl mb-3 text-[11px] sm:text-xs font-bold shadow-md">
              <button
                onClick={() => setActivePreviewTab('artist')}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer press-scale text-center ${
                  activePreviewTab === 'artist'
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🎵 Artiste</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('public_figure')}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer press-scale text-center ${
                  activePreviewTab === 'public_figure'
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⭐ Personnalité</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('pwa')}
                className={`flex-1 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer press-scale text-center ${
                  activePreviewTab === 'pwa'
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📱 App PWA</span>
              </button>
            </div>

            {/* Smartphone Outer Bezel Frame */}
            <div className="relative rounded-[32px] sm:rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-zinc-700 via-zinc-850 to-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.2)] border-2 border-white/10">
              {/* Dynamic Island Speaker Notch */}
              <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800" />
              </div>

              {/* Screen Body */}
              <div className="rounded-[24px] sm:rounded-[30px] bg-zinc-950 overflow-hidden border border-zinc-800/80 p-3.5 sm:p-5 text-left space-y-3.5">
                {/* 1. TAB: PROFIL ARTISTE */}
                {activePreviewTab === 'artist' && (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                        <span className="font-mono font-bold text-white text-[11px] truncate">monpodium.com/himra</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex-shrink-0">
                        Artiste Certifié
                      </span>
                    </div>

                    <div className="text-center space-y-2 pt-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mx-auto border-2 border-emerald-500/50 shadow-xl bg-zinc-900">
                        <SafeImage
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                          alt="HIMRA"
                          fallbackType="avatar"
                          fallbackText="HIMRA"
                          themeColor="#10b981"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <h4 className="font-black text-base sm:text-lg text-white">HIMRA</h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium line-clamp-2 px-1">
                          Artiste rappeur & performer. Retrouvez ici toutes mes sorties officielles et liens de streaming.
                        </p>
                      </div>
                    </div>

                    {/* Booking Button Mock */}
                    <div className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Contact & Booking Officiel</span>
                    </div>

                    {/* Latest Release Card inside Mock with 15s player */}
                    <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2.5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0 shadow-md">
                        <SafeImage
                          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80"
                          alt="LEGENDE"
                          fallbackType="cover"
                          fallbackText="LGD"
                          themeColor="#10b981"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">Single Actuel • Extrait 15s</span>
                        <h5 className="font-bold text-xs text-white truncate">LEGENDE</h5>
                        <p className="text-[10px] text-zinc-400 truncate">Spotify, Boomplay, Apple, YouTube</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-md flex-shrink-0">
                        <Play className="w-3 h-3 fill-zinc-950 ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TAB: PROFIL PERSONNALITÉ PUBLIQUE */}
                {activePreviewTab === 'public_figure' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                        <span className="font-mono font-bold text-white text-[11px] truncate">monpodium.com/awa</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex-shrink-0 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-emerald-400" />
                        Officiel
                      </span>
                    </div>

                    <div className="text-center space-y-1.5 pt-0.5">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden mx-auto border-2 border-emerald-500/50 shadow-xl bg-zinc-900">
                        <SafeImage
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                          alt="Awa Sanogo"
                          fallbackType="avatar"
                          fallbackText="AS"
                          themeColor="#10b981"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <h4 className="font-black text-sm sm:text-base text-white">Awa Sanogo</h4>
                          <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium line-clamp-2 px-1">
                          Créatrice de contenu & Entrepreneure. Mes réseaux officiels, partenariats et boutique.
                        </p>
                      </div>
                    </div>

                    {/* Reordered Links with WhatsApp in Position #1 */}
                    <div className="space-y-1.5 pt-1">
                      {/* Priority #1: WhatsApp Pro */}
                      <div className="p-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-between text-xs font-bold shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-black uppercase text-[#25D366]">Priorité #1</span>
                            </div>
                            <span className="text-white text-[11px] font-bold truncate block">WhatsApp Pro & Business</span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-[#25D366] text-black px-2 py-0.5 rounded font-black">Discuter</span>
                      </div>

                      {/* Link 2: Official YouTube */}
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#FF0000] text-white flex items-center justify-center font-black text-[9px]">▶</span>
                          <span className="text-zinc-200 text-[11px]">Ma Chaîne YouTube</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">S&apos;abonner</span>
                      </div>

                      {/* Link 3: Instagram */}
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-[9px]">IG</span>
                          <span className="text-zinc-200 text-[11px]">Instagram Officiel</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Suivre</span>
                      </div>

                      {/* Link 4: Website / Shop */}
                      <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-zinc-700 text-white flex items-center justify-center font-black text-[9px]">🌐</span>
                          <span className="text-zinc-200 text-[11px]">Boutique en Ligne</span>
                        </div>
                        <span className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Visiter</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TAB: APP PWA SUR ECRAN D'ACCUEIL */}
                {activePreviewTab === 'pwa' && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-center py-1">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-left space-y-1">
                      <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                        Sans passer par l&apos;App Store
                      </span>
                      <h4 className="font-black text-xs sm:text-sm text-white">Ton icône sur leur écran</h4>
                      <p className="text-[10px] text-zinc-400">
                        Tes fans et abonnés installent directement ton application en 1 clic.
                      </p>
                    </div>

                    {/* Simulated Phone Home Screen Icons Grid */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md font-bold text-[10px]">
                            WA
                          </div>
                          <span className="text-[8px] text-zinc-400">WhatsApp</span>
                        </div>

                        {/* The Artist/Creator PWA Icon in Green */}
                        <div className="flex flex-col items-center gap-1 relative">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 border border-emerald-300 font-black text-xs animate-pulse">
                            M
                          </div>
                          <span className="text-[8px] text-emerald-400 font-black">MonPodium</span>
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md font-bold text-[10px]">
                            IG
                          </div>
                          <span className="text-[8px] text-zinc-400">Insta</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-xl bg-black text-white border border-white/20 flex items-center justify-center shadow-md font-bold text-[10px]">
                            TT
                          </div>
                          <span className="text-[8px] text-zinc-400">TikTok</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Installation ultra-rapide en 1 clic</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION PROBLÈME vs SOLUTION - Artistes & Personnalités */}
      <section className="py-12 sm:py-20 px-3.5 sm:px-4 border-t border-zinc-800/80 bg-zinc-950/70 w-full max-w-full overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LE CONSTAT DU TERRAIN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Des années de travail, du contenu produit chaque jour... <br />
              <span className="text-emerald-400">Pour perdre ton audience avec des liens éparpillés ?</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              En 2026, un internaute décide en 3 secondes s&apos;il s&apos;intéresse à toi ou s&apos;il zappe. Balader ton public avec des liens éclatés, des faux profils WhatsApp qui arnaquent tes contacts ou un Linktree générique détruit ta crédibilité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {/* Colonne 1 : LE PROBLÈME (Sans MonPodium) */}
            <div className="rounded-3xl bg-zinc-900/60 border border-red-500/25 p-5 sm:p-7 space-y-5 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center font-black">
                      <X className="w-4 h-4 stroke-[3]" />
                    </span>
                    <div>
                      <h3 className="font-black text-base text-white">Sans MonPodium</h3>
                      <span className="text-[11px] text-red-400 font-bold">La méthode éclatée & risquée</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                    Perte de crédibilité
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Les arnaques de faux WhatsApp & faux bookings</strong>
                      <span className="text-zinc-400 text-[11px]">Sans canal officiel vérifié, des faux comptes créent des numéros WhatsApp à ton nom et arnaquent tes partenaires ou fans.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Le Linktree muet et désorganisé</strong>
                      <span className="text-zinc-400 text-[11px]">Une liste de boutons gris sans âme, sans ordre stratégique, sans lecteur audio pour les musiciens et sans mise en avant de tes priorités.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Le lien unique qui exclut une partie des fans</strong>
                      <span className="text-zinc-400 text-[11px]">Mettre un seul lien YouTube ou Spotify dans ta bio bloque immédiatement tous ceux qui utilisent une autre plateforme.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Le public volatile qui t&apos;oublie en 5 minutes</strong>
                      <span className="text-zinc-400 text-[11px]">Dès la visite terminée, l&apos;algorithme les distrait. Tu n&apos;as aucun ancrage permanent sur leur smartphone.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/20 text-[11px] text-red-300 flex items-start gap-2.5 mt-4">
                <span className="font-black text-sm flex-shrink-0">⚠️</span>
                <span><strong>Bilan :</strong> Beaucoup d&apos;énergie déployée au quotidien, mais une audience fragmentée et des opportunités d&apos;affaires perdues.</span>
              </div>
            </div>

            {/* Colonne 2 : LA SOLUTION (Avec MonPodium) */}
            <div className="rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-emerald-500/60 p-5 sm:p-7 space-y-5 relative overflow-hidden shadow-xl shadow-emerald-950/40 flex flex-col justify-between">
              {/* Soft glow corner */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                    <div>
                      <h3 className="font-black text-base text-white">Avec MonPodium</h3>
                      <span className="text-[11px] text-emerald-400 font-bold">Ton Hub Officiel & Certifié</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Impact & Sécurité
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Badge Officiel & WhatsApp Pro Sécurisé</strong>
                      <span className="text-zinc-400 text-[11px]">Un canal certifié anti-usurpation. Tes partenaires et fans contactent directement ton vrai numéro sans intermédiaire douteux.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Ordre de tes liens 100% Personnalisable</strong>
                      <span className="text-zinc-400 text-[11px]">Place ton WhatsApp en #1, ta boutique ou ton clip en tête d&apos;affiche en 1 clic. Tu diriges le trafic exactement là où tu veux.</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Extrait Audio 15s Direct (Pour Musiciens)</strong>
                      <span className="text-zinc-400 text-[11px]">Ton son démarre instantanément dès le clic pour accrocher tes auditeurs, avec redirection Spotify, Boomplay, Apple Music...</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-bold">Ton Application Mobile installée sur leur écran</strong>
                      <span className="text-zinc-400 text-[11px]">Un bandeau discret invite ta communauté à installer ton icône comme une vraie application (PWA). Tu restes présent sur leur smartphone.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2.5 mt-4">
                <span className="font-black text-sm flex-shrink-0">🚀</span>
                <span><strong>Bilan :</strong> Chaque clic devient un abonné fidèle, tes contrats sont protégés contre les arnaques et ton image professionnelle est impeccable.</span>
              </div>
            </div>
          </div>

          {/* Micro-CTA d'accroche direct après comparaison */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm font-bold text-white">
                Prends le contrôle de ton image officielle dès aujourd&apos;hui.
              </p>
              <p className="text-xs text-zinc-400">
                100% Gratuit. Configuration simple et guidée en 2 minutes chrono.
              </p>
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span>Créer mon hub officiel gratuit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 SUPERPOWERS FEATURES - Clean Green Grid */}
      <section id="features" className="py-12 sm:py-20 px-3.5 sm:px-4 bg-zinc-950/40 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conçu pour l&apos;impact & la conversion</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tous les outils pour valoriser ton image officielle
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Fini les linktrees génériques sans sécurité et les faux profils. Passe à une présence en ligne solide et professionnelle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {/* Feature 1 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-emerald-500/50 transition-all space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">Hub Officiel Anti-Usurpation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Protège ton identité avec un badge certifié et une adresse officielle unique (ex: <strong>monpodium.com/tonnom</strong>) reconnue par ta communauté.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-emerald-500/30 hover:border-emerald-500 transition-all space-y-2.5 sm:space-y-3 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950">
                Exclusivité
              </span>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">Application PWA Dédiée</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tes abonnés et fans installent ton icône et ton application directement sur leur écran d&apos;accueil, sans passer par les magasins d&apos;applications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-emerald-500/50 transition-all space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">Liens Réorganisables & WhatsApp</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mets en avant ce qui compte : déplace ton WhatsApp pro en position #1, ou affiche ta boutique et tes sorties prioritaires en tête de liste.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-emerald-500/50 transition-all space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Play className="w-5 h-5 fill-emerald-400 ml-0.5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">Extrait 15s (Mode Musique)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pour les artistes musiciens : fais vibrer tes auditeurs dès l&apos;ouverture grâce au player audio 15s découpé sur ton refrain, sans pub ni délai.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-emerald-500/50 transition-all space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">Booking & Partenariats</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reçois des propositions professionnelles de marques, festivals et organisateurs directement sur ton canal sécurisé sans risque d&apos;intermédiaire.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-emerald-500/50 transition-all space-y-2.5 sm:space-y-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white">Statistiques par Pays</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Suis en temps réel d&apos;où viennent tes visiteurs (Côte d&apos;Ivoire, Burkina, France, Mali, Sénégal...) et sur quels liens ils s&apos;engagent le plus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 3 Simple Steps */}
      <section className="py-12 sm:py-16 px-3.5 sm:px-4 border-t border-zinc-800/80 bg-zinc-950/70 w-full max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-10">
          <div className="space-y-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest">En 3 minutes chrono</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Comment ça marche ?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <h4 className="font-black text-sm text-white">Choisis ton profil</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sélectionne Artiste Musicien ou Personnalité Publique, ton nom officiel et ta photo.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md">
                2
              </div>
              <h4 className="font-black text-sm text-white">Ajoute tes liens</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                WhatsApp, réseaux, boutiques, ou extrait audio 15s et plateformes de streaming.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md">
                3
              </div>
              <h4 className="font-black text-sm text-white">Partage partout</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mets ton lien en bio Instagram, TikTok, Facebook ou YouTube. Ton audience t&apos;installe !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OFFRE DE DÉMARRAGE 100% GRATUITE */}
      <section id="offerte" className="py-14 sm:py-20 px-3.5 sm:px-4 relative w-full max-w-full overflow-hidden">
        {/* Soft centered ambient glow in emerald */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative z-10 text-center">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-extrabold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Démarrage 100% Gratuit</span>
            </div>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white tracking-tight">
              Lance ta vitrine officielle sans payer 1 centime
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Zéro carte bancaire requise. Zéro engagement. Rejoins les créateurs et artistes qui unifient leur présence avec un lien officiel et leur propre application mobile.
            </p>
          </div>

          {/* Main Free Offer Box */}
          <div className="rounded-3xl bg-zinc-900/90 border-2 border-emerald-500/40 p-5 sm:p-8 shadow-2xl shadow-emerald-950/40 text-left space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] sm:text-[11px] uppercase tracking-wider border border-emerald-500/30">
                    Plan Gratuit Inclus
                  </span>
                  <span className="text-[11px] sm:text-xs text-zinc-400 font-bold">Sans condition de durée</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white mt-1.5">
                  Vitrine Officielle Offerte à vie
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  1 chanson incluse pour les artistes • Liens & WhatsApp illimités pour tous.
                </p>
              </div>

              <div className="sm:text-right pt-2 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                  0 FCFA
                </div>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-bold block">À vie • Sans carte bancaire</span>
              </div>
            </div>

            {/* Feature Checkpoints Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-white block">Application PWA installable</span>
                  <span className="text-[11px] text-zinc-400">Ton icône et ton nom sur l&apos;écran d&apos;accueil de ton public.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-white block">WhatsApp Pro & Réseaux illimités</span>
                  <span className="text-[11px] text-zinc-400">Liens personnalisés réorganisables (WhatsApp en #1).</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-white block">1 chanson complète (Mode Artiste)</span>
                  <span className="text-[11px] text-zinc-400">Pochette HD, extrait 15s et plateformes de streaming.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-white block">Badge Officiel Certifié</span>
                  <span className="text-[11px] text-zinc-400">Authentification visible contre les faux profils.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-white block">Bouton Booking & Partenariats</span>
                  <span className="text-[11px] text-zinc-400">Reçois des opportunités de concerts ou collaborations.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-white block">Statistiques en direct</span>
                  <span className="text-[11px] text-zinc-400">Suivi des visites, clics par lien et pays.</span>
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="pt-2">
              <Link
                href="/auth/register"
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm sm:text-base text-center shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] press-scale"
              >
                <span>Créer ma vitrine officielle gratuite (0 FCFA)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <p className="text-[10px] sm:text-[11px] text-center text-zinc-400 mt-2">
                Inscription en 2 minutes chrono • Zéro engagement • Aucun moyen de paiement demandé
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - Interactive Accordion */}
      <section className="py-12 sm:py-16 px-3.5 sm:px-4 border-t border-zinc-800/80 bg-zinc-950/60 w-full max-w-full overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest">Questions fréquentes</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Tout ce que tu dois savoir</h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm text-white cursor-pointer press-scale"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 sm:px-4 pb-4 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-2.5 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-14 sm:py-20 px-3.5 sm:px-4 relative overflow-hidden bg-gradient-to-b from-transparent to-emerald-950/20 w-full max-w-full">
        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Disc3 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin-slow" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Donne à ton image la vitrine qu&apos;elle mérite
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Crée ta page en 2 minutes, partage un seul lien officiel certifié et permets à ton public de t&apos;installer sur son téléphone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 press-scale"
            >
              <span>Démarrer maintenant (0 FCFA)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-5 py-3.5 sm:py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center transition-colors hover:text-white press-scale"
            >
              Déjà inscrit ? Se connecter
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
