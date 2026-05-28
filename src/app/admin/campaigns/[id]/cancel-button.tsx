'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await fetch(`/admin/api/campaigns/${campaignId}/cancel`, { method: 'POST' });
      router.refresh();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] uppercase tracking-[0.3em] border border-red-300 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors"
      >
        Cancel campaign
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white max-w-md w-full p-8 rounded-sm">
            <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 mb-3">Confirm</p>
            <h2 className="text-2xl font-light mb-4">Cancel campaign?</h2>
            <p className="text-[12px] text-neutral-600 leading-relaxed mb-6">
              All pending recipients will be skipped. Already-sent messages stay sent. This
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 px-4 py-2 hover:text-black transition-colors"
              >
                Keep going
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                className="text-[10px] uppercase tracking-[0.3em] bg-red-500 text-white px-6 py-2 hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                {loading ? '…' : 'Cancel it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
