import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateManifest } from '@/lib/pwa'
import { INITIAL_ADMIN_USERS } from '@/lib/adminData'
import { User } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()
  let profile: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .single()
    if (data) profile = data
  } catch {}

  const adminMatch = INITIAL_ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === cleanUsername
  )

  const artist: User = profile || adminMatch || {
    id: `demo-${cleanUsername}`,
    email: `${cleanUsername}@monpodium.com`,
    full_name: cleanUsername,
    artist_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
    username: cleanUsername,
    avatar_url: null,
    banner_url: null,
    banner_color: null,
    bio: `Page officielle de ${cleanUsername}`,
    genres: ['Musique'],
    country: "Côte d'Ivoire",
    booking_email: null,
    booking_phone: null,
    booking_enabled: false,
    plan: 'free',
    plan_expires_at: null,
    theme_color: '#9333ea',
    pwa_enabled: true,
    pwa_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
    pwa_icon_url: null,
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
