-- Beri hak tabel (GRANT) ke role authenticated untuk pesanan. DB ini membatasi
-- grant default, jadi policy RLS saja tidak cukup — perlu GRANT eksplisit.
-- Jalankan sekali di Supabase SQL Editor (idempotent).

grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
