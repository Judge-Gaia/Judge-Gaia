create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  username text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rankings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  score integer not null default 0,
  season text not null default 'global',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, season)
);

create index if not exists rankings_season_score_idx
  on rankings (season, score desc);

create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_achievements (
  user_id uuid not null references users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
