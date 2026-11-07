-- MonPodium Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- USERS / PROFILES
-- =====================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  artist_name text not null default '',
  username text unique not null,
  avatar_url text,
  bio text,
  genre text,
  country text,
  custom_domain text unique,
  booking_email text,
  booking_phone text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  plan_expires_at timestamptz,
  theme_color text not null default '#7C3AED',
  pwa_enabled boolean not null default true,
  pwa_splash_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- =====================
-- RELEASES
-- =====================
create table public.releases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  cover_url text,
  preview_audio_url text,
  preview_start_ms integer not null default 0,
  preview_end_ms integer not null default 15000,
  release_type text not null default 'single' check (release_type in ('single', 'ep', 'album')),
  release_date date,
  is_published boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

alter table public.releases enable row level security;
create policy "Published releases viewable by everyone" on public.releases for select using (is_published = true or auth.uid() = user_id);
create policy "Users can insert their own releases" on public.releases for insert with check (auth.uid() = user_id);
create policy "Users can update their own releases" on public.releases for update using (auth.uid() = user_id);
create policy "Users can delete their own releases" on public.releases for delete using (auth.uid() = user_id);

-- =====================
-- PLATFORM LINKS
-- =====================
create table public.platform_links (
  id uuid primary key default uuid_generate_v4(),
  release_id uuid references public.releases(id) on delete cascade not null,
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.platform_links enable row level security;
create policy "Platform links viewable by everyone" on public.platform_links for select using (true);
create policy "Users can manage their platform links" on public.platform_links
  for all using (
    auth.uid() = (select user_id from public.releases where id = release_id)
  );

-- =====================
-- SOCIAL LINKS
-- =====================
create table public.social_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  url text not null,
  created_at timestamptz not null default now(),
  unique(user_id, platform)
);

alter table public.social_links enable row level security;
create policy "Social links viewable by everyone" on public.social_links for select using (true);
create policy "Users can manage their social links" on public.social_links for all using (auth.uid() = user_id);

-- =====================
-- BLOG POSTS
-- =====================
create table public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  content text not null default '',
  cover_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

alter table public.blog_posts enable row level security;
create policy "Published blog posts viewable by everyone" on public.blog_posts for select using (is_published = true or auth.uid() = user_id);
create policy "Users can manage their blog posts" on public.blog_posts for all using (auth.uid() = user_id);

-- =====================
-- STORAGE BUCKETS
-- =====================
insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
insert into storage.buckets (id, name, public) values ('previews', 'previews', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies
create policy "Covers are publicly accessible" on storage.objects for select using (bucket_id = 'covers');
create policy "Users can upload covers" on storage.objects for insert with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their covers" on storage.objects for update using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their covers" on storage.objects for delete using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Previews are publicly accessible" on storage.objects for select using (bucket_id = 'previews');
create policy "Users can upload previews" on storage.objects for insert with check (bucket_id = 'previews' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their previews" on storage.objects for update using (bucket_id = 'previews' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their previews" on storage.objects for delete using (bucket_id = 'previews' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatars are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- =====================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, artist_name, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'artist_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
