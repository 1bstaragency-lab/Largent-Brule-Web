'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SyncResult {
  ok: boolean;
  chatsScanned: number;
  stopMatches: number;
  inserted: number;
  alreadyOptedOut: number;
}

export default function SyncOptOutsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/admin/api/inbox/sync-opt-outs', { method: 'POST' });
      const j = await res.json();
      if (j.ok) {
        setResult(j as SyncResult);
        router.refresh();
      } else {
        setError(j.error || 'failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-green-600">
          {result.inserted} added · {result.stopMatches} matches
        </span>
      )}
      {error && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-red-500">{error}</span>
      )}
      <button
        onClick={run}
        disabled={loading}
        className="text-[10px] uppercase tracking-[0.3em] border border-neutral-300 px-4 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
      >
        {loading ? 'Scanning…' : 'Sync opt-outs'}
      </button>
    </div>
  );
}
