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
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Share2,
  Calendar,
  Disc3,
  ExternalLink,
  ChevronDown,
  BarChart3,
  Flame,
  CheckCircle2,
  Star,
  Users,
} from 'lucide-react'

export default function HomePage() {
  const [activePreviewTab, setActivePreviewTab] = useState<'profile' | 'release' | 'pwa'>('profile')
  const [pricingPlan, setPricingPlan] = useState<'all' | 'free' | 'starter' | 'pro'>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const featuredArtists = [
    {
      name: 'KS Bloom',
      username: 'ksbloom',
      genre: 'Gospel / Afrobeats',
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      color: '#9333ea',
    },
    {
      name: 'Roseline Layo',
      username: 'roselinelayo',
      genre: 'Variété / Zoblazo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      color: '#ec4899',
    },
    {
      name: 'LAMELO',
      username: 'lamelo',
      genre: 'Rap / Afrobeats',
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      color: '#ea580c',
    },
    {
      name: 'Didi B',
      username: 'didib',
      genre: 'Rap Ivoire',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      color: '#2563eb',
    },
  ]

  const faqs = [
    {
      q: 'Est-ce que je peux démarrer 100% gratuitement ?',
      a: 'Oui ! Le plan Gratuit à vie vous permet de créer votre vitrine officielle, de téléverser votre premier morceau avec un extrait audio 15 secondes, de lier toutes vos plateformes de streaming et de permettre à vos fans d\'installer votre application mobile PWA.',
    },
    {
      q: 'Comment mes fans installent-ils mon application sur leur téléphone ?',
      a: 'Dès qu\'un auditeur ouvre votre lien (ex: monpodium.com/votre-nom) sur Safari (iPhone) ou Chrome (Android), une bannière stylisée lui propose d\'installer l\'application sur son écran d\'accueil. En 1 clic, votre icône et votre nom apparaissent à côté de ses applications habituelles, sans passer par l\'App Store ni le Play Store !',
    },
    {
      q: 'Que se passe-t-il si un clip YouTube est supprimé ou bloqué ?',
      a: 'C\'est toute la force de MonPodium : vous gardez le même lien dans votre bio Instagram et TikTok. Il vous suffit de remplacer le lien du clip dans votre tableau de bord en 5 secondes, sans jamais perdre le trafic de vos fans ni devoir changer vos publications.',
    },
    {
      q: 'Puis-je suivre le nombre de visites par pays ?',
      a: 'Absolument. Votre tableau de bord intègre des statistiques détaillées qui vous révèlent en direct d\'où proviennent vos auditeurs (Côte d\'Ivoire, Burkina Faso, France, Sénégal, Mali, etc.) et sur quelles plateformes ils cliquent le plus.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-white selection:bg-purple-600 selection:text-white">
      <Navbar />

      {/* HERO SECTION - 100% Mobile First & Ultra Impact */}
      <section className="relative pt-8 sm:pt-16 pb-16 sm:pb-24 px-4 overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-14 relative z-10">
          {/* Left Column: Mobile First Pitch */}
          <div className="flex-1 text-center lg:text-left space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>La vitrine n°1 des artistes indépendants</span>
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]">
              Toute ta musique. <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Un seul lien officiel.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Spotify, YouTube, Boomplay, Apple Music, Deezer... Partage un seul lien avec un <strong>extrait audio 15s percutant</strong>, et offre à tes fans une <strong>application mobile installable</strong> directement sur leur écran d&apos;accueil.
            </p>

            {/* Mobile CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/35 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 press-scale"
              >
                <span>Créer mon podium gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ksbloom"
                target="_blank"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:border-purple-500/50 press-scale"
              >
                <span>Voir un exemple live</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>

            {/* Trust points - Responsive Grid on Mobile */}
            <div className="pt-4 sm:pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left">
              <div className="p-2 sm:p-0">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs sm:text-sm font-black text-white">
                  <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Gratuit</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">1 son à vie sans CB</p>
              </div>

              <div className="p-2 sm:p-0">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs sm:text-sm font-black text-white">
                  <Smartphone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>App PWA</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">Installable par tes fans</p>
              </div>

              <div className="p-2 sm:p-0">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs sm:text-sm font-black text-white">
                  <Globe2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Stats Pays</span>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">Suivi de tes audiences</p>
              </div>
            </div>
          </div>

          {/* Right Column: INTERACTIVE SMARTPHONE SHOWCASE */}
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            {/* Interactive Preview Switcher Tabs */}
            <div className="flex items-center justify-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-4 text-xs font-bold shadow-md">
              <button
                onClick={() => setActivePreviewTab('profile')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer press-scale ${
                  activePreviewTab === 'profile'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📱 Profil Artiste</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('release')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer press-scale ${
                  activePreviewTab === 'release'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🎧 Extrait & Stores</span>
              </button>
              <button
                onClick={() => setActivePreviewTab('pwa')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer press-scale ${
                  activePreviewTab === 'pwa'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚡ App PWA</span>
              </button>
            </div>

            {/* Smartphone Outer Bezel Frame */}
            <div className="relative rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-zinc-700 via-zinc-850 to-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(147,51,234,0.25)] border-2 border-white/10">
              {/* Dynamic Island Speaker Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
              </div>

              {/* Screen Body */}
              <div className="rounded-[30px] bg-zinc-950 overflow-hidden border border-zinc-800/80 p-4 sm:p-5 text-left space-y-4">
                {/* 1. TAB: PROFIL ARTISTE */}
                {activePreviewTab === 'profile' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono font-bold text-white">monpodium.com/ksbloom</span>
                      </div>
                      <span className="text-[10px] bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
                        Certifié
                      </span>
                    </div>

                    <div className="text-center space-y-2 pt-1">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-purple-500/50 shadow-xl bg-zinc-900">
                        <SafeImage
                          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80"
                          alt="KS Bloom"
                          fallbackType="avatar"
                          fallbackText="KS"
                          themeColor="#9333ea"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <h4 className="font-black text-lg text-white">KS Bloom</h4>
                          <ShieldCheck className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium line-clamp-2 px-2">
                          Artiste chanteur gospel & afrobeats. Retrouvez ici toutes mes sorties officielles.
                        </p>
                      </div>
                    </div>

                    {/* Booking Button Mock */}
                    <div className="w-full py-2.5 px-3 rounded-xl border border-purple-500/40 bg-purple-600/15 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Contact & Booking Officiel</span>
                    </div>

                    {/* Latest Release Card inside Mock */}
                    <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0 shadow-md">
                        <SafeImage
                          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80"
                          alt="C'est Dieu"
                          fallbackType="cover"
                          fallbackText="CD"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block">Single Actuel</span>
                        <h5 className="font-bold text-xs text-white truncate">C&apos;est Dieu</h5>
                        <p className="text-[10px] text-zinc-400 truncate">4 plateformes actives</p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TAB: EXTRAIT & STORES */}
                {activePreviewTab === 'release' && (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden relative shadow-lg bg-zinc-900">
                      <SafeImage
                        src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"
                        alt="Morceau"
                        fallbackType="cover"
                        fallbackText="Son"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase text-purple-400 block">Nouveau Son</span>
                          <span className="text-sm font-black text-white">Élu de Dieu</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          Extrait 15s
                        </span>
                      </div>
                    </div>

                    {/* Simulated Waveform Bar */}
                    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-zinc-400">Extrait de démo</span>
                        <span className="text-purple-400">0:08 / 0:15</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      </div>
                    </div>

                    {/* Stores Links buttons */}
                    <div className="space-y-1.5">
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#1DB954] text-black flex items-center justify-center font-black text-[10px]">S</span>
                          <span>Spotify</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">Écouter</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#FF0000] text-white flex items-center justify-center font-black text-[10px]">▶</span>
                          <span>YouTube</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">Regarder</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#00D2FF] text-black flex items-center justify-center font-black text-[10px]">B</span>
                          <span>Boomplay</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">Écouter</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TAB: APP PWA SUR ECRAN D'ACCUEIL */}
                {activePreviewTab === 'pwa' && (
                  <div className="space-y-4 animate-in fade-in duration-300 text-center py-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-b from-purple-950/40 to-zinc-900 border border-purple-500/30 text-left space-y-1">
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                        Sans App Store ni Play Store
                      </span>
                      <h4 className="font-black text-sm text-white">Ton application sur l&apos;écran d&apos;accueil</h4>
                      <p className="text-[11px] text-zinc-400">
                        Tes fans installent directement ton icône officielle en 1 tap.
                      </p>
                    </div>

                    {/* Simulated Phone Home Screen Icons Grid */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md font-bold text-xs">
                            WhatsApp
                          </div>
                          <span className="text-[9px] text-zinc-400">WhatsApp</span>
                        </div>

                        {/* The Artist PWA Icon */}
                        <div className="flex flex-col items-center gap-1 relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 border-2 border-purple-400 font-black text-sm animate-pulse">
                            KS
                          </div>
                          <span className="text-[9px] text-purple-300 font-black">KS Bloom</span>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black" />
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md font-bold text-xs">
                            Insta
                          </div>
                          <span className="text-[9px] text-zinc-400">Instagram</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-2xl bg-black text-white border border-white/20 flex items-center justify-center shadow-md font-bold text-xs">
                            TikTok
                          </div>
                          <span className="text-[9px] text-zinc-400">TikTok</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      <span>Accessible hors-connexion & fluide</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ARTISTS ROSTER - Social Proof */}
      <section className="py-10 border-y border-zinc-800/80 bg-zinc-950/60">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="text-center">
            <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
              Déjà adopté par les artistes en Côte d&apos;Ivoire et en Afrique
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featuredArtists.map((artist) => (
              <Link
                key={artist.username}
                href={`/${artist.username}`}
                target="_blank"
                className="p-3 sm:p-4 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800 hover:border-purple-500/50 transition-all flex items-center gap-3 group press-scale"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                  <SafeImage
                    src={artist.avatar}
                    alt={artist.name}
                    fallbackType="avatar"
                    fallbackText={artist.name}
                    themeColor={artist.color}
                  />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-purple-400 transition-colors truncate">
                    {artist.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 truncate">{artist.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 SUPERPOWERS FEATURES - Responsive Cards */}
      <section id="features" className="py-16 sm:py-24 px-4 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conçu sur mesure pour la musique</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tout ce dont un artiste a besoin pour propulser ses sorties
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Fini les linktrees génériques sans âme et les liens YouTube perdus. Passe au niveau professionnel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <Music className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-white">Un Seul Lien Universel</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Spotify, YouTube, Boomplay, Deezer, Apple Music, Audiomack... Tes fans choisissent leur plateforme favorite en 1 clic sans friction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-purple-500/30 hover:border-purple-500 transition-all space-y-3 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                Exclusivité
              </span>
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-white">Application PWA Dédiée</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Chaque artiste dispose de sa propre application installable avec son logo et son nom, directement sur l&apos;écran d&apos;accueil de ses fans.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                <Play className="w-5 h-5 fill-indigo-400 ml-0.5" />
              </div>
              <h3 className="font-black text-base text-white">Extrait Audio 15s Direct</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fais vibrer tes auditeurs dès l&apos;ouverture de ton lien grâce à l&apos;aperçu audio découpé sur ton refrain, sans quitter la page.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-white">Statistiques par Pays</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Suis exactement d&apos;où viennent tes visiteurs (Côte d&apos;Ivoire, Burkina, France, Mali...) et prépare tes tournées ou campagnes ciblées.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-white">Bouton Booking & Concerts</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reçois des propositions professionnelles d&apos;organisateurs de festivals et d&apos;événements directement sur ton email officiel de booking.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 hover:border-purple-500/50 transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-white">Adresse Officielle Dédiée</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Profite d&apos;une URL courte et prestigieuse (ex: <strong>monpodium.com/tonnom</strong> ou sous-domaine officiel) qui renforce ton image de marque.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 3 Simple Steps */}
      <section className="py-14 sm:py-20 px-4 border-t border-zinc-800/80 bg-zinc-950/70">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">En 3 minutes chrono</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Comment ça marche ?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <h4 className="font-black text-sm text-white">Crée ton profil</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choisis ton nom d&apos;artiste, ton univers de couleur et ta photo de profil officielle.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                2
              </div>
              <h4 className="font-black text-sm text-white">Ajoute tes sons</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Téléverse ta pochette, ton extrait 15s et colle tes liens Spotify, YouTube, Boomplay...
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                3
              </div>
              <h4 className="font-black text-sm text-white">Partage partout</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mets ton lien officiel en bio Instagram, TikTok et sous tes vidéos YouTube.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION - Accessible & Mobile Friendly */}
      <section id="pricing" className="py-16 sm:py-24 px-4 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Tarifs transparents</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Choisis le plan adapté à ta carrière
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Démarre gratuitement aujourd&apos;hui et évolue quand ta discographie grandit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan Gratuit */}
            <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase tracking-wider">
                  Gratuit
                </span>
                <div>
                  <div className="text-3xl font-black text-white">0 FCFA</div>
                  <span className="text-xs text-zinc-400">À vie • Sans engagement</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Idéal pour tester la plateforme ou promouvoir ton tout dernier single.
                </p>

                <ul className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span><strong>1 musique</strong> active</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Pochette + extrait audio 15s</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Tous les liens de streaming</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Bouton Booking officiel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Application PWA incluse</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center transition-colors block press-scale"
              >
                Démarrer gratuitement
              </Link>
            </div>

            {/* Plan Starter */}
            <div className="rounded-3xl bg-zinc-900/90 border-2 border-purple-500 p-6 sm:p-7 flex flex-col justify-between space-y-6 relative shadow-xl shadow-purple-600/25">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                Recommandé
              </div>

              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-black uppercase tracking-wider">
                  Starter
                </span>
                <div>
                  <div className="text-3xl font-black text-white">10 000 FCFA</div>
                  <span className="text-xs text-zinc-400">Par an (~830 FCFA / mois)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pour les artistes en développement qui ont plusieurs sons à mettre en avant.
                </p>

                <ul className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span><strong>Jusqu&apos;à 5 musiques</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Vitrine artiste complète</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Statistiques géographiques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Support prioritaire WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Toutes les options du plan Gratuit</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs text-center transition-all hover:scale-105 block shadow-lg shadow-purple-600/30 press-scale"
              >
                Prendre le Starter (10 000 FCFA)
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[11px] font-black uppercase tracking-wider">
                  Pro Illimité
                </span>
                <div>
                  <div className="text-3xl font-black text-white">15 000 FCFA</div>
                  <span className="text-xs text-zinc-400">Par an (~1 250 FCFA / mois)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pour les professionnels qui veulent valoriser toute leur discographie officielle.
                </p>

                <ul className="space-y-2.5 pt-3 border-t border-zinc-800 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span><strong>Jusqu&apos;à 20 musiques</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span><strong>Sous-domaine exclusif</strong> (nom.monpodium.com)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Badge vérifié officiel MonPodium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Analytique complète des clics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>Accès à toutes les futures options</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center transition-colors block press-scale"
              >
                Prendre le Pro (15 000 FCFA)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION - Interactive Accordion */}
      <section className="py-14 sm:py-20 px-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Questions fréquentes</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Tout ce que tu dois savoir</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left font-bold text-sm text-white cursor-pointer press-scale"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-3 animate-in fade-in duration-200">
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
      <section className="py-16 sm:py-20 px-4 relative overflow-hidden bg-gradient-to-b from-transparent to-purple-950/30">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <Disc3 className="w-8 h-8 animate-spin-slow" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Donne à ta musique la vitrine qu&apos;elle mérite
          </h2>

          <p className="text-xs sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Crée ta page en 30 secondes, partage un seul lien officiel et permets à tes fans de t&apos;installer sur leur téléphone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-600/35 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 press-scale"
            >
              <span>Démarrer maintenant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-sm flex items-center justify-center transition-colors hover:text-white press-scale"
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
