/**
 * Daftar email karyawan yang boleh mengakses /dashboard. Diisi lewat env
 * `STAFF_EMAILS` (dipisah koma). Fail-closed: jika kosong, TIDAK ada yang
 * dianggap staf (dashboard tertutup) — supaya pembeli yang register tidak
 * bisa masuk dashboard.
 */
export function staffEmails(): string[] {
  return (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isStaff(email?: string | null): boolean {
  if (!email) return false;
  return staffEmails().includes(email.toLowerCase());
}
