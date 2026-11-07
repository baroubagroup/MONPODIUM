'use client'

import React from 'react'
import { Platform, PLATFORMS } from '@/types'
import { PlatformIcon } from '@/components/artist/PlatformIcons'
import { Link2, Trash2 } from 'lucide-react'
import { useDashboardTheme } from '@/context/DashboardThemeContext'

export interface SelectedPlatformLink {
  platform: Platform
  url: string
}

interface PlatformSelectorProps {
  selectedLinks: SelectedPlatformLink[]
  onChange: (links: SelectedPlatformLink[]) => void
}

export function PlatformSelector({ selectedLinks, onChange }: PlatformSelectorProps) {
  const { isLight } = useDashboardTheme()

  // Check if platform is active
  const isPlatformSelected = (platform: Platform) => {
    return selectedLinks.some(l => l.platform === platform)
  }

  // Toggle platform on / off
  const togglePlatform = (platform: Platform) => {
    if (isPlatformSelected(platform)) {
      onChange(selectedLinks.filter(l => l.platform !== platform))
    } else {
      onChange([...selectedLinks, { platform, url: '' }])
    }
  }

  // Update specific platform URL
  const updateUrl = (platform: Platform, url: string) => {
    onChange(
      selectedLinks.map(l => (l.platform === platform ? { ...l, url } : l))
    )
  }

  return (
    <div className={`space-y-4 rounded-2xl border p-5 transition-all shadow-sm ${
      isLight
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-zinc-900/80 border-zinc-800 text-white'
    }`}>
      <div>
        <h3 className={`text-sm font-semibold flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          <Link2 className="w-4 h-4 text-purple-600" />
          <span>Où ta musique est-elle disponible ?</span>
        </h3>
        <p className={`text-xs mt-0.5 ${
          isLight ? 'text-slate-500' : 'text-zinc-400'
        }`}>
          Coche les plateformes sur lesquelles ta sortie est présente et colle les liens. Seules les plateformes sélectionnées apparaîtront sur ta vitrine.
        </p>
      </div>

      {/* Grid of clickable platform chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {PLATFORMS.map((p) => {
          const selected = isPlatformSelected(p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePlatform(p.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                selected
                  ? isLight
                    ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm ring-1 ring-purple-400/40'
                    : 'border-purple-500 bg-purple-500/15 text-white shadow-sm'
                  : isLight
                    ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: selected ? p.bgColor : (isLight ? '#e2e8f0' : '#27272a'),
                  color: selected ? p.textColor : (isLight ? '#475569' : '#a1a1aa'),
                }}
              >
                <PlatformIcon platform={p.id} size={13} />
              </div>
              <span>{p.name}</span>
            </button>
          )
        })}
      </div>

      {/* Inputs list for selected platforms */}
      <div className="space-y-3 pt-3">
        {selectedLinks.length === 0 ? (
          <div className={`text-center py-6 border border-dashed rounded-xl text-xs ${
            isLight
              ? 'border-slate-300 text-slate-500 bg-slate-50/50'
              : 'border-zinc-800 text-zinc-500 bg-zinc-950/30'
          }`}>
            Clique sur une ou plusieurs plateformes ci-dessus pour renseigner tes liens (ex : YouTube, Spotify, Boomplay...)
          </div>
        ) : (
          selectedLinks.map((link) => {
            const platformConfig = PLATFORMS.find(p => p.id === link.platform)
            return (
              <div
                key={link.platform}
                className={`flex items-center gap-3 p-2.5 rounded-xl border focus-within:border-purple-500 transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200/90 text-slate-900'
                    : 'bg-zinc-950/70 border-zinc-800 text-white'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: platformConfig?.bgColor || '#9333ea',
                    color: platformConfig?.textColor || '#ffffff',
                  }}
                >
                  <PlatformIcon platform={link.platform} size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-semibold mb-1 ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}>
                    Lien {platformConfig?.name}
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateUrl(link.platform, e.target.value)}
                    placeholder={`https://${link.platform}.com/...`}
                    className={`w-full bg-transparent text-sm focus:outline-none ${
                      isLight ? 'text-slate-900 placeholder-slate-400' : 'text-white placeholder-zinc-600'
                    }`}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => togglePlatform(link.platform)}
                  className={`p-2 rounded-lg transition-colors ${
                    isLight
                      ? 'text-slate-400 hover:text-red-500 hover:bg-slate-200/60'
                      : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800/80'
                  }`}
                  title="Retirer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
