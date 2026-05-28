'use client';

import { useState } from 'react';

export function AdminLogin() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(false);
    const res = await fetch('/admin/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setErr(true);
      setPw('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-6 font-sans">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="text-[8px] text-neutral-400 uppercase tracking-[0.6em] text-center mb-3">
          L&apos;Argent Brûlé
        </p>
        <h1 className="text-[11px] uppercase tracking-[0.5em] font-medium text-center mb-10">
          Admin
        </h1>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="PASSWORD"
          className={`w-full border rounded-sm px-4 py-3 text-[11px] tracking-[0.3em] uppercase bg-white outline-none placeholder:text-neutral-400 ${
            err ? 'border-red-400 text-red-400' : 'border-neutral-300 focus:border-neutral-500'
          }`}
        />
        {err && (
          <p className="text-[9px] text-red-400 tracking-[0.15em] uppercase mt-2 text-center">
            Incorrect password
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !pw}
          className="w-full mt-4 py-3 bg-black hover:bg-[#111] text-white text-[11px] tracking-[0.4em] uppercase font-medium rounded-sm transition-colors disabled:opacity-40"
        >
          {loading ? '…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
