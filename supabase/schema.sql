-- ============================================================
-- Memora Bebê — Supabase Schema
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Perfis de usuário (complementa auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  plan text not null default 'free' check (plan in ('free','premium')),
  plan_expires_at timestamptz,
  credits numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bebês
create table public.babies (
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
create table public.memories (
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
create table public.memory_likes (
  memory_id uuid references public.memories(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (memory_id, user_id)
);

-- Comentários
create table public.memory_comments (
  id uuid primary key default uuid_generate_v4(),
  memory_id uuid references public.memories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Membros da família
create table public.family_members (
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
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  baby_id uuid references public.babies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_key text not null,
  xp integer not null default 0,
  unlocked_at timestamptz not null default now(),
  unique (baby_id, achievement_key)
);

-- Mensagens para o futuro
create table public.future_messages (
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
create table public.gift_cards (
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
create table public.payments (
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
create table public.notifications (
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

-- Trigger: criar perfil ao registrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

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
    select 1 from public.memory_likes where memory_id = p_memory_id and user_id = p_user_id
  ) into already_liked;

  if already_liked then
    delete from public.memory_likes where memory_id = p_memory_id and user_id = p_user_id;
    update public.memories set likes_count = likes_count - 1 where id = p_memory_id;
    return false;
  else
    insert into public.memory_likes (memory_id, user_id) values (p_memory_id, p_user_id);
    update public.memories set likes_count = likes_count + 1 where id = p_memory_id;
    return true;
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.babies enable row level security;
alter table public.memories enable row level security;
alter table public.memory_likes enable row level security;
alter table public.memory_comments enable row level security;
alter table public.family_members enable row level security;
alter table public.achievements enable row level security;
alter table public.future_messages enable row level security;
alter table public.gift_cards enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- Profiles: usuário vê e edita apenas o próprio perfil
create policy "Perfil próprio" on public.profiles for all using (auth.uid() = id);

-- Babies: apenas o dono e família
create policy "Bebê do usuário" on public.babies for all using (auth.uid() = user_id);

-- Memories: dono vê e edita; família vê
create policy "Memórias do usuário" on public.memories for all using (auth.uid() = user_id);

-- Notifications: apenas o próprio usuário
create policy "Notificações próprias" on public.notifications for all using (auth.uid() = user_id);

-- Payments: apenas o próprio usuário
create policy "Pagamentos próprios" on public.payments for all using (auth.uid() = user_id);

-- Future messages: apenas o dono
create policy "Mensagens futuras próprias" on public.future_messages for all using (auth.uid() = user_id);

-- Gift cards: apenas resgate pelo destinatário
create policy "Gift cards" on public.gift_cards for select using (true);
create policy "Gift cards redeem" on public.gift_cards for update using (auth.uid() = redeemed_by);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Execute após configurar o projeto no dashboard Supabase:
-- insert into storage.buckets (id, name, public) values ('memories', 'memories', true);
-- insert into storage.buckets (id, name, public) values ('babies', 'babies', true);
-- insert into storage.buckets (id, name, public) values ('audio', 'audio', false);
