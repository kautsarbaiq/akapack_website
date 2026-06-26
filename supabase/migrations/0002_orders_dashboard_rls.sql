-- Akses dashboard karyawan ke pesanan web. Jalankan sekali di Supabase SQL Editor.
-- Aman dijalankan ulang (idempotent).

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Karyawan login (authenticated) boleh MEMBACA & MENGUBAH STATUS pesanan.
drop policy if exists "authenticated read orders" on public.orders;
create policy "authenticated read orders"
  on public.orders for select to authenticated using (true);

drop policy if exists "authenticated update orders" on public.orders;
create policy "authenticated update orders"
  on public.orders for update to authenticated using (true) with check (true);

drop policy if exists "authenticated read order_items" on public.order_items;
create policy "authenticated read order_items"
  on public.order_items for select to authenticated using (true);
