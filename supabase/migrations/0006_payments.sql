-- Pembayaran online (Midtrans) + jembatan pesanan web → kasir (POS).
-- Jalankan sekali di Supabase SQL Editor.

-- Kolom status pembayaran di pesanan web.
alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists paid_via text;          -- 'midtrans' | 'manual'
alter table public.orders add column if not exists payment_detail text;    -- mis. 'qris', 'bank_transfer bca'
alter table public.orders add column if not exists pos_transaction_id uuid; -- terisi bila sudah tercatat di kasir

-- Webhook pembayaran & jembatan POS berjalan dengan service_role (server only).
grant select, insert, update on public.orders to service_role;
grant select, insert on public.order_items to service_role;

-- Catat penjualan web ke tabel kasir (POS membaca tabel ini).
grant select, insert on public.transactions to service_role;
grant select, insert on public.transaction_items to service_role;

-- Dashboard karyawan perlu melihat status pembayaran (sudah punya select orders).
