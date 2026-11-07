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
}

export function BookingModal({
  artistName,
  artistUsername,
  bookingEmail,
  bookingPhone,
  bookingEnabled = true,
  themeColor = '#9333ea',
}: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)

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
        className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] press-scale border text-white group cursor-pointer"
        style={{
          backgroundColor: `${themeColor}18`,
          borderColor: `${themeColor}45`,
          boxShadow: `0 4px 20px ${themeColor}20`,
        }}
      >
        <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: themeColor }} />
        <span>Contact & Booking Officiel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-1.5">
                  <span>Booking & Concerts</span>
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </h3>
                <p className="text-xs text-zinc-400">Pour événements, concerts et festivals</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {/* Email management */}
              <a
                href={`mailto:${bookingEmail}?subject=Demande de booking officiel - ${encodeURIComponent(artistName)}`}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 text-white border border-zinc-800 transition-colors shadow-sm"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Email de Management</div>
                  <div className="text-sm font-bold truncate text-white">{bookingEmail}</div>
                </div>
              </a>

              {/* Optional Phone */}
              {bookingPhone && (
                <a
                  href={`tel:${bookingPhone}`}
                  className="flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 text-white border border-zinc-800 transition-colors shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Téléphone Professionnel</div>
                    <div className="text-sm font-bold truncate text-white">{bookingPhone}</div>
                  </div>
                </a>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
