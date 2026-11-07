import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatDate(date: string, locale: string = 'fr'): string {
  return new Date(date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  return 'https://monpodium.com'
}

export function getArtistUrl(username: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`
  return `${getBaseUrl()}/${username}`
}

export function getReleaseUrl(username: string, slug: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}/${slug}`
  return `${getBaseUrl()}/${username}/${slug}`
}
