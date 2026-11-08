'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AudioTrimmer } from '@/components/dashboard/AudioTrimmer'
import { PlatformSelector, SelectedPlatformLink } from '@/components/dashboard/PlatformSelector'
import { ReleaseType, Plan, PLAN_LIMITS } from '@/types'
import { slugify } from '@/lib/utils'
import { useDashboardTheme } from '@/context/DashboardThemeContext'
import { toast } from 'sonner'
import { getActiveUserProfile, isSupabaseConfigured } from '@/lib/authSync'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
} from 'lucide-react'

export default function NewReleasePage() {
  const router = useRouter()
  const { isLight } = useDashboardTheme()
  const [title, setTitle] = useState('')
  const [releaseType, setReleaseType] = useState<ReleaseType>('single')
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0])
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  // Audio snippet settings
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [startMs, setStartMs] = useState<number>(0)
  const [endMs, setEndMs] = useState<number>(15000)

  // Platforms links
  const [platformLinks, setPlatformLinks] = useState<SelectedPlatformLink[]>([
    { platform: 'spotify', url: '' },
    { platform: 'youtube', url: '' },
    { platform: 'boomplay', url: '' },
  ])

  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quota enforcement check
  const [plan, setPlan] = useState<Plan>('free')
  const [currentCount, setCurrentCount] = useState<number>(0)
  const [currentUsername, setCurrentUsername] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initProfile = async () => {
      const profile = await getActiveUserProfile()
      if (profile) {
        if (profile.plan) setPlan(profile.plan)
        if (profile.username) setCurrentUsername(profile.username)
        if (profile.id) setUserId(profile.id)

        const userReleases = localStorage.getItem(`monpodium_releases_${profile.username}`)
          || localStorage.getItem('monpodium_releases')
        if (userReleases) {
          try {
            const parsed = JSON.parse(userReleases)
            if (Array.isArray(parsed)) setCurrentCount(parsed.length)
          } catch {}
        }
      }
    }
    initProfile()
  }, [])

  const maxAllowed = PLAN_LIMITS[plan]
  const isQuotaReached = currentCount >= maxAllowed

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
      toast.success('Pochette importée avec succès !')
    }
    reader.readAsDataURL(file)
  }

  const handleAudioSelected = (file: File | null, start: number, end: number) => {
    setAudioFile(file)
    setStartMs(start)
    setEndMs(end)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setError('Veuillez renseigner un titre pour votre sortie.')
      toast.error('Titre manquant')
      return
    }

    if (isQuotaReached) {
      setError(`Votre plan ${plan} est limité à ${maxAllowed} musique(s). Veuillez passer au plan supérieur.`)
      toast.error('Quota atteint')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const releaseSlug = slugify(title)
      const newReleaseId = `rel-${Date.now()}`
      const filteredLinks = platformLinks.filter(l => l.url.trim() !== '')

      const newRelease = {
        id: newReleaseId,
        user_id: userId || 'u1',
        title,
        slug: releaseSlug,
        cover_url: coverPreview || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        release_type: releaseType,
        release_date: releaseDate,
        preview_start_ms: startMs,
        preview_end_ms: endMs,
        is_published: isPublished,
        platform_links: filteredLinks,
        created_at: new Date().toISOString(),
      }

      // 1. If Supabase is configured and userId exists, insert into DB
      if (isSupabaseConfigured() && userId) {
        try {
          const supabase = createClient()
          const { data: dbRel, error: relErr } = await supabase
            .from('releases')
            .insert({
              user_id: userId,
              title,
              slug: releaseSlug,
              cover_url: newRelease.cover_url,
              release_type: releaseType,
              release_date: releaseDate,
              preview_start_ms: startMs,
              preview_end_ms: endMs,
              is_published: isPublished,
            })
            .select()
            .single()

          if (dbRel?.id && filteredLinks.length > 0) {
            await supabase.from('platform_links').insert(
              filteredLinks.map((l, idx) => ({
                release_id: dbRel.id,
                platform: l.platform,
                url: l.url,
                display_order: idx,
              }))
            )
          }
        } catch (err) {
          console.debug('Failed to insert release into Supabase', err)
        }
      }

      // 2. Save to local storage for instant reactivity
      const existing = localStorage.getItem('monpodium_releases')
      const list = existing ? JSON.parse(existing) : []
      list.unshift(newRelease)
      localStorage.setItem('monpodium_releases', JSON.stringify(list))

      if (currentUsername) {
        localStorage.setItem(`monpodium_releases_${currentUsername}`, JSON.stringify(list))
      }

      toast.success('Sortie publiée avec succès !')
      router.push('/dashboard/releases')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      toast.error('Erreur lors de la publication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/releases"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux sorties</span>
        </Link>
        <span className={`text-xs font-bold ${
          isLight ? 'text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200' : 'text-purple-400'
        }`}>
          Quota : {currentCount} / {maxAllowed}
        </span>
      </div>

      <div>
        <h1 className={`text-2xl sm:text-3xl font-black ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Ajouter une nouvelle sortie
        </h1>
        <p className={`text-xs sm:text-sm mt-1 ${
          isLight ? 'text-slate-500' : 'text-zinc-400'
        }`}>
          Renseigne le cover, découpe ton extrait de 15 secondes et coche les plateformes de streaming.
        </p>
      </div>

      {isQuotaReached && (
        <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isLight
            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
            : 'bg-amber-950/40 border-amber-600/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              Tu as atteint la limite de ton <strong>Plan {plan}</strong> ({maxAllowed} musique). Passe au plan Starter (10 000 FCFA) ou Pro (15 000 FCFA).
            </span>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs whitespace-nowrap shadow-md press-scale"
          >
            Passer Pro
          </Link>
        </div>
      )}

      {error && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
          isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-950/50 border-red-800 text-red-200'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Titre & Cover */}
        <div className={`rounded-2xl border p-5 space-y-4 shadow-sm transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <h2 className={`text-sm font-bold ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            1. Informations générales & Cover art
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Cover upload square */}
            <div className={`relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-dashed flex-shrink-0 flex items-center justify-center cursor-pointer group transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-300 hover:border-purple-500 hover:bg-slate-100'
                : 'bg-zinc-950 border-zinc-700 hover:border-purple-500'
            }`}>
              {coverPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverPreview}
                  alt="Aperçu Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`text-center p-3 transition-colors ${
                  isLight ? 'text-slate-400 group-hover:text-purple-600' : 'text-zinc-500 group-hover:text-purple-400'
                }`}>
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-70" />
                  <span className="text-[10px] font-semibold block leading-tight">
                    Ajouter Cover (Carré)
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Title & Type */}
            <div className="flex-1 w-full space-y-3">
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${
                  isLight ? 'text-slate-700' : 'text-zinc-300'
                }`}>
                  Titre du morceau / album *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: C'est Dieu, Coup de Marteau, etc."
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:border-purple-500 text-sm focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-semibold ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>Type de sortie</label>
                  <select
                    value={releaseType}
                    onChange={(e) => setReleaseType(e.target.value as ReleaseType)}
                    className={`w-full px-3 py-2 rounded-xl border focus:border-purple-500 text-xs focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-semibold ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}>Date de sortie</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:border-purple-500 text-xs focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-zinc-950 border-zinc-800 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Audio Trimmer */}
        <div>
          <AudioTrimmer onAudioSelected={handleAudioSelected} />
        </div>

        {/* Step 3: Streaming Platforms */}
        <div>
          <PlatformSelector
            selectedLinks={platformLinks}
            onChange={setPlatformLinks}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <label className={`flex items-center gap-2 cursor-pointer text-xs select-none ${
            isLight ? 'text-slate-700' : 'text-zinc-300'
          }`}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-purple-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-semibold">Rendre immédiatement visible sur ma page</span>
          </label>

          <button
            type="submit"
            disabled={loading || isQuotaReached}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 press-scale"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Publication...' : 'Publier ma sortie'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
