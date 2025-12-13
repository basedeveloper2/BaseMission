create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  address text unique not null,
  handle text unique,
  name text,
  avatarUrl text,
  category text,
  isActive boolean default true,
  walletConnectedAt timestamptz,
  xp integer default 0,
  level integer default 0,
  createdAt timestamptz default now()
);

-- Ensure snake_case columns exist for server writes
alter table if exists users add column if not exists wallet_connected_at timestamptz;
alter table if exists users add column if not exists avatar_url text;
alter table if exists users add column if not exists estimated_cost text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_category_chk'
  ) then
    alter table users
      add constraint users_category_chk
      check (category is null or category in ('newcomer','builder','creator','defi'));
  end if;
end
$$;

create index if not exists users_category_idx on users (category);

create table if not exists quests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text,
  audienceCategory text,
  status text default 'active',
  rewardType text default 'xp',
  rewardValue integer default 0,
  displayOrder integer default 0,
  day integer,
  createdAt timestamptz default now()
);

create index if not exists quests_audienceCategory_idx on quests (audienceCategory);
create index if not exists quests_status_idx on quests (status);
create index if not exists quests_day_idx on quests (day);

create table if not exists participations (
  id uuid primary key default gen_random_uuid(),
  userId uuid not null references users(id) on delete cascade,
  questId uuid not null references quests(id) on delete cascade,
  status text default 'joined',
  progress integer default 0,
  joinedAt timestamptz default now(),
  unique (userId, questId)
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  userId uuid not null references users(id) on delete cascade,
  badgeId text not null,
  awardedAt timestamptz default now(),
  unique (userId, badgeId)
);

create table if not exists lottery_winners (
  id uuid primary key default gen_random_uuid(),
  week_start timestamptz not null,
  winner_id uuid not null references users(id) on delete cascade,
  drawn_at timestamptz default now(),
  unique(week_start)
);
