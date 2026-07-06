-- ══════════════════════════════════════════════════════
-- PARCEIROS — Banners e Produtos
-- Rodar no Supabase SQL Editor (Dashboard → SQL Editor)
-- ══════════════════════════════════════════════════════

create table if not exists partner_banners (
  id           uuid        default gen_random_uuid() primary key,
  partner_name text        not null,
  image_url    text        not null,
  link_url     text        not null,
  is_active    boolean     default true,
  sort_order   int         default 0,
  created_at   timestamptz default now()
);

create table if not exists partner_products (
  id             uuid        default gen_random_uuid() primary key,
  partner_name   text        not null,
  title          text        not null,
  description    text,
  price          numeric(10,2) not null,
  original_price numeric(10,2),
  image_url      text        not null,
  affiliate_url  text        not null,
  category       text        default 'Outros',
  is_active      boolean     default true,
  is_featured    boolean     default false,
  sort_order     int         default 0,
  created_at     timestamptz default now()
);

-- RLS
alter table partner_banners  enable row level security;
alter table partner_products enable row level security;

-- Leitura pública
create policy "public read banners"  on partner_banners  for select using (true);
create policy "public read products" on partner_products for select using (true);

-- Admin: apenas o e-mail do administrador pode escrever
create policy "admin all banners"  on partner_banners  for all using (auth.email() = 'marcelomord@gmail.com');
create policy "admin all products" on partner_products for all using (auth.email() = 'marcelomord@gmail.com');
