"use client";

// Admin control panel for the early-access SMS:
//   - editable body + optional preview image URL
//   - per-group "Send to this group" button that fires the blast
//
// Lives above the subscribers table.

import { useEffect, useState } from "react";

interface GroupItem {
  num: number;
  label: string;
  size: number;
  sent: number;
}

interface SendResult {
  ok: boolean;
  cohort?: number;
  queued?: number;
  already_sent?: number;
  opted_out?: number;
  invalid_phone?: number;
  rate_limited?: number;
  failures?: Array<{ phone: string; status: number; error: string }>;
  error?: string;
}

export function EarlyAccessPanel({ groups }: { groups: GroupItem[] }) {
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sendingGroup, setSendingGroup] = useState<number | null>(null);
  const [resultByGroup, setResultByGroup] = useState<Record<number, SendResult>>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/early-access/message");
        const j = await r.json();
        if (j.ok) {
          setBody(j.body || "");
          setImageUrl(j.image_url || "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const r = await fetch("/api/admin/early-access/message", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, image_url: imageUrl }),
      });
      const j = await r.json();
      setFeedback(j.ok ? "Saved" : `Error: ${j.error}`);
      setTimeout(() => setFeedback(null), 2500);
    } catch {
      setFeedback("Network error");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/admin/early-access/upload-image", {
        method: "POST",
        body: form,
      });
      const j = await r.json();
      if (!j.ok) {
        setUploadError(j.error || "Upload failed");
        return;
      }
      setImageUrl(j.url);
      // Persist the new URL right away so a refresh keeps it.
      await fetch("/api/admin/early-access/message", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: j.url }),
      });
    } catch {
      setUploadError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = async () => {
    setImageUrl("");
    await fetch("/api/admin/early-access/message", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: "" }),
    });
  };

  const sendToGroup = async (cohort: number) => {
    if (!confirm(
      `Send the early-access SMS to Group ${cohort}? This may use up to 15 of your Blooio daily quota.`
    )) return;
    setSendingGroup(cohort);
    try {
      const r = await fetch("/api/admin/early-access/send-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohort }),
      });
      const j: SendResult = await r.json();
      setResultByGroup((prev) => ({ ...prev, [cohort]: j }));
      // Hard refresh the page-level stats after a successful send.
      if (j.ok && (j.queued || 0) > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setResultByGroup((prev) => ({
        ...prev,
        [cohort]: { ok: false, error: "Network error" },
      }));
    } finally {
      setSendingGroup(null);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-neutral-500 mb-1">
            Early Access SMS
          </p>
          <p className="text-[10px] text-neutral-500 tracking-wide">
            The message + optional preview image sent to each group when you click Send.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="text-[10px] uppercase tracking-[0.3em] border border-neutral-300 px-4 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 block mb-2">
            Message body
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full border border-neutral-200 p-3 text-[12px] font-mono leading-relaxed outline-none focus:border-black transition-colors resize-none"
            placeholder="early access — open.&#10;your private link…"
          />
          <span className="text-[9px] uppercase tracking-[0.25em] opacity-50 mt-1 inline-block">
            {body.length} chars
          </span>
        </label>

        <div className="space-y-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 block">
            Preview image (optional)
          </span>

          {/* Drop / pick zone */}
          <label
            className={`block border-2 border-dashed cursor-pointer transition-colors ${
              uploading
                ? "border-neutral-300 bg-neutral-50"
                : "border-neutral-300 hover:border-black bg-white"
            } p-4 text-center`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) uploadImage(f);
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
                e.target.value = "";
              }}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
              {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Click or drop to upload"}
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] opacity-50 mt-1">
              PNG · JPG · WebP · HEIC · GIF · max 5 MB
            </p>
          </label>

          {uploadError && (
            <p className="text-[10px] text-red-600 uppercase tracking-[0.2em]">
              {uploadError}
            </p>
          )}

          {/* Power-user URL field — collapsed unless an image is set or user types */}
          <details className="text-[10px]">
            <summary className="cursor-pointer text-[9px] uppercase tracking-[0.3em] opacity-50 hover:opacity-100">
              Or paste a URL instead
            </summary>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className="mt-2 w-full h-[36px] border border-neutral-200 px-3 text-[12px] outline-none focus:border-black transition-colors"
            />
          </details>

          {imageUrl && (
            <div className="border border-neutral-200 p-2 bg-neutral-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] opacity-50">
                  Preview
                </p>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-[8px] uppercase tracking-[0.3em] opacity-50 hover:opacity-100 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="preview"
                className="max-w-full max-h-40 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          {feedback}
        </p>
      )}

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-3">
          Send by group (15 per group · 15/day Blooio cap)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {groups.map((g) => {
            const fullySent = g.sent === g.size;
            const inFlight = sendingGroup === g.num;
            const result = resultByGroup[g.num];
            return (
              <div
                key={g.num}
                className={`border p-3 ${
                  fullySent ? "bg-green-50 border-green-300" : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {g.label}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] opacity-60">
                    {g.sent}/{g.size}
                  </span>
                </div>
                <button
                  onClick={() => sendToGroup(g.num)}
                  disabled={inFlight || fullySent}
                  className={`mt-2 w-full h-9 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${
                    fullySent
                      ? "bg-green-200 text-green-800 cursor-default"
                      : "bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                  }`}
                >
                  {fullySent ? "✓ Sent" : inFlight ? "Sending…" : "Send to group"}
                </button>
                {result && (
                  <p className="mt-2 text-[9px] uppercase tracking-[0.2em] leading-relaxed">
                    {result.ok ? (
                      <>
                        <span className="text-green-700">queued: {result.queued || 0}</span>
                        {(result.already_sent || 0) > 0 && (
                          <> · skipped: {result.already_sent}</>
                        )}
                        {(result.rate_limited || 0) > 0 && (
                          <span className="text-amber-700"> · rate-limit hit</span>
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
