import { Platform, SocialPlatform } from './index'

export type AnalyticsTimeRange = 'today' | 'yesterday' | '7d' | '30d' | 'all'

export type AnalyticsEventType = 'page_view' | 'stream_click' | 'social_click' | 'booking_click' | 'audio_preview' | 'pwa_install_click'

export interface TrackEventPayload {
  artist_username: string
  event_type: AnalyticsEventType
  page_path: string
  track_slug?: string | null
  platform_id?: Platform | null
  social_platform?: SocialPlatform | null
  country_code?: string
  country_name?: string
  referrer?: string
  timestamp?: string
}

export interface TrackStatsSummary {
  track_title: string
  track_slug: string
  release_type: string
  cover_url: string | null
  page_views: number
  audio_previews: number
  streaming_clicks: number
  conversion_rate: string
  top_platform: string
}

export interface PlatformClicksBreakdown {
  platform: Platform | 'other'
  name: string
  clicks: number
  percentage: number
  bgColor: string
  textColor: string
}

export interface SocialClicksBreakdown {
  platform: SocialPlatform | 'booking'
  name: string
  clicks: number
  percentage: number
  iconName: string
}

export interface CountryVisitsBreakdown {
  code: string
  name: string
  flag: string
  visits: number
  percentage: number
  growthRate: string
}

export interface ArtistDetailedAnalytics {
  artist_username: string
  artist_name: string
  time_range: AnalyticsTimeRange
  total_page_views: number
  unique_visitors: number
  total_streaming_clicks: number
  total_social_clicks: number
  total_booking_clicks: number
  total_audio_previews: number
  global_conversion_rate: string
  tracks_performance: TrackStatsSummary[]
  streaming_breakdown: PlatformClicksBreakdown[]
  social_breakdown: SocialClicksBreakdown[]
  country_breakdown: CountryVisitsBreakdown[]
}
