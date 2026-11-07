import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

// Francophone countries (ISO 3166-1 alpha-2)
const FRANCOPHONE_COUNTRIES = [
  'FR', 'BE', 'CH', 'LU', 'MC', // Europe
  'SN', 'CI', 'CM', 'ML', 'BF', 'GN', 'NE', 'TG', 'BJ', 'GA', 'CG', 'CD',
  'MG', 'RW', 'BI', 'DJ', 'KM', 'MU', 'SC', // Africa
  'HT', 'MQ', 'GP', 'GF', 'RE', 'PM', 'WF', 'PF', 'NC', // Other
]

export type Locale = 'fr' | 'en'
export const locales: Locale[] = ['fr', 'en']
export const defaultLocale: Locale = 'en'

async function detectLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')
    if (localeCookie?.value === 'fr' || localeCookie?.value === 'en') {
      return localeCookie.value
    }

    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language') || ''
    if (acceptLanguage.toLowerCase().startsWith('fr')) {
      return 'fr'
    }

    // Could also check CF-IPCountry header if using Cloudflare/Vercel
    const country = headersList.get('x-vercel-ip-country') || ''
    if (FRANCOPHONE_COUNTRIES.includes(country.toUpperCase())) {
      return 'fr'
    }
  } catch {}
  return defaultLocale
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale
  if (!locale || !locales.includes(locale)) {
    locale = await detectLocale()
  }

  const messages = locale === 'fr'
    ? (await import('./fr')).default
    : (await import('./en')).default

  return { locale, messages }
})
