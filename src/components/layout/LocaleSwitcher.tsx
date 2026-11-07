'use client'

import React, { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

export function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match && (match[1] === 'fr' || match[1] === 'en')) {
      setCurrentLocale(match[1] as 'fr' | 'en')
    }
  }, [])

  const switchLocale = (newLocale: 'fr' | 'en') => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    setCurrentLocale(newLocale)
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-full p-1 text-xs text-zinc-400">
      <Globe className="w-3.5 h-3.5 ml-1.5 text-zinc-500" />
      <button
        onClick={() => switchLocale('fr')}
        className={`px-2 py-0.5 rounded-full font-semibold transition-all ${
          currentLocale === 'fr'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'hover:text-zinc-200'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-0.5 rounded-full font-semibold transition-all ${
          currentLocale === 'en'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'hover:text-zinc-200'
        }`}
      >
        EN
      </button>
    </div>
  )
}
