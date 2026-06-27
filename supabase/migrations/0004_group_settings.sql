-- Pengaturan kartu kategori (grup) di beranda: foto, urutan, label, tampil/sembunyi.
-- Jalankan sekali di Supabase SQL Editor (idempotent).

create table if not exists public.group_settings (
  slug text primary key,
  label text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.group_settings enable row level security;

-- Publik boleh baca (untuk render beranda).
drop policy if exists "read group_settings" on public.group_settings;
create policy "read group_settings"
  on public.group_settings for select to anon, authenticated using (true);

-- Karyawan (authenticated) boleh kelola.
drop policy if exists "write group_settings" on public.group_settings;
create policy "write group_settings"
  on public.group_settings for all to authenticated using (true) with check (true);

grant select on public.group_settings to anon;
grant select, insert, update, delete on public.group_settings to authenticated;
