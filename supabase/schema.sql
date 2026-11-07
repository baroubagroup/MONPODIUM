-- ==============================================================================
-- MONPODIUM — SCHEMA SUPABASE OFFICIEL & COMPLET (PRODUCTION-READY)
-- ==============================================================================
-- Exécutez ce script dans l'Éditeur SQL de votre tableau de bord Supabase
-- (Supabase Dashboard > SQL Editor > New query > Run).
-- Il configure :
--   1. Les extensions requises (uuid, pgcrypto)
--   2. La table des Profils Artistes avec tous les champs (thèmes, PWA, vérification, booking)
--   3. Le déclencheur (Trigger) automatique à l'inscription auth.users -> public.profiles
--   4. Les tables Sorties (Releases), Liens Streaming, Liens Réseaux Sociaux & Blog
--   5. La table du Suivi d'Audience en temps réel (Analytics Events par Pays et Plateforme)
--   6. Les Buckets de stockage (Avatars, Covers, Extraits Audio) avec permissions publiques
--   7. Toutes les politiques de sécurité RLS (Row Level Security)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. TABLE PROFILES (ARTISTES & UTILISATEURS)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  artist_name text not null default '',
  username text unique not null,
  avatar_url text,
  banner_url text,
  banner_color text not null default 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #1e1b4b 100%)',
  bio text,
  genre text default 'Afrobeats',
  genres jsonb default '["Afrobeats", "Gospel"]'::jsonb,
  country text default 'Côte d''Ivoire',
  custom_domain text unique,
  booking_email text,
  booking_phone text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  plan_expires_at timestamptz,
  theme_color text not null default '#9333ea',
  theme_mode text not null default 'dark' check (theme_mode in ('dark', 'light')),
  is_verified boolean not null default false,
  is_flagged_impostor boolean not null default false,
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'banned')),
  pwa_enabled boolean not null default true,
  pwa_name text,
  pwa_icon_url text,
  pwa_splash_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  v_counter integer := 1;
begin
  -- 1. Récupération ou génération du slug / nom d'utilisateur
  v_raw_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  v_base_username := lower(regexp_replace(v_raw_username, '[^a-zA-Z0-9_-]', '', 'g'));
  
  if v_base_username is null or length(v_base_username) = 0 then
    v_base_username := 'artiste';
  end if;

  v_final_username := v_base_username;

  -- 2. Évite tout conflit de nom d'utilisateur déjà existant
  while exists (select 1 from public.profiles where username = v_final_username) loop
    v_final_username := v_base_username || v_counter;
    v_counter := v_counter + 1;
  end loop;

  -- 3. Création automatique de l'espace artiste dédié
  insert into public.profiles (
    id,
    email,
    username,
    artist_name,
    full_name,
    genre,
    country,
    booking_email,
    theme_color,
    theme_mode,
    plan,
    is_verified,
    account_status
  )
  values (
    new.id,
    new.email,
    v_final_username,
    coalesce(new.raw_user_meta_data->>'artist_name', v_final_username),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'genre', 'Afrobeats'),
    coalesce(new.raw_user_meta_data->>'country', 'Côte d''Ivoire'),
    new.email,
    '#9333ea',
    'dark',
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
-- 5. PLATFORM LINKS (LIENS STREAMING : SPOTIFY, BOOMPLAY, YOUTUBE, APPLE, DEEZER)
-- ==============================================================================
create table if not exists public.platform_links (
  id uuid primary key default gen_random_uuid(),
  release_id uuid references public.releases(id) on delete cascade not null,
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

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
-- 6. SOCIAL LINKS (RÉSEAUX SOCIAUX CERTIFIÉS ANTI-USURPATION)
-- ==============================================================================
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  url text not null,
  created_at timestamptz not null default now(),
  unique(user_id, platform)
);

alter table public.social_links enable row level security;

create policy "Social links are viewable by everyone"
  on public.social_links for select
  using (true);

create policy "Users can manage their own social links"
  on public.social_links for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- 7. ANALYTICS EVENTS (TRACKING VISITES, PAYS VERCEL IP, CLICS STREAMING & RESEAUX)
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
-- 8. STORAGE BUCKETS (COVERS, PREVIEWS, AVATARS)
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
