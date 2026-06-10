"use client";

import { useState } from "react";
import { STATUS_LABEL, type SubmissionStatus } from "@/lib/influencer";
import type { BoardSubmission } from "./review-board";

interface Props {
  submission: BoardSubmission;
  onChanged?: (next: BoardSubmission) => void;
}

const STATUS_BG: Record<SubmissionStatus, string> = {
  pending: "bg-amber-50 border-amber-300 text-amber-700",
  approved: "bg-green-50 border-green-300 text-green-700",
  denied: "bg-red-50 border-red-300 text-red-700",
  changes_requested: "bg-blue-50 border-blue-300 text-blue-700",
};

export function ReviewRow({ submission, onChanged }: Props) {
  const [expanded, setExpanded] = useState(submission.status === "pending");
  const status = submission.status;
  const [notes, setNotes] = useState(submission.reviewer_notes || "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const created = new Date(submission.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const save = async (nextStatus: SubmissionStatus) => {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/influencer-submissions/${submission.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus, reviewer_notes: notes }),
        }
      );
      const j = await res.json();
      if (!j.ok) {
        setFeedback(j.error || "Save failed");
        return;
      }
      // Bubble the updated row up so the board can re-group it
      // into the new section without a refresh.
      onChanged?.({ ...submission, ...(j.submission as BoardSubmission) });
      setFeedback("Saved");
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      setFeedback("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-neutral-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em]">
              @{submission.influencers?.handle || "(deleted)"}
            </p>
            {submission.influencers?.platform && (
              <span className="text-[8px] font-bold uppercase tracking-[0.25em] border border-neutral-300 px-1.5 py-0.5">
                {submission.influencers.platform}
              </span>
            )}
            <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">
              video: {submission.platform}
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 truncate">
            {submission.video_url.replace(/^https?:\/\//, "")}
          </p>
          <p className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 mt-1">
            Submitted {created}
          </p>
        </div>
        <span
          className={`text-[8px] font-bold uppercase tracking-[0.25em] border px-2 py-1 shrink-0 ${STATUS_BG[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 p-4 space-y-4 bg-neutral-50/50">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">
              Video
            </p>
            <a
              href={submission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] underline tracking-wide break-all"
            >
              {submission.video_url}
            </a>
          </div>

          {submission.caption_draft && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60 mb-2">
                Caption draft
              </p>
              <p className="text-[12px] tracking-wide whitespace-pre-wrap leading-relaxed bg-white border border-neutral-200 p-3">
                {submission.caption_draft}
              </p>
            </div>
          )}

          <div>
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
                Team notes (visible to the creator)
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-2 w-full bg-white border border-neutral-300 p-3 text-[12px] outline-none focus:border-black transition-colors resize-none"
                placeholder="What needs to change, or why approved/denied…"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => save("approved")}
              disabled={busy}
              className="px-4 h-10 bg-green-700 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-green-800 transition-colors disabled:opacity-40"
            >
              Approve
            </button>
            <button
              onClick={() => save("changes_requested")}
              disabled={busy}
              className="px-4 h-10 bg-blue-700 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-blue-800 transition-colors disabled:opacity-40"
            >
              Request changes
            </button>
            <button
              onClick={() => save("denied")}
              disabled={busy}
              className="px-4 h-10 bg-red-700 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-800 transition-colors disabled:opacity-40"
            >
              Deny
            </button>
            {status !== "pending" && (
              <button
                onClick={() => save("pending")}
                disabled={busy}
                className="px-4 h-10 border border-neutral-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:border-black transition-colors disabled:opacity-40"
              >
                Reset to pending
              </button>
            )}
            {feedback && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 ml-2">
                {feedback}
              </span>
            )}
          </div>

          {submission.reviewed_at && (
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">
              Last reviewed {new Date(submission.reviewed_at).toLocaleString()} by{" "}
              {submission.reviewed_by || "team"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
