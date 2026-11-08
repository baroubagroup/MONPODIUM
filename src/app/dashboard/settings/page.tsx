'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { getActiveUserProfile, registerInAdminUsers, isSupabaseConfigured } from '@/lib/authSync'
import { createClient } from '@/lib/supabase/client'
import {
  Smartphone,
  Globe,
  Palette,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Image as ImageIcon,
  Upload,
  Moon,
  Sun,
} from 'lucide-react'

export default function SettingsPage() {
  const { isLight } = useDashboardTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [pwaEnabled, setPwaEnabled] = useState(true)
  const [artistName, setArtistName] = useState('Artiste')
  const [username, setUsername] = useState('')
  const [pwaName, setPwaName] = useState('Artiste')
  const [pwaIconUrl, setPwaIconUrl] = useState<string | null>(null)
  const [themeColor, setThemeColor] = useState('#9333ea')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark')
  const [copiedSubdomain, setCopiedSubdomain] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const initSettings = async () => {
      const profile = await getActiveUserProfile()
      if (profile) {
        if (profile.id) setUserId(profile.id)
        if (profile.artist_name) {
          setArtistName(profile.artist_name)
          setPwaName(profile.pwa_name || profile.artist_name)
        }
        if (profile.username) setUsername(profile.username)
        if (profile.pwa_icon_url) setPwaIconUrl(profile.pwa_icon_url)
        if (profile.theme_color) setThemeColor(profile.theme_color)
        if (profile.theme_mode) setThemeMode(profile.theme_mode)
        if (profile.pwa_enabled !== undefined) setPwaEnabled(profile.pwa_enabled)
      }
    }
    initSettings()
  }, [])

  const handleIconFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPwaIconUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const copySubdomain = () => {
    navigator.clipboard.writeText(`https://${username || 'artiste'}.monpodium.com`)
    setCopiedSubdomain(true)
    toast.success('Lien copié !', {
      description: `https://${username || 'artiste'}.monpodium.com`,
    })
    setTimeout(() => setCopiedSubdomain(false), 2000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const localUser = localStorage.getItem('monpodium_demo_user')
    const current = localUser ? JSON.parse(localUser) : {}

    const updated = {
      ...current,
      id: userId || current.id,
      artist_name: artistName,
      username: username || current.username,
      pwa_enabled: pwaEnabled,
      pwa_name: pwaName || artistName,
      pwa_icon_url: pwaIconUrl,
      theme_color: themeColor,
      theme_mode: themeMode,
    }

    if (isSupabaseConfigured() && (userId || current.id)) {
      try {
        const supabase = createClient()
        await supabase.from('profiles').update({
          pwa_enabled: pwaEnabled,
          pwa_name: pwaName || artistName,
          pwa_icon_url: pwaIconUrl,
          theme_color: themeColor,
          theme_mode: themeMode,
        }).eq('id', userId || current.id)
      } catch (err) {
        console.debug('Failed to update settings in Supabase', err)
      }
    }

    localStorage.setItem('monpodium_demo_user', JSON.stringify(updated))
    registerInAdminUsers(updated)

    setSaved(true)
    toast.success('Paramètres enregistrés !', {
      description: 'Tes préférences et ton application PWA sont à jour.',
    })
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Paramètres & Application Mobile
        </h1>
        <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
          Personnalise ton adresse officielle MonPodium et l&apos;application installable par tes fans.
        </p>
      </div>

      {saved && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">Paramètres sauvegardés avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: TON SOUS-DOMAINE MONPODIUM OFFICIEL */}
        <div className={`rounded-3xl border p-6 sm:p-7 space-y-4 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className={`text-sm font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Globe className="w-4 h-4 text-purple-600" />
                <span>Ton Sous-Domaine Officiel MonPodium</span>
              </h2>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Chaque artiste possède une adresse courte et exclusive propulsée par MonPodium.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider">
              Inclus
            </span>
          </div>

          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border font-mono text-xs ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
          }`}>
            <div className={`flex items-center gap-2 font-bold truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <span className="text-purple-600">https://</span>
              <span>{username}.monpodium.com</span>
            </div>
            <button
              type="button"
              onClick={copySubdomain}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors self-end sm:self-auto cursor-pointer press-scale ${
                isLight
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
            >
              {copiedSubdomain ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSubdomain ? 'Copié !' : 'Copier l\'adresse'}</span>
            </button>
          </div>

          <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Fonctionne aussi avec le lien direct : <span className="font-mono font-bold">monpodium.com/{username}</span>. Idéal pour tes bios Instagram, TikTok et sous tes clips YouTube.
          </p>
        </div>

        {/* SECTION 2: APPLICATION PWA (NOM EXACT ET ICÔNE SANS "APP") */}
        <div className={`rounded-3xl border p-6 sm:p-7 space-y-5 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-sm font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span>Application Mobile Dédiée (PWA)</span>
              </h2>
              <p className={`text-xs leading-relaxed max-w-xl ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Permet à tes fans d&apos;installer ton application sur leur écran d&apos;accueil sans passer par l&apos;App Store ou Google Play.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={pwaEnabled}
                onChange={(e) => setPwaEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {pwaEnabled && (
            <div className={`space-y-5 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
              {/* Nom exact */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-purple-300'}`}>
                  Nom exact de ton application mobile *
                </label>
                <input
                  type="text"
                  required
                  value={pwaName}
                  onChange={(e) => setPwaName(e.target.value)}
                  placeholder="Ex: KS Bloom"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-purple-600 text-slate-900'
                      : 'bg-zinc-950 border-purple-500/60 focus:border-purple-500 text-white'
                  }`}
                />
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Ce nom apparaîtra sous l&apos;icône sur le smartphone du fan (aucun préfixe &ldquo;App&rdquo;, juste le nom exact).
                </p>
              </div>

              {/* Icône PWA */}
              <div className="space-y-2">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Icône / Logo de ton application (Recommandé : Carré 512x512 PNG)
                </label>
                <div className="flex items-center gap-5">
                  <div className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 shadow-md group ${
                    isLight ? 'bg-slate-100 border-slate-300' : 'bg-zinc-950 border-zinc-700'
                  }`}>
                    {pwaIconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pwaIconUrl}
                        alt="Icône PWA"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-xl">
                        {pwaName.charAt(0)}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer transition-opacity">
                      <Upload className="w-4 h-4 mb-0.5" />
                      <span>Changer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors press-scale ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}>
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Importer le logo de l&apos;application</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconFile}
                        className="hidden"
                      />
                    </label>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Les fans verront cette icône sur leur téléphone dès qu&apos;ils l&apos;auront installée.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Mock Screen preview */}
              <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="text-center space-y-1 flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden border mx-auto shadow-md ${
                    isLight ? 'bg-white border-slate-300' : 'bg-zinc-800 border-zinc-700'
                  }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pwaIconUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&auto=format&fit=crop&q=80'}
                      alt="Icon Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-[11px] font-bold block truncate max-w-[80px] ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {pwaName || artistName}
                  </span>
                </div>
                <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  <strong className={`block mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Aperçu écran d&apos;accueil smartphone
                  </strong>
                  L&apos;application portera le titre <strong>&ldquo;{pwaName || artistName}&rdquo;</strong> sans aucun préfixe &ldquo;App&rdquo;.
                </div>
              </div>
            </div>
          )}

          {/* Theme Color Picker */}
          <div className={`space-y-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
            <label className={`text-xs font-bold flex items-center gap-2 ${
              isLight ? 'text-slate-700' : 'text-zinc-300'
            }`}>
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Couleur d&apos;accentuation de ta vitrine</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <div className={`text-xs font-mono font-bold uppercase ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                {themeColor}
              </div>
              <div
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                Aperçu bouton
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: THÈME VISUEL DE TA VITRINE (MODE SOMBRE VS CLAIR AU CHOIX) */}
        <div className={`rounded-3xl border p-6 sm:p-7 space-y-4 transition-all shadow-sm ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/90 border-zinc-800 text-white'
        }`}>
          <div>
            <h2 className={`text-sm font-bold flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Thème Visuel de ta Vitrine Publique</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Choisis l&apos;ambiance de ta page officielle : certains artistes préfèrent le thème noir studio, d&apos;autres préfèrent le thème blanc épuré.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Dark Theme Option */}
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-3 group relative overflow-hidden cursor-pointer press-scale ${
                themeMode === 'dark'
                  ? 'bg-zinc-950 border-purple-500 ring-2 ring-purple-500/30 shadow-xl'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-black ${isLight && themeMode !== 'dark' ? 'text-slate-900' : 'text-white'}`}>
                      Mode Sombre (OLED Night)
                    </h3>
                    <span className="text-[10px] text-zinc-400">Ambiance Studio & Club</span>
                  </div>
                </div>
                {themeMode === 'dark' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    Actif
                  </span>
                )}
              </div>

              {/* Visual Mini Mockup */}
              <div className="w-full h-16 rounded-xl bg-[#08080c] border border-zinc-800 p-2 flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                  <div className="w-16 h-2 rounded-full bg-zinc-700" />
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-3 rounded-md bg-zinc-800" />
                  <div className="flex-1 h-3 rounded-md bg-purple-600/40" />
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                Fond noir profond, contrastes élevés, reflets néon. Parfait pour les artistes urbains, rap, afrobeats nocturnes.
              </p>
            </button>

            {/* Light Theme Option */}
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-3 group relative overflow-hidden cursor-pointer press-scale ${
                themeMode === 'light'
                  ? 'bg-white text-zinc-900 border-purple-500 ring-2 ring-purple-500/40 shadow-xl'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-black ${
                      themeMode === 'light' ? 'text-zinc-900' : isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      Mode Clair (Blanc Chic & Épuré)
                    </h3>
                    <span className={`text-[10px] ${
                      themeMode === 'light' ? 'text-zinc-600' : isLight ? 'text-slate-500' : 'text-zinc-400'
                    }`}>
                      Ambiance Lumineuse & Minimaliste
                    </span>
                  </div>
                </div>
                {themeMode === 'light' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    Actif
                  </span>
                )}
              </div>

              {/* Visual Mini Mockup */}
              <div className="w-full h-16 rounded-xl bg-slate-100 border border-slate-300 p-2 flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-purple-600" />
                  <div className="w-16 h-2 rounded-full bg-slate-400" />
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-3 rounded-md bg-white border border-slate-200" />
                  <div className="flex-1 h-3 rounded-md bg-purple-500/20" />
                </div>
              </div>

              <p className={`text-[11px] ${
                themeMode === 'light' ? 'text-zinc-600' : isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}>
                Fond blanc pur nacré, typographies gris ardoise, ombres douces et aérées. Idéal pour le gospel, la pop et l&apos;acoustique.
              </p>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer press-scale"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer mes paramètres</span>
          </button>
        </div>
      </form>
    </div>
  )
}
