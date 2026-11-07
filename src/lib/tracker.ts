import { Platform, SocialPlatform } from '@/types'
import { AnalyticsEventType, TrackEventPayload } from '@/types/analytics'

const STORAGE_KEY = 'monpodium_live_events'

export function recordLiveEvent(payload: TrackEventPayload) {
  if (typeof window === 'undefined') return

  const enrichedPayload: TrackEventPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
    referrer: payload.referrer || document.referrer || undefined,
  }

  // 1. Store locally in browser ledger for immediate UI reactivity
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list: TrackEventPayload[] = raw ? JSON.parse(raw) : []
    // Keep last 500 events
    list.unshift(enrichedPayload)
    if (list.length > 500) list.length = 500
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.debug('Failed to write event to local storage', err)
  }

  // 2. Dispatch to server /api/track endpoint using beacon or fetch keepalive
  try {
    const body = JSON.stringify(enrichedPayload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/track', blob)
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch (err) {
    console.debug('Failed to send tracking event', err)
  }
}

/**
 * Record a public page view (Profile or Single Track URL)
 */
export function recordPageView(options: {
  artistUsername: string
  pagePath: string
  trackSlug?: string | null
}) {
  recordLiveEvent({
    artist_username: options.artistUsername,
    event_type: 'page_view',
    page_path: options.pagePath,
    track_slug: options.trackSlug || null,
  })
}

/**
 * Record an outbound streaming click (Spotify, Boomplay, YouTube, etc.)
 */
export function recordStreamClick(options: {
  artistUsername: string
  platformId: Platform
  trackSlug?: string | null
  pagePath?: string
}) {
  recordLiveEvent({
    artist_username: options.artistUsername,
    event_type: 'stream_click',
    page_path: options.pagePath || window.location.pathname,
    platform_id: options.platformId,
    track_slug: options.trackSlug || null,
  })
}

/**
 * Record a social media click (Facebook, Instagram, TikTok, etc.)
 */
export function recordSocialClick(options: {
  artistUsername: string
  socialPlatform: SocialPlatform
  pagePath?: string
}) {
  recordLiveEvent({
    artist_username: options.artistUsername,
    event_type: 'social_click',
    page_path: options.pagePath || window.location.pathname,
    social_platform: options.socialPlatform,
  })
}

/**
 * Record a Booking & Concert inquiry click
 */
export function recordBookingClick(options: {
  artistUsername: string
  pagePath?: string
}) {
  recordLiveEvent({
    artist_username: options.artistUsername,
    event_type: 'booking_click',
    page_path: options.pagePath || window.location.pathname,
  })
}

/**
 * Record a 15-second audio preview play
 */
export function recordAudioPreview(options: {
  artistUsername: string
  trackSlug?: string | null
  pagePath?: string
}) {
  recordLiveEvent({
    artist_username: options.artistUsername,
    event_type: 'audio_preview',
    page_path: options.pagePath || window.location.pathname,
    track_slug: options.trackSlug || null,
  })
}
