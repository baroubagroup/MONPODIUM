import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateManifest } from '@/lib/pwa'
import { User } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch artist profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  // Fallback default artist user if in demo mode or not found
  const artist: User = profile || {
    id: 'demo',
    email: `${username}@monpodium.com`,
    full_name: username,
    artist_name: username.charAt(0).toUpperCase() + username.slice(1),
    username: username,
    avatar_url: null,
    bio: `Page officielle de ${username}`,
    genre: 'Musique',
    country: 'International',
    custom_domain: null,
    booking_email: null,
    booking_phone: null,
    plan: 'free',
    plan_expires_at: null,
    theme_color: '#9333ea',
    pwa_enabled: true,
    pwa_splash_url: null,
    created_at: new Date().toISOString(),
  }

  const manifest = generateManifest(artist)

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
