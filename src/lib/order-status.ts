export const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Baru", cls: "border-amber-300 bg-amber-50 text-amber-800" },
  confirmed: { label: "Diproses", cls: "border-blue-300 bg-blue-50 text-blue-800" },
  done: { label: "Selesai", cls: "border-green-300 bg-green-50 text-green-800" },
  cancelled: { label: "Dibatalkan", cls: "border-red-300 bg-red-50 text-red-700" },
};

export function orderStatus(s: string) {
  return ORDER_STATUS[s] ?? { label: s, cls: "border-line bg-card text-ink-soft" };
}
