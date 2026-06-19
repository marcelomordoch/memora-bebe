-- ============================================================
-- Memora Bebê — Supabase Schema
-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Seguro para re-executar: usa IF NOT EXISTS em todo lugar.
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Perfis de usuário (complementa auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  plan text not null default 'free' check (plan in ('free','premium')),
  plan_expires_at timestamptz,
  credits numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bebês
create table if not exists public.babies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  gender text not null check (gender in ('menino','menina','surpresa')),
  status text not null check (status in ('gestacao','nascido')),
  birth_date date,
  due_date date,
  week integer check (week between 1 and 42),
  about text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Memórias
create table if not exists public.memories (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid references public.babies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('foto','video','audio','historia')),
  title text not null,
  body text not null default '',
  media_url text,
  week integer,
  life_stage text not null check (life_stage in ('gestacao','0-1','1-3','escola')),
  emoji text,
  bg_color text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Curtidas
create table if not exists public.memory_likes (
  memory_id uuid references public.memories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, user_id)
);

-- Comentários
create table if not exists public.memory_comments (
  id uuid primary key default uuid_generate_v4(),
  memory_id uuid references public.memories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Membros da família
create table if not exists public.family_members (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid references public.babies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  invited_email text not null,
  name text not null,
  role text not null default 'other' check (role in ('parent','grandparent','other')),
  status text not null default 'pending' check (status in ('pending','accepted')),
  invite_token text unique,
  created_at timestamptz not null default now()
);

-- Conquistas
create table if not exists public.achievements (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid references public.babies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_key text not null,
  xp integer not null default 0,
  unlocked_at timestamptz not null default now(),
  unique (baby_id, achievement_key)
);

-- Mensagens para o futuro
create table if not exists public.future_messages (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid references public.babies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  open_at_age integer not null check (open_at_age > 0),
  audio_url text,
  created_at timestamptz not null default now()
);

-- Gift Cards
create table if not exists public.gift_cards (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  amount numeric(10,2) not null,
  sender_name text not null,
  sender_email text,
  recipient_email text,
  message text,
  redeemed boolean not null default false,
  redeemed_by uuid references public.profiles(id),
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Pagamentos
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  mp_payment_id text,
  type text not null check (type in ('upgrade','giftcard')),
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notificações
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('memory','milestone','family','offer','system')),
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUNÇÕES & TRIGGERS
-- ============================================================

-- Função: criar perfil ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: dispara a função acima ao criar usuário
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Função: curtir/descurtir memória
create or replace function public.toggle_memory_like(p_memory_id uuid, p_user_id uuid)
returns boolean as $$
declare
  already_liked boolean;
begin
  select exists(
    select 1 from public.memory_likes
    where memory_id = p_memory_id and user_id = p_user_id
  ) into already_liked;

  if already_liked then
    delete from public.memory_likes
    where memory_id = p_memory_id and user_id = p_user_id;
    update public.memories set likes_count = greatest(0, likes_count - 1)
    where id = p_memory_id;
    return false;
  else
    insert into public.memory_likes (memory_id, user_id)
    values (p_memory_id, p_user_id)
    on conflict do nothing;
    update public.memories set likes_count = likes_count + 1
    where id = p_memory_id;
    return true;
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.babies         enable row level security;
alter table public.memories       enable row level security;
alter table public.memory_likes   enable row level security;
alter table public.memory_comments enable row level security;
alter table public.family_members enable row level security;
alter table public.achievements   enable row level security;
alter table public.future_messages enable row level security;
alter table public.gift_cards     enable row level security;
alter table public.payments       enable row level security;
alter table public.notifications  enable row level security;

-- Profiles
drop policy if exists "Perfil próprio" on public.profiles;
create policy "Perfil próprio" on public.profiles
  for all using (auth.uid() = id);

-- Babies
drop policy if exists "Bebê do usuário" on public.babies;
create policy "Bebê do usuário" on public.babies
  for all using (auth.uid() = user_id);

-- Memories: dono faz tudo; família pode ler
drop policy if exists "Memórias do usuário" on public.memories;
create policy "Memórias do usuário" on public.memories
  for all using (auth.uid() = user_id);

-- Memory likes
drop policy if exists "Curtidas" on public.memory_likes;
create policy "Curtidas" on public.memory_likes
  for all using (auth.uid() = user_id);

-- Memory comments
drop policy if exists "Comentários" on public.memory_comments;
create policy "Comentários" on public.memory_comments
  for all using (auth.uid() = user_id);

-- Family members
drop policy if exists "Família" on public.family_members;
create policy "Família" on public.family_members
  for all using (
    auth.uid() = user_id or
    exists (
      select 1 from public.babies b
      where b.id = baby_id and b.user_id = auth.uid()
    )
  );

-- Achievements
drop policy if exists "Conquistas próprias" on public.achievements;
create policy "Conquistas próprias" on public.achievements
  for all using (auth.uid() = user_id);

-- Future messages
drop policy if exists "Mensagens futuras próprias" on public.future_messages;
create policy "Mensagens futuras próprias" on public.future_messages
  for all using (auth.uid() = user_id);

-- Gift cards
drop policy if exists "Gift cards leitura" on public.gift_cards;
create policy "Gift cards leitura" on public.gift_cards
  for select using (true);

drop policy if exists "Gift cards resgate" on public.gift_cards;
create policy "Gift cards resgate" on public.gift_cards
  for update using (
    redeemed = false and
    (recipient_email is null or recipient_email = (
      select email from auth.users where id = auth.uid()
    ))
  );

-- Payments
drop policy if exists "Pagamentos próprios" on public.payments;
create policy "Pagamentos próprios" on public.payments
  for all using (auth.uid() = user_id);

-- Notifications
drop policy if exists "Notificações próprias" on public.notifications;
create policy "Notificações próprias" on public.notifications
  for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- (execute separadamente após criar os buckets no dashboard)
-- ============================================================
-- No dashboard: Storage → New bucket → preencha nome e marque Public se necessário.
--
-- Buckets necessários:
--   memories  (public)
--   babies    (public)
--   audio     (private)
--
-- Policies de storage (execute depois de criar os buckets):
-- ------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('memories', 'memories', true)
-- on conflict (id) do nothing;
--
-- insert into storage.buckets (id, name, public)
-- values ('babies', 'babies', true)
-- on conflict (id) do nothing;
--
-- insert into storage.buckets (id, name, public)
-- values ('audio', 'audio', false)
-- on conflict (id) do nothing;
