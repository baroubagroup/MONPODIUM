'use client'

import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  QrCode as QrIcon,
  Palette,
} from 'lucide-react'
import { toast } from 'sonner'
import { SafeImage } from '@/components/common/SafeImage'

interface OfficialQRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  artistName: string
  avatarUrl?: string | null
  themeColor?: string
  isLight?: boolean
}

export function OfficialQRCodeModal({
  isOpen,
  onClose,
  username,
  artistName,
  avatarUrl,
  themeColor = '#10b981',
  isLight = false,
}: OfficialQRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [qrStyle, setQrStyle] = useState<'brand' | 'dark' | 'light'>('brand')
  const [copied, setCopied] = useState(false)

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${username}`
    : `https://monpodium.com/${username}`

  useEffect(() => {
    if (!isOpen) return

    const generateQR = async () => {
      try {
        const darkColor =
          qrStyle === 'brand'
            ? themeColor
            : qrStyle === 'dark'
            ? '#09090b'
            : '#ffffff'
        const lightColor = qrStyle === 'light' ? '#09090b' : '#ffffff'

        // Render base QR code on a high-res canvas (1000x1000 for print crispness)
        const size = 1000
        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, profileUrl, {
          width: size,
          margin: 3,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'H', // High error correction allows centered avatar overlay
        })

        // Composite onto target canvas with rounded corners and center logo
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 1. Draw QR code
        ctx.drawImage(qrCanvas, 0, 0, size, size)

        // 2. Draw centered rounded avatar badge
        const logoSize = size * 0.22
        const logoX = (size - logoSize) / 2
        const logoY = (size - logoSize) / 2
        const radius = logoSize * 0.28

        // Draw white rounded background with shadow
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(logoX - 12, logoY - 12, logoSize + 24, logoSize + 24, radius + 8)
        ctx.fillStyle = lightColor
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 10
        ctx.fill()
        ctx.restore()

        // Border ring in brand color
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(logoX - 6, logoY - 6, logoSize + 12, logoSize + 12, radius + 4)
        ctx.lineWidth = 10
        ctx.strokeStyle = darkColor
        ctx.stroke()
        ctx.restore()

        const drawMonogram = () => {
          if (!ctx) return
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(logoX, logoY, logoSize, logoSize, radius)
          ctx.fillStyle = darkColor
          ctx.fill()
          ctx.fillStyle = lightColor
          ctx.font = `bold ${logoSize * 0.45}px sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(artistName.charAt(0).toUpperCase(), size / 2, size / 2)
          ctx.restore()
        }

        // Try drawing avatar image if available
        if (avatarUrl) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.save()
            ctx.beginPath()
            ctx.roundRect(logoX, logoY, logoSize, logoSize, radius)
            ctx.clip()
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
            ctx.restore()
            setDataUrl(canvas.toDataURL('image/png'))
          }
          img.onerror = () => {
            // Draw default initials monogram
            drawMonogram()
            setDataUrl(canvas.toDataURL('image/png'))
          }
          img.src = avatarUrl
        } else {
          drawMonogram()
          setDataUrl(canvas.toDataURL('image/png'))
        }

        setDataUrl(canvas.toDataURL('image/png'))
      } catch (err) {
        console.error('Failed to generate official QR Code:', err)
      }
    }

    generateQR()
  }, [isOpen, profileUrl, qrStyle, themeColor, avatarUrl, artistName])

  if (!isOpen) return null

  const downloadHD = () => {
    if (!dataUrl) return
    const link = document.createElement('a')
    link.download = `QRCode-MonPodium-${username}.png`
    link.href = dataUrl
    link.click()
    toast.success('QR Code HD téléchargé !', {
      description: 'Prêt pour vos affiches, kakémonos et flyers.',
    })
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    toast.success('Lien officiel copié dans le presse-papier !')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-[32px] border shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-300 ${
          isLight
            ? 'apple-glass-light border-slate-200/90 text-slate-900 shadow-slate-200/80'
            : 'apple-glass border-white/10 text-white shadow-2xl'
        }`}
      >
        {/* iOS sheet grab bar indicator */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-white/20 mx-auto -mt-2 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                <span>QR Code Officiel</span>
                <ShieldCheck className="w-4 h-4 text-blue-500" />
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {artistName} • monpodium.com/{username}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-all apple-spring active:scale-90 cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Style Switcher */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setQrStyle('brand')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all apple-spring active:scale-95 cursor-pointer border flex items-center gap-1.5 ${
              qrStyle === 'brand'
                ? 'border-transparent text-white shadow-md'
                : isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
            style={qrStyle === 'brand' ? { backgroundColor: themeColor } : {}}
          >
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
            <span>Couleur ({themeColor})</span>
          </button>
          <button
            onClick={() => setQrStyle('dark')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all apple-spring active:scale-95 cursor-pointer border ${
              qrStyle === 'dark'
                ? 'bg-zinc-950 text-white border-zinc-700 shadow-md'
                : isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            <span>Noir Intense</span>
          </button>
        </div>

        {/* QR Code Canvas Card Frame */}
        <div className="p-4 rounded-3xl bg-white text-zinc-900 shadow-2xl border border-zinc-200 text-center space-y-2">
          <div className="relative mx-auto w-56 h-56 rounded-2xl overflow-hidden flex items-center justify-center bg-white p-2">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-zinc-800">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Scannez pour écouter & suivre</span>
            </span>
            <p className="text-[10px] text-zinc-500 font-medium">
              Affiches • Concerts • Kakémonos • Flyers
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={downloadHD}
            className="w-full py-3 px-4 rounded-2xl text-xs font-black text-white shadow-xl transition-all apple-spring active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              backgroundColor: themeColor,
              boxShadow: `0 4px 18px ${themeColor}50`,
            }}
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le QR Code en HD (PNG)</span>
          </button>

          <button
            onClick={copyUrl}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold border transition-all apple-spring active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Lien officiel copié !' : 'Copier l\'adresse de mon lien'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
