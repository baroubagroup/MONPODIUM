'use client'

import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PlatformButton } from '@/components/artist/PlatformButton'
import { AudioPreview } from '@/components/artist/AudioPreview'
import { PWAInstallBanner } from '@/components/artist/PWAInstallBanner'
import {
  Sparkles,
  Smartphone,
  Globe2,
  Music,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Flame,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
          {/* Left Column: Pitch */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>La plateforme 100% dédiée aux artistes musiciens</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Toute ta musique. <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Un seul lien.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Quand tu sors un morceau, tes fans écoutent sur YouTube, Spotify, Boomplay, Apple Music ou Deezer. Avec <strong>MonPodium</strong>, partage un seul lien toujours à jour, avec un extrait audio et ton application mobile installable par tes fans.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Créer mon podium gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#demo"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Voir un exemple</span>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-center lg:justify-start gap-8 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>1 musique 100% Gratuite</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>PWA installable incluse</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-purple-400" />
                <span>Domaine personnalisé</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Mock Landing Page */}
          <div id="demo" className="flex-1 w-full max-w-md">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-purple-500/30 via-zinc-800/40 to-zinc-900/40 shadow-2xl">
              <div className="rounded-[22px] bg-zinc-950 p-5 space-y-4 border border-zinc-800/60">
                {/* Mock Phone Status / Artist Header */}
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-white">monpodium.com/ksbloom</span>
                  </div>
                  <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                    Aperçu Live
                  </span>
                </div>

                {/* Cover art representation */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-900 via-indigo-900 to-zinc-900 shadow-xl flex items-center justify-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
                    alt="Cover Démo"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400">
                      Nouveau Single
                    </span>
                    <h3 className="text-xl font-black text-white drop-shadow-md">
                      C'est Dieu
                    </h3>
                    <p className="text-sm text-zinc-300 font-medium">KS Bloom</p>
                  </div>
                </div>

                {/* 15-second audio preview */}
                <AudioPreview
                  src="https://actions.google.com/sounds/v1/musical_tracks/breeze.ogg"
                  title="C'est Dieu (Extrait officiel)"
                  artistName="KS Bloom"
                  themeColor="#9333ea"
                  maxSeconds={15}
                />

                {/* Platform Links list */}
                <div className="space-y-2">
                  <PlatformButton platform="spotify" url="https://spotify.com" />
                  <PlatformButton platform="boomplay" url="https://boomplay.com" />
                  <PlatformButton platform="youtube" url="https://youtube.com" />
                  <PlatformButton platform="apple_music" url="https://music.apple.com" />
                </div>

                {/* PWA Prompt Mock */}
                <PWAInstallBanner
                  appName="KS Bloom"
                  username="ksbloom"
                  themeColor="#9333ea"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Pensé spécialement pour les artistes
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
              Fini les liens YouTube supprimés qui brisent tes publications. Fini de choisir quelle plateforme mettre dans ta bio Instagram ou TikTok.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Un seul lien, toutes les plateformes
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Spotify, YouTube, Boomplay, Deezer, Apple Music, Audiomack... Tes auditeurs choisissent leur plateforme favorite en un clic.
              </p>
            </div>

            {/* Card 2 - Special PWA */}
            <div className="p-7 rounded-3xl bg-zinc-900/60 border border-purple-500/30 hover:border-purple-500 transition-all duration-300 space-y-4 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                Exclusivité
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Chaque artiste a sa propre application
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Quand un fan visite ta page, il peut installer l&apos;application dédiée à ton nom d&apos;artiste (ex : <strong>KS Bloom</strong>) directement sur son écran d&apos;accueil, sous forme de sticker pratique.
              </p>
            </div>

            {/* Card 3 - Trimmer & Subdomains */}
            <div className="p-7 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Sous-domaine dédié & Extrait 15s
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Profite de ton adresse dédiée officielle (ex: <strong>ksbloom.monpodium.com</strong>) et découpe un extrait percutant de 15s pour faire vibrer tes visiteurs instantanément.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Des tarifs clairs et accessibles à tous</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Choisis ton podium
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              Commence gratuitement avec ta sortie actuelle. Évolue vers un plan annuel quand ta discographie s'agrandit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Gratuit */}
            <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  Gratuit
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    0 FCFA
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">À vie</div>
                </div>
                <p className="text-xs text-zinc-400">
                  Idéal pour tester ou pour promouvoir ton tout dernier single.
                </p>

                <ul className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span><strong>1 musique</strong> active</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Cover + extrait audio 15s</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Tous les liens de streaming</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Bouton Booking & Contact</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>PWA installable par les fans</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center transition-colors block"
              >
                Démarrer gratuitement
              </Link>
            </div>

            {/* Plan 2: Starter (10 000 FCFA) */}
            <div className="rounded-3xl bg-zinc-900/90 border-2 border-purple-500 p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-purple-600/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md">
                Recommandé
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  Starter
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    10 000 FCFA
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">Par an (soit ~830 F / mois)</div>
                </div>
                <p className="text-xs text-zinc-400">
                  Pour les artistes en développement qui ont plusieurs sons à mettre en avant.
                </p>

                <ul className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span><strong>Jusqu'à 5 musiques</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Page vitrine artiste complète</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Section Biographie & À propos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Section Blog & Actualités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Toutes les fonctionnalités Gratuit</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center transition-all hover:scale-105 block shadow-lg shadow-purple-600/30"
              >
                Prendre le Starter (10 000 FCFA)
              </Link>
            </div>

            {/* Plan 3: Pro (15 000 FCFA) */}
            <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  Pro Illimité
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    15 000 FCFA
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">Par an (soit 1 250 F / mois)</div>
                </div>
                <p className="text-xs text-zinc-400">
                  Pour les professionnels qui veulent valoriser toute leur discographie et optimiser leur image de marque.
                </p>

                <ul className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span><strong>Jusqu&apos;à 20 musiques</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span><strong>Sous-domaine officiel exclusif</strong> (ex: ksbloom.monpodium.com)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Générateur de QR Code pour concerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Statistiques de clics par plateforme</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs text-center transition-colors block"
              >
                Prendre le Pro (15 000 FCFA)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-zinc-900 p-10 sm:p-16 border border-purple-500/30 space-y-6 relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Prêt à monter sur ton podium ?
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
            Rejoins les artistes qui professionnalisent leur communication musicale dès aujourd'hui.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95 shadow-xl"
            >
              <span>Créer ma page artiste en 2 minutes</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
