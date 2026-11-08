'use client'

import React, { useState } from 'react'
import { Calendar, Mail, Phone, X, ShieldCheck } from 'lucide-react'
import { recordBookingClick } from '@/lib/tracker'

interface BookingModalProps {
  artistName: string
  artistUsername?: string
  bookingEmail?: string | null
  bookingPhone?: string | null
  bookingEnabled?: boolean
  themeColor?: string
  themeMode?: 'dark' | 'light'
}

export function BookingModal({
  artistName,
  artistUsername,
  bookingEmail,
  bookingPhone,
  bookingEnabled = true,
  themeColor = '#9333ea',
  themeMode = 'dark',
}: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isLight = themeMode === 'light'

  if (!bookingEnabled || !bookingEmail) {
    return null
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (artistUsername) {
      recordBookingClick({ artistUsername })
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] press-scale cursor-pointer group"
        style={{
          backgroundColor: themeColor,
          color: '#ffffff',
          boxShadow: `0 4px 18px ${themeColor}40`,
        }}
      >
        <Calendar className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0 text-white" />
        <span className="text-white font-black tracking-wide">Contact & Booking Officiel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-black text-lg flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <span>Booking & Concerts</span>
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Pour événements, concerts et festivals
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-xl transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {/* Email management */}
              <a
                href={`mailto:${bookingEmail}?subject=Demande de booking officiel - ${encodeURIComponent(artistName)}`}
                className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-colors shadow-xs ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-900'
                    : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800 text-white'
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Email de Management
                  </div>
                  <div className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {bookingEmail}
                  </div>
                </div>
              </a>

              {/* Optional Phone */}
              {bookingPhone && (
                <a
                  href={`tel:${bookingPhone}`}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-colors shadow-xs ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-900'
                      : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800 text-white'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      Téléphone Professionnel
                    </div>
                    <div className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {bookingPhone}
                    </div>
                  </div>
                </a>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
