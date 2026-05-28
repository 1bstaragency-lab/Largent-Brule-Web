'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Segment = 'all' | 'unwelcomed' | 'date_range';

interface Preview {
  recipientCount: number;
  sample: string[];
  completionDays: number;
  remainingToday: number;
  hasCoupon: boolean;
  exampleRendered: string;
}

export default function Composer({
  initialRemainingToday,
}: {
  initialRemainingToday: number;
}) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number | ''>(15);
  const [couponExpiresDays, setCouponExpiresDays] = useState<number | ''>(30);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Test send state
  const [testPhone, setTestPhone] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  // Debounced live preview as user edits segment / body.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch('/admin/api/campaigns/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segment,
            segment_filter:
              segment === 'date_range' ? { from: dateFrom || undefined, to: dateTo || undefined } : undefined,
            body_template: body,
          }),
        });
        const j = await res.json();
        if (j.ok) setPreview(j as Preview);
      } finally {
        setPreviewLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [segment, dateFrom, dateTo, body]);

  const charCount = body.length;
  const charWarn = charCount > 320;

  const completionDate = useMemo(() => {
    if (!preview || preview.completionDays === 0) return null;
    const d = new Date();
    d.setDate(d.getDate() + preview.completionDays);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [preview]);

  const canSubmit =
    name.trim().length > 0 &&
    body.trim().length > 0 &&
    !submitting &&
    (preview?.recipientCount ?? 0) > 0;

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/admin/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          body_template: body,
          segment,
          segment_filter:
            segment === 'date_range' ? { from: dateFrom || undefined, to: dateTo || undefined } : undefined,
          coupon_discount_pct: preview?.hasCoupon ? (couponDiscount === '' ? null : couponDiscount) : null,
          coupon_expires_days: preview?.hasCoupon ? (couponExpiresDays === '' ? null : couponExpiresDays) : null,
        }),
      });
      const j = await res.json();
      if (!j.ok) {
        setError(j.error || 'failed');
        setSubmitting(false);
        return;
      }
      router.push(`/admin/campaigns/${j.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
      setSubmitting(false);
    }
  };

  const sendTest = async () => {
    if (!testPhone.trim() || !body.trim()) return;
    setTestStatus('sending');
    setTestError('');
    try {
      const res = await fetch('/admin/api/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, body_template: body }),
      });
      const j = await res.json();
      if (j.ok) {
        setTestStatus('sent');
        setTimeout(() => setTestStatus('idle'), 4000);
      } else {
        setTestError(j.error || `HTTP error`);
        setTestStatus('error');
      }
    } catch (e) {
      setTestError(e instanceof Error ? e.message : 'unknown');
      setTestStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
          New campaign
        </p>
        <h1 className="text-3xl font-light">Compose</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT — form */}
        <div className="md:col-span-2 space-y-6">
          {/* Name */}
          <Field label="Campaign name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S/S 26 Lookbook reveal"
              className="w-full border border-neutral-300 rounded-sm px-4 py-3 text-[13px] bg-white outline-none focus:border-neutral-500"
            />
          </Field>

          {/* Body */}
          <Field
            label="Message body"
            hint={
              <span>
                Use <code className="bg-neutral-100 px-1">{`{{coupon_code}}`}</code> to insert a
                unique code per recipient (Session 3 will mint codes).
              </span>
            }
          >
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`hey — the S/S 26 lookbook just dropped.\nfirst look here: largentbrule.com/lookbook\n\nuse {{coupon_code}} for 15% off your first piece.\n\n— L'B`}
              rows={10}
              className="w-full border border-neutral-300 rounded-sm px-4 py-3 text-[13px] bg-white outline-none focus:border-neutral-500 font-mono leading-relaxed resize-y"
            />
            <div className="flex justify-between mt-2">
              <span className={`text-[10px] tracking-wide ${charWarn ? 'text-amber-600' : 'text-neutral-400'}`}>
                {charCount} chars {charWarn ? '· may split across multiple SMS' : ''}
              </span>
              {preview?.hasCoupon && (
                <span className="text-[10px] tracking-wide text-blue-600">
                  ✓ contains {`{{coupon_code}}`}
                </span>
              )}
            </div>
          </Field>

          {/* Segment */}
          <Field label="Audience segment">
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'unwelcomed', 'date_range'] as Segment[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSegment(s)}
                  className={`text-[10px] uppercase tracking-[0.3em] py-3 border transition-colors ${
                    segment === s
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            {segment === 'date_range' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 block">
                    Joined from
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-[12px] bg-white outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 block">
                    Joined to
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-[12px] bg-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>
            )}
          </Field>

          {/* Coupon config — only when template has {{coupon_code}} */}
          {preview?.hasCoupon && (
            <Field
              label="Coupon config"
              hint="One unique code will be minted per recipient (format LB-VIP-XXXXXX) and bound to their phone."
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 block">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={couponDiscount}
                    onChange={(e) =>
                      setCouponDiscount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="15"
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-[12px] bg-white outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 block">
                    Expires in (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={couponExpiresDays}
                    onChange={(e) =>
                      setCouponExpiresDays(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="30"
                    className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-[12px] bg-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>
            </Field>
          )}

          {/* Test send */}
          <Field
            label="Test send"
            hint="Send the rendered message to one phone right now (counts toward today's 15-cap)."
          >
            <div className="flex gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="flex-1 border border-neutral-300 rounded-sm px-3 py-2 text-[12px] bg-white outline-none focus:border-neutral-500"
              />
              <button
                type="button"
                onClick={sendTest}
                disabled={testStatus === 'sending' || !body.trim() || !testPhone.trim()}
                className="text-[10px] uppercase tracking-[0.3em] border border-neutral-300 px-4 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
              >
                {testStatus === 'sending' ? '…' : testStatus === 'sent' ? 'Sent ✓' : 'Send test'}
              </button>
            </div>
            {testStatus === 'error' && (
              <p className="text-[10px] text-red-500 mt-2 tracking-wide">{testError}</p>
            )}
          </Field>
        </div>

        {/* RIGHT — preview / stats */}
        <aside className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-sm p-5">
            <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
              Preview
            </p>
            <p className="text-3xl font-light">
              {previewLoading ? '…' : preview?.recipientCount ?? 0}
            </p>
            <p className="text-[10px] text-neutral-500 mt-1 tracking-wide">recipients</p>
            {preview && preview.sample.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-2">
                  Sample
                </p>
                {preview.sample.map((s) => (
                  <p key={s} className="font-mono text-[11px] text-neutral-600">
                    {s}
                  </p>
                ))}
                {preview.recipientCount > preview.sample.length && (
                  <p className="text-[10px] text-neutral-400 mt-1">
                    + {preview.recipientCount - preview.sample.length} more
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-neutral-200 rounded-sm p-5">
            <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
              Throughput
            </p>
            <p className="text-[12px] text-neutral-700 leading-relaxed">
              {preview?.remainingToday ?? initialRemainingToday} / 15 sends left today.
            </p>
            {preview && preview.completionDays > 0 && (
              <p className="text-[12px] text-neutral-700 leading-relaxed mt-2">
                Full send takes <strong>~{preview.completionDays}</strong> day
                {preview.completionDays === 1 ? '' : 's'}.
              </p>
            )}
            {completionDate && (
              <p className="text-[11px] text-neutral-500 mt-1">Done by {completionDate}.</p>
            )}
          </div>

          {body && (
            <div className="bg-white border border-neutral-200 rounded-sm p-5">
              <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
                Rendered preview
              </p>
              <pre className="whitespace-pre-wrap text-[12px] text-black leading-relaxed font-sans">
                {preview?.exampleRendered || body}
              </pre>
            </div>
          )}
        </aside>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <Link
          href="/admin/campaigns"
          className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-black transition-colors"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-4">
          {error && <span className="text-[10px] text-red-500 tracking-wide">{error}</span>}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!canSubmit}
            className="text-[11px] uppercase tracking-[0.4em] bg-black text-white px-8 py-3 hover:bg-[#111] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Queue campaign
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmOpen && preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
          <div className="bg-white max-w-md w-full p-8 rounded-sm">
            <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-400 mb-3">
              Confirm
            </p>
            <h2 className="text-2xl font-light mb-4">Queue {preview.recipientCount} sends?</h2>
            <p className="text-[12px] text-neutral-600 leading-relaxed mb-6">
              This drips out at 15/day across welcomes + campaigns. Completes by{' '}
              <strong>{completionDate}</strong>. You can cancel anytime — pending rows skip.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 px-4 py-2 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  submit();
                }}
                disabled={submitting}
                className="text-[10px] uppercase tracking-[0.3em] bg-black text-white px-6 py-2 hover:bg-[#111] transition-colors disabled:opacity-40"
              >
                {submitting ? '…' : 'Queue it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 mb-2 block">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
