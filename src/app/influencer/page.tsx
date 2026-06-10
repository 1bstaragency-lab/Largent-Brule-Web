"use client";

// Public influencer portal. Single page, two modes:
//   1) signed-out → pick platform (TikTok / Instagram) + enter @handle
//   2) signed-in  → dashboard with video-count stats, list of past
//                   submissions, and new submission form.
// Identity persists in localStorage: lb_influencer_handle + lb_influencer_platform.
// No real auth — the team-side review process catches impersonation.

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  detectPlatform,
  isLoginPlatform,
  normalizeHandle,
  PLATFORM_LABEL,
  STATUS_LABEL,
  type LoginPlatform,
  type SubmissionStatus,
} from "@/lib/influencer";

interface Influencer {
  id: string;
  handle: string;
  platform: LoginPlatform;
  display_name: string | null;
  instagram_handle: string | null;
  email: string | null;
  created_at: string;
  last_seen_at: string;
}
interface Submission {
  id: string;
  influencer_id: string;
  video_url: string;
  platform: "tiktok" | "instagram" | "youtube" | "other";
  caption_draft: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}
interface Stats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  changes_requested: number;
}

const HANDLE_KEY = "lb_influencer_handle";
const PLATFORM_KEY = "lb_influencer_platform";

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  pending: "text-amber-600 border-amber-600",
  approved: "text-green-700 border-green-700",
  denied: "text-red-600 border-red-600",
  changes_requested: "text-blue-700 border-blue-700",
};

const EMPTY_STATS: Stats = {
  total: 0,
  pending: 0,
  approved: 0,
  denied: 0,
  changes_requested: 0,
};

export default function InfluencerPortal() {
  const [platformChoice, setPlatformChoice] = useState<LoginPlatform>("tiktok");
  const [handleInput, setHandleInput] = useState("");
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [hydrating, setHydrating] = useState(true);

  const signIn = useCallback(
    async (rawHandle: string, platform: LoginPlatform) => {
      const handle = normalizeHandle(rawHandle);
      if (!handle) {
        setErrMsg("Enter your @ handle");
        return;
      }
      setLoading(true);
      setErrMsg("");
      try {
        const res = await fetch("/api/influencer/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle, platform }),
        });
        const j = await res.json();
        if (!j.ok) {
          setErrMsg(j.error || "Could not load");
          return;
        }
        setInfluencer(j.influencer);
        setSubmissions(j.submissions);
        setStats(j.stats || EMPTY_STATS);
        window.localStorage.setItem(HANDLE_KEY, handle);
        window.localStorage.setItem(PLATFORM_KEY, platform);
      } catch {
        setErrMsg("Network error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-restore from localStorage.
  useEffect(() => {
    const savedHandle = window.localStorage.getItem(HANDLE_KEY);
    const savedPlatform = window.localStorage.getItem(PLATFORM_KEY) || "tiktok";
    if (savedHandle && isLoginPlatform(savedPlatform)) {
      signIn(savedHandle, savedPlatform).finally(() => setHydrating(false));
    } else {
      setHydrating(false);
    }
  }, [signIn]);

  const signOut = () => {
    window.localStorage.removeItem(HANDLE_KEY);
    window.localStorage.removeItem(PLATFORM_KEY);
    setInfluencer(null);
    setSubmissions([]);
    setStats(EMPTY_STATS);
    setHandleInput("");
  };

  // Keep stats in sync when submissions list mutates client-side.
  const setSubmissionsWithStats = (next: Submission[]) => {
    setSubmissions(next);
    setStats({
      total: next.length,
      pending: next.filter((s) => s.status === "pending").length,
      approved: next.filter((s) => s.status === "approved").length,
      denied: next.filter((s) => s.status === "denied").length,
      changes_requested: next.filter((s) => s.status === "changes_requested").length,
    });
  };

  if (hydrating) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">Loading…</p>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-white px-6 py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
              Creator Portal
            </p>
            <h1 className="text-[26px] lg:text-[40px] font-bold tracking-[0.15em] lg:tracking-[0.3em] uppercase leading-none">
              L&apos;B
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 max-w-sm mx-auto leading-relaxed">
              Submit your content for brand approval before posting.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signIn(handleInput, platformChoice);
            }}
            className="space-y-4"
          >
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 block mb-2">
                Sign in with
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["tiktok", "instagram"] as LoginPlatform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatformChoice(p)}
                    className={`h-[48px] border text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${
                      platformChoice === p
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-black hover:border-black"
                    }`}
                  >
                    {PLATFORM_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
                Your {PLATFORM_LABEL[platformChoice]} Handle
              </span>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="@yourhandle"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="mt-2 w-full h-[52px] bg-neutral-50 border border-neutral-200 px-4 text-[12px] uppercase tracking-[0.15em] outline-none focus:border-black transition-colors"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              {loading ? "LOADING…" : "ENTER"}
            </button>
            {errMsg && (
              <p className="text-[10px] text-red-600 text-center tracking-wide">{errMsg}</p>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <Dashboard
      influencer={influencer}
      submissions={submissions}
      stats={stats}
      onSubmissionsChanged={setSubmissionsWithStats}
      onSignOut={signOut}
    />
  );
}

function Dashboard({
  influencer,
  submissions,
  stats,
  onSubmissionsChanged,
  onSignOut,
}: {
  influencer: Influencer;
  submissions: Submission[];
  stats: Stats;
  onSubmissionsChanged: (s: Submission[]) => void;
  onSignOut: () => void;
}) {
  const [showForm, setShowForm] = useState(submissions.length === 0);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-6 pt-10 pb-20 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">
              {PLATFORM_LABEL[influencer.platform]} CREATOR
            </p>
            <h1 className="text-[20px] font-bold uppercase tracking-[0.15em]">
              @{influencer.handle}
            </h1>
          </div>
          <button
            onClick={onSignOut}
            className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
          >
            Switch handle
          </button>
        </div>

        {/* Stats panel */}
        <StatsPanel stats={stats} />

        {/* New submission */}
        {showForm ? (
          <NewSubmissionForm
            handle={influencer.handle}
            platform={influencer.platform}
            onCreated={(newSub) => {
              onSubmissionsChanged([newSub, ...submissions]);
              setShowForm(false);
            }}
            onCancel={submissions.length > 0 ? () => setShowForm(false) : undefined}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-[52px] border border-black text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-colors"
          >
            + SUBMIT NEW VIDEO
          </button>
        )}

        {/* Submissions list */}
        <div className="space-y-3">
          {submissions.length === 0 && !showForm && (
            <p className="text-[10px] text-center text-neutral-400 uppercase tracking-[0.3em] py-10">
              No submissions yet
            </p>
          )}
          {submissions.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      </main>
    </div>
  );
}

function StatsPanel({ stats }: { stats: Stats }) {
  const items: Array<{ label: string; value: number; tone: string }> = [
    { label: "Total Videos", value: stats.total, tone: "text-black" },
    { label: "Approved", value: stats.approved, tone: "text-green-700" },
    { label: "Pending", value: stats.pending, tone: "text-amber-600" },
    { label: "Needs Changes", value: stats.changes_requested, tone: "text-blue-700" },
    { label: "Denied", value: stats.denied, tone: "text-red-600" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 border border-neutral-200 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
      {items.map((it) => (
        <div key={it.label} className="px-4 py-5 text-center bg-neutral-50/40">
          <p className={`text-[26px] font-bold leading-none ${it.tone}`}>{it.value}</p>
          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.3em] opacity-60">
            {it.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function NewSubmissionForm({
  handle,
  platform,
  onCreated,
  onCancel,
}: {
  handle: string;
  platform: LoginPlatform;
  onCreated: (s: Submission) => void;
  onCancel?: () => void;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrMsg("");
    try {
      const res = await fetch("/api/influencer/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          platform,
          video_url: videoUrl,
          caption_draft: caption,
        }),
      });
      const j = await res.json();
      if (!j.ok) {
        setErrMsg(j.error || "Submission failed");
        return;
      }
      onCreated(j.submission);
      setVideoUrl("");
      setCaption("");
    } catch {
      setErrMsg("Network error");
    } finally {
      setBusy(false);
    }
  };

  const videoPlatform = videoUrl ? detectPlatform(videoUrl) : null;

  return (
    <form onSubmit={submit} className="border border-black p-6 space-y-5 bg-neutral-50/40">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">New Submission</p>
      <label className="block">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
          Post Link
        </span>
        <input
          type="url"
          required
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.tiktok.com/… or https://www.instagram.com/…"
          className="mt-2 w-full h-[48px] bg-white border border-neutral-200 px-3 text-[12px] outline-none focus:border-black transition-colors"
        />
        <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] opacity-50">
          Paste the direct link to your TikTok or Instagram post.
          {videoPlatform && videoPlatform !== "other" && (
            <> Detected: {videoPlatform}</>
          )}
        </span>
      </label>
      <label className="block">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
          Caption Draft (optional)
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          placeholder="What you plan to write when posting…"
          className="mt-2 w-full bg-white border border-neutral-200 p-3 text-[12px] outline-none focus:border-black transition-colors resize-none"
        />
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy || !videoUrl}
          className="flex-1 h-[48px] bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-800 transition-colors disabled:opacity-40"
        >
          {busy ? "SENDING…" : "SUBMIT FOR REVIEW"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] px-6 border border-neutral-300 text-[10px] font-bold uppercase tracking-[0.3em] hover:border-black transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      {errMsg && (
        <p className="text-[10px] text-red-600 tracking-wide">{errMsg}</p>
      )}
    </form>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(submission.status !== "approved");
  const created = new Date(submission.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div className="border border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-neutral-50/60 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] truncate">
            {submission.video_url.replace(/^https?:\/\//, "")}
          </p>
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-500 mt-1">
            {submission.platform} · {created}
          </p>
        </div>
        <span
          className={`text-[8px] font-bold uppercase tracking-[0.25em] border px-2 py-1 shrink-0 ${STATUS_COLOR[submission.status]}`}
        >
          {STATUS_LABEL[submission.status]}
        </span>
      </button>
      {open && (
        <div className="border-t border-neutral-100 p-4 space-y-4 bg-neutral-50/40">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">
              Video
            </p>
            <a
              href={submission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] underline tracking-wide break-all"
            >
              {submission.video_url}
            </a>
          </div>
          {submission.caption_draft && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">
                Caption draft
              </p>
              <p className="text-[11px] tracking-wide whitespace-pre-wrap leading-relaxed">
                {submission.caption_draft}
              </p>
            </div>
          )}
          {submission.reviewer_notes && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">
                Team notes
              </p>
              <p className="text-[11px] tracking-wide whitespace-pre-wrap leading-relaxed border-l-2 border-black pl-3">
                {submission.reviewer_notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
