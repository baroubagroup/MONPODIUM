'use client'

import React, { useState, useRef, useEffect } from 'react'
import { COUNTRIES, Country } from '@/lib/countries'
import { ChevronDown, Search, Check, Globe } from 'lucide-react'

interface CountrySelectProps {
  value: string
  onChange: (countryName: string) => void
  isLight?: boolean
  label?: string
  placeholder?: string
}

export function CountrySelect({
  value,
  onChange,
  isLight = false,
  label,
  placeholder = 'Sélectionner un pays',
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Current selected country object
  const selectedCountry = COUNTRIES.find(
    (c) => c.name.toLowerCase() === (value || '').toLowerCase()
  )

  // Filtered countries
  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (c: Country) => {
    onChange(c.name)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      {label && (
        <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          isLight
            ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-300 text-slate-900'
            : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedCountry ? (
            <>
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span className="font-semibold text-sm truncate">{selectedCountry.name}</span>
            </>
          ) : value ? (
            <>
              <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-sm truncate">{value}</span>
            </>
          ) : (
            <span className={`text-sm ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          } ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
              : 'bg-zinc-900/95 border-zinc-700 text-white shadow-black/80'
          }`}
        >
          {/* Search Field inside dropdown */}
          <div className="p-2.5 border-b border-inherit">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full bg-transparent focus:outline-none text-xs"
                autoFocus
              />
            </div>
          </div>

          {/* List of Countries */}
          <div className="max-h-60 overflow-y-auto divide-y divide-inherit">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = (value || '').toLowerCase() === c.name.toLowerCase()
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'bg-emerald-500/15 text-emerald-300 font-bold'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-800'
                        : 'hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-6 text-center text-xs text-zinc-400">
                Aucun pays trouvé pour &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
