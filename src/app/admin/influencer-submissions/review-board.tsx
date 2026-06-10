"use client";

// Client-side board that re-groups submissions instantly when their
// status changes. The server-rendered page hands us the initial list
// and we maintain it in state from there.

import { useMemo, useState } from "react";
import { ReviewRow } from "./review-row";
import type { SubmissionStatus } from "@/lib/influencer";

export interface BoardSubmission {
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
  influencers: {
    handle: string;
    platform: "tiktok" | "instagram";
    display_name: string | null;
    instagram_handle: string | null;
  } | null;
}

interface Props {
  initial: BoardSubmission[];
}

export function ReviewBoard({ initial }: Props) {
  const [submissions, setSubmissions] = useState<BoardSubmission[]>(initial);

  const grouped = useMemo(() => {
    return {
      pending: submissions.filter((s) => s.status === "pending"),
      changes_requested: submissions.filter((s) => s.status === "changes_requested"),
      approved: submissions.filter((s) => s.status === "approved"),
      denied: submissions.filter((s) => s.status === "denied"),
    };
  }, [submissions]);

  const onChanged = (next: BoardSubmission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === next.id ? { ...s, ...next } : s))
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
          Influencer Submissions
        </p>
        <h1 className="text-3xl font-light">{submissions.length} total</h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
          {grouped.pending.length} pending review · {grouped.changes_requested.length} changes requested · {grouped.approved.length} approved · {grouped.denied.length} denied
        </p>
      </div>

      <Section
        title="Pending Review"
        rows={grouped.pending}
        emptyMsg="Nothing waiting."
        onChanged={onChanged}
      />
      <Section
        title="Changes Requested"
        rows={grouped.changes_requested}
        emptyMsg="No submissions currently flagged for changes."
        onChanged={onChanged}
      />
      <Section
        title="Approved"
        rows={grouped.approved}
        emptyMsg="No approvals yet."
        onChanged={onChanged}
      />
      <Section
        title="Denied"
        rows={grouped.denied}
        emptyMsg="None."
        onChanged={onChanged}
      />
    </div>
  );
}

function Section({
  title,
  rows,
  emptyMsg,
  onChanged,
}: {
  title: string;
  rows: BoardSubmission[];
  emptyMsg: string;
  onChanged: (next: BoardSubmission) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-500">
        {title} ({rows.length})
      </h2>
      {rows.length === 0 ? (
        <p className="text-[11px] text-neutral-400 italic">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <ReviewRow key={r.id} submission={r} onChanged={onChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
