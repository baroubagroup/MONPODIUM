import { NextRequest, NextResponse } from 'next/server'
import { TrackEventPayload } from '@/types/analytics'

// In-memory ledger buffer for runtime tracking
interface ServerTrackRecord extends TrackEventPayload {
  server_timestamp: string
  ip_country?: string
  client_ip?: string
}

const SERVER_EVENTS_BUFFER: ServerTrackRecord[] = []

export async function POST(req: NextRequest) {
  try {
    const rawCountry =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-country-code') ||
      'CI' // Default Ivory Coast if local or unrouted

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    let payload: Partial<TrackEventPayload> = {}
    try {
      payload = await req.json()
    } catch {
      // fallback if sent through beacon without json body parser
    }

    const eventRecord: ServerTrackRecord = {
      artist_username: payload.artist_username || 'unknown',
      event_type: payload.event_type || 'page_view',
      page_path: payload.page_path || '/',
      track_slug: payload.track_slug || null,
      platform_id: payload.platform_id || null,
      social_platform: payload.social_platform || null,
      country_code: payload.country_code || rawCountry,
      referrer: payload.referrer || req.headers.get('referer') || undefined,
      timestamp: payload.timestamp || new Date().toISOString(),
      server_timestamp: new Date().toISOString(),
      ip_country: rawCountry,
      client_ip: clientIp,
    }

    // Keep buffer bounded
    SERVER_EVENTS_BUFFER.unshift(eventRecord)
    if (SERVER_EVENTS_BUFFER.length > 1000) {
      SERVER_EVENTS_BUFFER.length = 1000
    }

    return NextResponse.json(
      {
        success: true,
        detected_country: rawCountry,
        event: eventRecord.event_type,
        artist: eventRecord.artist_username,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Track API error:', error)
    return NextResponse.json(
      { success: false, error: 'Tracking failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const artist = url.searchParams.get('artist')

  const filtered = artist
    ? SERVER_EVENTS_BUFFER.filter(
        (e) => e.artist_username.toLowerCase() === artist.toLowerCase()
      )
    : SERVER_EVENTS_BUFFER

  return NextResponse.json({
    total_events: filtered.length,
    recent_events: filtered.slice(0, 50),
  })
}
