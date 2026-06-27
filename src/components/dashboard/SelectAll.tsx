"use client";

/** Checkbox "pilih semua" — menandai semua checkbox name="ids" dalam form yang sama. */
export function SelectAll() {
  return (
    <input
      type="checkbox"
      aria-label="Pilih semua"
      onChange={(e) => {
        const form = e.currentTarget.closest("form");
        form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((c) => {
          c.checked = e.currentTarget.checked;
        });
      }}
    />
  );
}
