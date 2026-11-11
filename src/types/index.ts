export type Plan = 'free' | 'starter' | 'pro'

export type AccountType = 'musician' | 'public_figure'

export type ReleaseType = 'single' | 'ep' | 'album'

export type Platform =
  | 'spotify'
  | 'youtube'
  | 'youtube_music'
  | 'apple_music'
  | 'deezer'
  | 'boomplay'
  | 'amazon_music'
  | 'tidal'
  | 'soundcloud'
  | 'audiomack'
  | 'shazam'
  | 'anghami'
  | 'napster'
  | 'pandora'
  | 'iheartradio'

export type SocialPlatform =
  | 'whatsapp'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'twitter'
  | 'snapchat'
  | 'threads'
  | 'telegram'
  | 'linkedin'
  | 'website'

export interface User {
  id: string
  email: string
  full_name: string
  artist_name: string
  username: string
  account_type?: AccountType
  avatar_url: string | null
  banner_url: string | null
  banner_color: string | null
  bio: string | null
  genres: string[] // Multi-genres support (polyvalent)
  country: string | null
  booking_email: string | null
  booking_phone: string | null
  booking_enabled: boolean
  tip_enabled?: boolean
  tip_provider?: 'wave' | 'orange_money' | 'all'
  tip_number?: string | null
  tip_note?: string | null
  plan: Plan
  plan_expires_at: string | null
  theme_color: string
  theme_mode?: 'dark' | 'light' // Choix de l'artiste : Thème Noir (Sombre) ou Blanc (Clair)
  pwa_enabled: boolean
  pwa_name: string | null
  pwa_icon_url: string | null
  pwa_splash_url: string | null
  verified?: boolean
  account_status?: 'active' | 'suspended' | 'banned'
  is_flagged_impostor?: boolean
  moderation_report_count?: number
  admin_notes?: string
  social_links?: SocialLink[]
  created_at: string
}

export interface ModerationReport {
  id: string
  reported_user_id: string
  reported_artist_name: string
  reported_username: string
  reporter_email: string
  reason: 'impostor' | 'fake_account' | 'copyright' | 'scam_booking' | 'other'
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
}

export interface Release {
  id: string
  user_id: string
  title: string
  slug: string
  cover_url: string | null
  preview_audio_url: string | null
  preview_start_ms: number
  preview_end_ms: number
  release_type: ReleaseType
  release_date: string | null
  is_published: boolean
  display_order: number
  created_at: string
  platform_links?: PlatformLink[]
  user?: User
}

export interface PlatformLink {
  id: string
  release_id: string
  platform: Platform
  url: string
  display_order: number
}

export interface SocialLink {
  id: string
  user_id: string
  platform: SocialPlatform
  url: string
  title?: string
  display_order?: number
}

export interface PlatformConfig {
  id: Platform
  name: string
  color: string
  bgColor: string
  textColor: string
  icon: string
}

export const PLATFORMS: PlatformConfig[] = [
  { id: 'spotify', name: 'Spotify', color: '#1DB954', bgColor: '#1DB954', textColor: '#fff', icon: 'spotify' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', bgColor: '#FF0000', textColor: '#fff', icon: 'youtube' },
  { id: 'youtube_music', name: 'YouTube Music', color: '#FF0000', bgColor: '#FF0000', textColor: '#fff', icon: 'youtube-music' },
  { id: 'apple_music', name: 'Apple Music', color: '#FC3C44', bgColor: '#FC3C44', textColor: '#fff', icon: 'apple-music' },
  { id: 'deezer', name: 'Deezer', color: '#A238FF', bgColor: '#A238FF', textColor: '#fff', icon: 'deezer' },
  { id: 'boomplay', name: 'Boomplay', color: '#00C853', bgColor: '#00C853', textColor: '#fff', icon: 'boomplay' },
  { id: 'amazon_music', name: 'Amazon Music', color: '#00A8E1', bgColor: '#232F3E', textColor: '#fff', icon: 'amazon-music' },
  { id: 'tidal', name: 'Tidal', color: '#00FFFF', bgColor: '#000', textColor: '#fff', icon: 'tidal' },
  { id: 'soundcloud', name: 'SoundCloud', color: '#FF5500', bgColor: '#FF5500', textColor: '#fff', icon: 'soundcloud' },
  { id: 'audiomack', name: 'Audiomack', color: '#FFA500', bgColor: '#FFA500', textColor: '#fff', icon: 'audiomack' },
  { id: 'shazam', name: 'Shazam', color: '#0088FF', bgColor: '#0088FF', textColor: '#fff', icon: 'shazam' },
  { id: 'anghami', name: 'Anghami', color: '#7B2FBE', bgColor: '#7B2FBE', textColor: '#fff', icon: 'anghami' },
  { id: 'napster', name: 'Napster', color: '#009BFF', bgColor: '#009BFF', textColor: '#fff', icon: 'napster' },
  { id: 'pandora', name: 'Pandora', color: '#3668FF', bgColor: '#3668FF', textColor: '#fff', icon: 'pandora' },
  { id: 'iheartradio', name: 'iHeartRadio', color: '#C6002B', bgColor: '#C6002B', textColor: '#fff', icon: 'iheartradio' },
]

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 1,
  starter: 5,
  pro: 20,
}
