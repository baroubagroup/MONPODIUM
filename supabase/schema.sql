-- ==============================================================================
-- MONPODIUM — SCHEMA SUPABASE OFFICIEL & COMPLET (PRODUCTION-READY)
-- ==============================================================================
-- Exécutez ce script dans l'Éditeur SQL de votre tableau de bord Supabase
-- (Supabase Dashboard > SQL Editor > New query > Run).
-- Il configure :
--   1. Les extensions requises (uuid-ossp, pgcrypto)
--   2. La table des Profils (Artistes Musiciens & Personnalités Publiques / Créateurs)
--   3. Le déclencheur automatique d'onboarding (auth.users -> public.profiles)
--   4. Les tables Sorties (Releases) et Liens Streaming multi-plateformes
--   5. Les tables Réseaux Sociaux & Liens Bio Ordonnables (WhatsApp Pro #1, etc.)
--   6. La table de Modération & Signalement Anti-Usurpation
--   7. La table du Suivi d'Audience temps réel (Analytics Events par Pays Vercel IP)
--   8. Les Buckets de stockage Supabase Storage (Avatars, Covers, Extraits Audio)
--   9. Toutes les politiques de sécurité RLS (Row Level Security) & Index d'optimisation
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLE PROFILES (ARTISTES MUSICIENS & PERSONNALITÉS PUBLIQUES)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  artist_name text not null default '',
  username text unique not null,
  account_type text not null default 'musician' check (account_type in ('musician', 'public_figure')),
  avatar_url text,
  banner_url text,
  banner_color text not null default 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
  bio text,
  genre text default 'Afrobeats',
  genres jsonb default '["Afrobeats", "Gospel"]'::jsonb,
  country text default 'Côte d''Ivoire',
  custom_domain text unique,
  booking_email text,
  booking_phone text,
  booking_enabled boolean not null default true,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  plan_expires_at timestamptz,
  theme_color text not null default '#10b981',
  theme_mode text not null default 'dark' check (theme_mode in ('dark', 'light')),
  is_verified boolean not null default false,
  is_flagged_impostor boolean not null default false,
  moderation_report_count integer not null default 0,
  admin_notes text default '',
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'banned')),
  pwa_enabled boolean not null default true,
  pwa_name text,
  pwa_icon_url text,
  pwa_splash_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index pour requêtes fréquentes
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_account_type on public.profiles(account_type);
create index if not exists idx_profiles_plan on public.profiles(plan);

-- RLS PROFILES
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ==============================================================================
-- 3. AUTOMATIC PROFILE CREATION TRIGGER (ON SIGNUP)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_raw_username text;
  v_base_username text;
  v_final_username text;
  v_account_type text;
  v_counter integer := 1;
begin
  -- 1. Récupération ou génération du slug / nom d'utilisateur
  v_raw_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_base_username := lower(regexp_replace(v_raw_username, '[^a-zA-Z0-9_-]', '', 'g'));
  
  if v_base_username is null or length(v_base_username) = 0 then
    v_base_username := 'profil';
  end if;

  v_final_username := v_base_username;

  -- 2. Évite tout conflit de nom d'utilisateur déjà existant
  while exists (select 1 from public.profiles where username = v_final_username) loop
    v_final_username := v_base_username || v_counter;
    v_counter := v_counter + 1;
  end loop;

  -- 3. Type de compte par défaut (musician ou public_figure)
  v_account_type := coalesce(new.raw_user_meta_data->>'account_type', 'musician');

  -- 4. Création automatique de l'espace dédié
  insert into public.profiles (
    id,
    email,
    username,
    artist_name,
    full_name,
    account_type,
    genre,
    country,
    booking_email,
    booking_enabled,
    theme_color,
    theme_mode,
    banner_color,
    plan,
    is_verified,
    account_status
  )
  values (
    new.id,
    new.email,
    v_final_username,
    coalesce(new.raw_user_meta_data->>'artist_name', new.raw_user_meta_data->>'full_name', v_final_username),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_account_type,
    coalesce(new.raw_user_meta_data->>'genre', 'Afrobeats'),
    coalesce(new.raw_user_meta_data->>'country', 'Côte d''Ivoire'),
    new.email,
    true,
    '#10b981',
    'dark',
    'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
    'free',
    false,
    'active'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Rattachement du trigger à auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 4. RELEASES (SORTIES MUSICALES : SINGLE, EP, ALBUM)
-- ==============================================================================
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  cover_url text,
  preview_audio_url text,
  preview_start_ms integer not null default 0,
  preview_end_ms integer not null default 15000,
  release_type text not null default 'single' check (release_type in ('single', 'ep', 'album')),
  release_date date default current_date,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

create index if not exists idx_releases_user_id on public.releases(user_id);
create index if not exists idx_releases_slug on public.releases(slug);
create index if not exists idx_releases_display_order on public.releases(display_order asc);

alter table public.releases enable row level security;

create policy "Published releases are viewable by everyone"
  on public.releases for select
  using (is_published = true or auth.uid() = user_id);

create policy "Users can insert their own releases"
  on public.releases for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own releases"
  on public.releases for update
  using (auth.uid() = user_id);

create policy "Users can delete their own releases"
  on public.releases for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- 5. PLATFORM LINKS (LIENS STREAMING : SPOTIFY, BOOMPLAY, YOUTUBE, APPLE, ETC.)
-- ==============================================================================
create table if not exists public.platform_links (
  id uuid primary key default gen_random_uuid(),
  release_id uuid references public.releases(id) on delete cascade not null,
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_links_release_id on public.platform_links(release_id);
create index if not exists idx_platform_links_display_order on public.platform_links(display_order asc);

alter table public.platform_links enable row level security;

create policy "Platform links are viewable by everyone"
  on public.platform_links for select
  using (true);

create policy "Users can manage platform links for their releases"
  on public.platform_links for all
  using (
    auth.uid() = (select user_id from public.releases where id = release_id)
  );

-- ==============================================================================
-- 6. SOCIAL LINKS & BIO HUBS (RÉSEAUX SOCIAUX & LIENS PERSONNALISÉS ORDONNABLES)
-- ==============================================================================
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null, -- 'whatsapp', 'instagram', 'tiktok', 'facebook', 'youtube', 'twitter', 'website', etc.
  url text not null,
  title text, -- Label personnalisé ex: "WhatsApp Pro", "Mon Site Officiel", "Boutique en ligne"
  display_order integer not null default 0, -- Permet de mettre WhatsApp Pro en #1, Site Web en #2, etc.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_social_links_user_id on public.social_links(user_id);
create index if not exists idx_social_links_order on public.social_links(user_id, display_order asc);

alter table public.social_links enable row level security;

create policy "Active social links are viewable by everyone"
  on public.social_links for select
  using (is_active = true or auth.uid() = user_id);

create policy "Users can manage their own social links"
  on public.social_links for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- 7. MODERATION & SIGNALEMENTS ANTI-USURPATION
-- ==============================================================================
create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reported_user_id uuid references public.profiles(id) on delete cascade not null,
  reported_artist_name text not null,
  reported_username text not null,
  reporter_email text not null,
  reason text not null check (reason in ('impostor', 'fake_account', 'copyright', 'scam_booking', 'other')),
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_moderation_reported_user on public.moderation_reports(reported_user_id);
create index if not exists idx_moderation_status on public.moderation_reports(status);

alter table public.moderation_reports enable row level security;

create policy "Anyone can submit a moderation report"
  on public.moderation_reports for insert
  with check (true);

create policy "Only authenticated service/admins can view reports"
  on public.moderation_reports for select
  using (auth.role() = 'service_role' or auth.uid() in (
    select id from public.profiles where username = 'admin'
  ));

-- ==============================================================================
-- 8. ANALYTICS EVENTS (TRACKING VISITES, PAYS VERCEL IP, CLICS STREAMING & RESEAUX)
-- ==============================================================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  artist_username text not null,
  event_type text not null, -- 'page_view', 'stream_click', 'social_click', 'booking_click', 'audio_preview'
  page_path text not null default '/',
  track_slug text,
  platform_id text,
  social_platform text,
  country_code text default 'CI',
  country_name text,
  referrer text,
  client_ip text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_artist_type on public.analytics_events(artist_username, event_type);
create index if not exists idx_analytics_created_at on public.analytics_events(created_at desc);

alter table public.analytics_events enable row level security;

create policy "Anyone can insert tracking events"
  on public.analytics_events for insert
  with check (true);

create policy "Artists can view their own analytics"
  on public.analytics_events for select
  using (
    artist_username in (select username from public.profiles where id = auth.uid())
  );

-- ==============================================================================
-- 9. STORAGE BUCKETS (COVERS, PREVIEWS, AVATARS)
-- ==============================================================================
insert into storage.buckets (id, name, public) 
values 
  ('covers', 'covers', true),
  ('previews', 'previews', true),
  ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Politiques de lecture publique pour les images et aperçus audio
create policy "Covers are publicly accessible" on storage.objects for select using (bucket_id = 'covers');
create policy "Previews are publicly accessible" on storage.objects for select using (bucket_id = 'previews');
create policy "Avatars are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');

-- Politiques d'écriture pour les utilisateurs connectés
create policy "Users can upload covers" on storage.objects for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');
create policy "Users can update their covers" on storage.objects for update using (bucket_id = 'covers' and auth.role() = 'authenticated');
create policy "Users can delete their covers" on storage.objects for delete using (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Users can upload previews" on storage.objects for insert with check (bucket_id = 'previews' and auth.role() = 'authenticated');
create policy "Users can update their previews" on storage.objects for update using (bucket_id = 'previews' and auth.role() = 'authenticated');
create policy "Users can delete their previews" on storage.objects for delete using (bucket_id = 'previews' and auth.role() = 'authenticated');

create policy "Users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update their avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can delete their avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');
