export interface CountryTraffic {
  code: string
  name: string
  flag: string
  visits: number
  percentage: number
  streamingClicks: number
  growthRate: string
  topArtists?: string[]
}

export interface PlatformTrafficSummary {
  totalVisits: number
  totalUniqueVisitors: number
  totalStreamingClicks: number
  totalCountriesCount: number
  countries: CountryTraffic[]
}

export const GLOBAL_PLATFORM_TRAFFIC: PlatformTrafficSummary = {
  totalVisits: 148920,
  totalUniqueVisitors: 94350,
  totalStreamingClicks: 62410,
  totalCountriesCount: 42,
  countries: [
    {
      code: 'CI',
      name: "Côte d'Ivoire",
      flag: '🇨🇮',
      visits: 68500,
      percentage: 46.0,
      streamingClicks: 29800,
      growthRate: '+24.5%',
      topArtists: ['KS Bloom', 'LAMELO', 'Didi B', 'Roseline Layo'],
    },
    {
      code: 'FR',
      name: 'France (Diaspora)',
      flag: '🇫🇷',
      visits: 31270,
      percentage: 21.0,
      streamingClicks: 14200,
      growthRate: '+18.2%',
      topArtists: ['Didi B', 'KS Bloom', 'Roseline Layo'],
    },
    {
      code: 'SN',
      name: 'Sénégal',
      flag: '🇸🇳',
      visits: 14890,
      percentage: 10.0,
      streamingClicks: 6150,
      growthRate: '+12.4%',
      topArtists: ['KS Bloom', 'LAMELO'],
    },
    {
      code: 'CM',
      name: 'Cameroun',
      flag: '🇨🇲',
      visits: 11910,
      percentage: 8.0,
      streamingClicks: 4900,
      growthRate: '+15.1%',
      topArtists: ['Roseline Layo', 'KS Bloom'],
    },
    {
      code: 'CD',
      name: 'RD Congo',
      flag: '🇨🇩',
      visits: 8930,
      percentage: 6.0,
      streamingClicks: 3450,
      growthRate: '+21.0%',
      topArtists: ['Didi B', 'KS Bloom'],
    },
    {
      code: 'BE',
      name: 'Belgique',
      flag: '🇧🇪',
      visits: 4470,
      percentage: 3.0,
      streamingClicks: 1980,
      growthRate: '+9.3%',
      topArtists: ['Didi B', 'LAMELO'],
    },
    {
      code: 'US',
      name: 'États-Unis / Canada',
      flag: '🇺🇸',
      visits: 4460,
      percentage: 3.0,
      streamingClicks: 1120,
      growthRate: '+8.0%',
      topArtists: ['KS Bloom', 'Roseline Layo'],
    },
    {
      code: 'ML',
      name: 'Mali',
      flag: '🇲🇱',
      visits: 4490,
      percentage: 3.0,
      streamingClicks: 810,
      growthRate: '+14.6%',
      topArtists: ['Didi B', 'KS Bloom'],
    },
  ],
}

export function getArtistTraffic(artistUsername: string): {
  totalVisits: number
  uniqueVisitors: number
  streamingConversions: number
  conversionRate: string
  countries: CountryTraffic[]
} {
  // Customized proportions depending on the artist profile
  if (artistUsername === 'lamelo') {
    return {
      totalVisits: 14280,
      uniqueVisitors: 9850,
      streamingConversions: 6410,
      conversionRate: '44.8%',
      countries: [
        { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', visits: 7420, percentage: 52.0, streamingClicks: 3340, growthRate: '+28%' },
        { code: 'FR', name: 'France', flag: '🇫🇷', visits: 2850, percentage: 20.0, streamingClicks: 1390, growthRate: '+19%' },
        { code: 'SN', name: 'Sénégal', flag: '🇸🇳', visits: 1710, percentage: 12.0, streamingClicks: 820, growthRate: '+15%' },
        { code: 'CM', name: 'Cameroun', flag: '🇨🇲', visits: 1140, percentage: 8.0, streamingClicks: 510, growthRate: '+11%' },
        { code: 'BE', name: 'Belgique', flag: '🇧🇪', visits: 570, percentage: 4.0, streamingClicks: 210, growthRate: '+7%' },
        { code: 'OTHER', name: 'Autres pays', flag: '🌍', visits: 590, percentage: 4.0, streamingClicks: 140, growthRate: '+5%' },
      ],
    }
  }

  // Default (e.g. KS Bloom or standard artist)
  return {
    totalVisits: 38400,
    uniqueVisitors: 24700,
    streamingConversions: 18900,
    conversionRate: '49.2%',
    countries: [
      { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', visits: 18430, percentage: 48.0, streamingClicks: 9200, growthRate: '+22%' },
      { code: 'FR', name: 'France (Diaspora)', flag: '🇫🇷', visits: 8830, percentage: 23.0, streamingClicks: 4500, growthRate: '+17%' },
      { code: 'CM', name: 'Cameroun', flag: '🇨🇲', visits: 3840, percentage: 10.0, streamingClicks: 1950, growthRate: '+14%' },
      { code: 'SN', name: 'Sénégal', flag: '🇸🇳', visits: 3070, percentage: 8.0, streamingClicks: 1520, growthRate: '+12%' },
      { code: 'CD', name: 'RD Congo', flag: '🇨🇩', visits: 2300, percentage: 6.0, streamingClicks: 1110, growthRate: '+25%' },
      { code: 'US', name: 'États-Unis', flag: '🇺🇸', visits: 1150, percentage: 3.0, streamingClicks: 390, growthRate: '+9%' },
      { code: 'OTHER', name: 'Autres', flag: '🌍', visits: 780, percentage: 2.0, streamingClicks: 230, growthRate: '+6%' },
    ],
  }
}
