-- Pesanan dari website publik (Akapack). Jalankan sekali di Supabase SQL Editor.
-- Aman dijalankan ulang (idempotent).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default '00000000-0000-0000-0000-000000000001',
  order_number text not null unique,
  outlet_id uuid not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  fulfillment text not null default 'pickup',     -- 'pickup' | 'delivery'
  payment_method text not null default 'transfer', -- 'transfer' | 'cod'
  note text,
  subtotal bigint not null default 0,
  status text not null default 'pending',          -- pending | confirmed | done | cancelled
  channel text not null default 'web',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null,
  name text not null,
  sku text,
  unit text,
  unit_price bigint not null,
  qty integer not null,
  line_total bigint not null
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Publik (anon) HANYA boleh membuat pesanan, tidak boleh membaca/ubah/hapus.
-- POS (service_role / authenticated) tetap punya akses penuh karena melewati RLS
-- atau lewat policy-nya sendiri.
drop policy if exists "anon insert orders" on public.orders;
create policy "anon insert orders"
  on public.orders for insert to anon
  with check (true);

drop policy if exists "anon insert order_items" on public.order_items;
create policy "anon insert order_items"
  on public.order_items for insert to anon
  with check (true);
