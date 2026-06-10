// Shared helpers for the influencer review pipeline.

export function normalizeHandle(raw: string): string {
  return (raw || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

const URL_RE = /^https?:\/\/[^\s]+$/i;

export function isValidVideoUrl(s: string): boolean {
  if (!s || s.length > 2000) return false;
  return URL_RE.test(s.trim());
}

export function detectPlatform(
  url: string
): 'tiktok' | 'instagram' | 'youtube' | 'other' {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return 'other';
}

export type SubmissionStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'changes_requested';

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: 'PENDING REVIEW',
  approved: 'APPROVED',
  denied: 'DENIED',
  changes_requested: 'CHANGES REQUESTED',
};
