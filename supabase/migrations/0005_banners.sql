-- Banner/poster hero beranda (geser + auto-scroll). Jalankan sekali di Supabase SQL Editor.
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;

drop policy if exists "read banners" on public.banners;
create policy "read banners" on public.banners for select to anon, authenticated using (true);

drop policy if exists "write banners" on public.banners;
create policy "write banners" on public.banners for all to authenticated using (true) with check (true);

grant select on public.banners to anon;
grant select, insert, update, delete on public.banners to authenticated;
