export interface Country {
  name: string
  code: string
  flag: string
  priority?: boolean
}

export const COUNTRIES: Country[] = [
  // Top priorité Afrique de l'Ouest & Centrale & Maghreb
  { name: "Côte d'Ivoire", code: 'CI', flag: '🇨🇮', priority: true },
  { name: 'Sénégal', code: 'SN', flag: '🇸🇳', priority: true },
  { name: 'Mali', code: 'ML', flag: '🇲🇱', priority: true },
  { name: 'Guinée', code: 'GN', flag: '🇬🇳', priority: true },
  { name: 'Cameroun', code: 'CM', flag: '🇨🇲', priority: true },
  { name: 'Bénin', code: 'BJ', flag: '🇧🇯', priority: true },
  { name: 'Togo', code: 'TG', flag: '🇹🇬', priority: true },
  { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', priority: true },
  { name: 'Gabon', code: 'GA', flag: '🇬🇦', priority: true },
  { name: 'Congo-Brazzaville', code: 'CG', flag: '🇨🇬', priority: true },
  { name: 'RD Congo', code: 'CD', flag: '🇨🇩', priority: true },
  { name: 'Niger', code: 'NE', flag: '🇳🇪', priority: true },
  { name: 'Tchad', code: 'TD', flag: '🇹🇩', priority: true },
  { name: 'Ghana', code: 'GH', flag: '🇬🇭', priority: true },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', priority: true },
  { name: 'Mauritanie', code: 'MR', flag: '🇲🇷', priority: true },
  { name: 'Madagascar', code: 'MG', flag: '🇲🇬', priority: true },
  { name: 'Rwanda', code: 'RW', flag: '🇷🇼', priority: true },
  { name: 'Maroc', code: 'MA', flag: '🇲🇦', priority: true },
  { name: 'Algérie', code: 'DZ', flag: '🇩🇿', priority: true },
  { name: 'Tunisie', code: 'TN', flag: '🇹🇳', priority: true },
  { name: 'Afrique du Sud', code: 'ZA', flag: '🇿🇦', priority: true },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', priority: true },

  // Diaspora & International
  { name: 'France', code: 'FR', flag: '🇫🇷' },
  { name: 'Belgique', code: 'BE', flag: '🇧🇪' },
  { name: 'Suisse', code: 'CH', flag: '🇨🇭' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'États-Unis', code: 'US', flag: '🇺🇸' },
  { name: 'Royaume-Uni', code: 'GB', flag: '🇬🇧' },
  { name: 'Haïti', code: 'HT', flag: '🇭🇹' },
  { name: 'Guadeloupe', code: 'GP', flag: '🇬🇵' },
  { name: 'Martinique', code: 'MQ', flag: '🇲🇶' },
  { name: 'Guyane', code: 'GF', flag: '🇬🇫' },
  { name: 'La Réunion', code: 'RE', flag: '🇷🇪' },
  { name: 'Allemagne', code: 'DE', flag: '🇩🇪' },
  { name: 'Espagne', code: 'ES', flag: '🇪🇸' },
  { name: 'Italie', code: 'IT', flag: '🇮🇹' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹' },
  { name: 'Brésil', code: 'BR', flag: '🇧🇷' },
  { name: 'Angola', code: 'AO', flag: '🇦🇴' },
  { name: 'Cap-Vert', code: 'CV', flag: '🇨🇻' },
  { name: 'Guinée-Bissau', code: 'GW', flag: '🇬🇼' },
  { name: 'Guinée équatoriale', code: 'GQ', flag: '🇬🇶' },
  { name: 'Centrafrique', code: 'CF', flag: '🇨🇫' },
  { name: 'Burundi', code: 'BI', flag: '🇧🇮' },
  { name: 'Comores', code: 'KM', flag: '🇰🇲' },
  { name: 'Djibouti', code: 'DJ', flag: '🇩🇯' },
]

export function getCountryFlag(countryName: string): string {
  if (!countryName) return '🌍'
  const clean = countryName.toLowerCase().trim()
  const found = COUNTRIES.find(
    (c) => c.name.toLowerCase() === clean || c.code.toLowerCase() === clean
  )
  return found ? found.flag : '🌍'
}
