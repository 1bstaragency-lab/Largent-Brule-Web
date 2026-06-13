"use client";

import { useState } from "react";

interface GroupItem {
  num: number;
  label: string;
  size: number;
  welcomed: number;
  pending: number;
}

interface GroupSendResult {
  ok: boolean;
  queued?: number;
  already_welcomed?: number;
  opted_out?: number;
  rate_limited?: number;
  invalid_phone?: number;
  failures?: Array<{ phone: string; status: number; error: string }>;
  error?: string;
}

interface OneSendResult {
  ok: boolean;
  queued?: boolean;
  already_welcomed?: boolean;
  message_id?: string;
  error?: string;
  status?: number;
}

export function WelcomePanel({
  welcomeBody,
  groups,
}: {
  welcomeBody: string;
  groups: GroupItem[];
}) {
  const [sendingGroup, setSendingGroup] = useState<number | null>(null);
  const [groupResults, setGroupResults] = useState<Record<number, GroupSendResult>>({});

  const [phone, setPhone] = useState("");
  const [oneBusy, setOneBusy] = useState(false);
  const [oneResult, setOneResult] = useState<OneSendResult | null>(null);

  const sendToGroup = async (cohort: number, label: string, pending: number) => {
    if (!confirm(
      `Send welcome to all ${pending} pending in ${label}? Uses up to ${pending} of the 15/day Blooio quota.`
    )) return;
    setSendingGroup(cohort);
    try {
      const r = await fetch("/api/admin/welcome/send-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohort }),
      });
      const j: GroupSendResult = await r.json();
      setGroupResults((p) => ({ ...p, [cohort]: j }));
      if (j.ok && (j.queued || 0) > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setGroupResults((p) => ({ ...p, [cohort]: { ok: false, error: "Network error" } }));
    } finally {
      setSendingGroup(null);
    }
  };

  const sendOne = async () => {
    setOneResult(null);
    setOneBusy(true);
    try {
      const r = await fetch("/api/admin/welcome/send-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j: OneSendResult = await r.json();
      setOneResult(j);
      if (j.ok && j.queued) {
        setPhone("");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch {
      setOneResult({ ok: false, error: "Network error" });
    } finally {
      setOneBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome body — read-only, shown for transparency */}
      <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-neutral-500">
          The Welcome Message
        </p>
        <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap bg-neutral-50 p-4 border border-neutral-100">
          {welcomeBody}
        </pre>
        <p className="text-[10px] text-neutral-400">
          Same text used by the auto-welcome scheduled task. Edit{" "}
          <code className="font-mono text-[10px]">src/lib/welcome.ts</code> to
          change it everywhere at once.
        </p>
      </div>

      {/* Single-phone send */}
      <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-neutral-500">
          Send to one phone
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567 or +15551234567"
            className="flex-1 min-w-[200px] h-[40px] border border-neutral-200 px-3 text-[13px] outline-none focus:border-black transition-colors"
          />
          <button
            onClick={sendOne}
            disabled={oneBusy || !phone}
            className="px-5 h-[40px] bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {oneBusy ? "Sending…" : "Send Welcome"}
          </button>
        </div>
        {oneResult && (
          <p className={`text-[11px] tracking-wide ${oneResult.ok ? "text-green-700" : "text-red-600"}`}>
            {oneResult.ok && oneResult.queued && "✓ Queued — message will arrive within a minute."}
            {oneResult.ok && oneResult.already_welcomed && "Already welcomed — no SMS sent."}
            {!oneResult.ok && (oneResult.error === "opted_out" ? "This number opted out — skipped." : `Error: ${oneResult.error}${oneResult.status ? ` (${oneResult.status})` : ""}`)}
          </p>
        )}
      </div>

      {/* Per-group send */}
      <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-neutral-500">
          Send to group (15/day Blooio cap)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {groups.map((g) => {
            const fullyWelcomed = g.pending === 0;
            const inFlight = sendingGroup === g.num;
            const result = groupResults[g.num];
            return (
              <div
                key={g.num}
                className={`border p-3 ${
                  fullyWelcomed
                    ? "bg-green-50 border-green-300"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {g.label}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] opacity-60">
                    {g.welcomed}/{g.size}
                  </span>
                </div>
                <button
                  onClick={() => sendToGroup(g.num, g.label, g.pending)}
                  disabled={inFlight || fullyWelcomed}
                  className={`mt-2 w-full h-9 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${
                    fullyWelcomed
                      ? "bg-green-200 text-green-800 cursor-default"
                      : "bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                  }`}
                >
                  {fullyWelcomed
                    ? "✓ All welcomed"
                    : inFlight
                    ? "Sending…"
                    : `Send ${g.pending} pending`}
                </button>
                {result && (
                  <p className="mt-2 text-[9px] uppercase tracking-[0.2em] leading-relaxed">
                    {result.ok ? (
                      <>
                        <span className="text-green-700">queued: {result.queued || 0}</span>
                        {(result.already_welcomed || 0) > 0 && (
                          <> · skipped: {result.already_welcomed}</>
                        )}
                        {(result.rate_limited || 0) > 0 && (
                          <span className="text-amber-700"> · daily cap hit</span>
                        )}
                        {(result.failures?.length || 0) > 0 && (
                          <span className="text-red-700"> · failed: {result.failures!.length}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-700">error: {result.error}</span>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
