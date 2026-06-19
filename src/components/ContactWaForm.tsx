"use client";

import { useState } from "react";
import { WA_PRIMARY, waLink } from "@/lib/site";

export function ContactWaForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const field = "w-full border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-ink/40";
  const labelCls = "mb-1.5 block font-mono text-xs uppercase tracking-[0.08em] text-ink-soft";

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = `Halo Akapack,${name ? ` saya ${name}.` : ""}\n\n${message || "Saya mau bertanya."}`;
    window.open(waLink(WA_PRIMARY, text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={send} className="border border-line bg-card p-6">
      <h2 className="font-display text-xl font-medium">Kirim pesan</h2>
      <p className="mt-1 text-sm text-ink-soft">Pesan kamu akan dibuka di WhatsApp untuk dikirim.</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className={labelCls} htmlFor="nama">Nama</label>
          <input id="nama" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pesan">Pesan</label>
          <textarea
            id="pesan"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={field}
            placeholder="Tulis pertanyaan atau kebutuhan kemasanmu…"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 flex w-full items-center justify-center gap-2 bg-indigo px-4 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        Kirim via WhatsApp
      </button>
    </form>
  );
}
