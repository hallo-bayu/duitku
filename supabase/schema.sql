-- DOMI v2 Schema
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────
drop table if exists public.profiles cascade;
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  username          text,
  avatar_url        text,
  daily_budget      bigint not null default 50000,
  personality       text not null default 'balanced',
  streak_days       int not null default 0,
  total_safe_days   int not null default 0,
  total_over_days   int not null default 0,
  last_active_date  date,
  created_at        timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid() = id);

-- ── TRANSACTIONS ─────────────────────────────────────────────
drop table if exists public.transactions cascade;
create table public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      bigint not null check (amount > 0),
  category    text not null default 'lainnya',
  description text not null,
  raw_input   text not null,
  date        date not null,
  created_at  timestamptz default now()
);
create index on public.transactions(user_id, date desc);
alter table public.transactions enable row level security;
create policy "own transactions" on public.transactions for all using (auth.uid() = user_id);

-- ── DAILY SUMMARIES ──────────────────────────────────────────
drop table if exists public.daily_summaries cascade;
create table public.daily_summaries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  total_spent bigint not null default 0,
  budget      bigint not null,
  status      text not null default 'safe',
  created_at  timestamptz default now(),
  unique(user_id, date)
);
alter table public.daily_summaries enable row level security;
create policy "own summaries" on public.daily_summaries for all using (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, daily_budget, personality)
  values (new.id, new.email, 50000, 'balanced')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
