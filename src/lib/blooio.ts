// Server-only Blooio API client.
// Mirrors the curl pattern documented in the Cowork welcome SKILL.md.
// Notes:
//   - Node's fetch sends a different User-Agent + TLS fingerprint than
//     Python's urllib, so it should pass Cloudflare cleanly. If Blooio
//     ever returns 403 with a Cloudflare ray ID, we'll fall back to
//     spawning `curl` from a Node child_process.

const BASE = process.env.BLOOIO_BASE || 'https://backend.blooio.com/v2/api';

function authHeaders(): Record<string, string> {
  const key = process.env.BLOOIO_API_KEY;
  if (!key) throw new Error('BLOOIO_API_KEY is not set');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export type SendResult =
  | { ok: true; messageId?: string; status: number }
  | { ok: false; status: number; body: string };

/**
 * Send a single iMessage / SMS via Blooio.
 * @param phoneE164      E.164 format, e.g. "+12025551234"
 * @param text           Message body (already rendered, no placeholders)
 * @param idempotencyKey Stable per-recipient key (e.g. "12025551234_campaign_<uuid>")
 */
export async function blooioSend(opts: {
  phoneE164: string;
  text: string;
  idempotencyKey: string;
  /** Optional image URL(s). Passed to Blooio as attachments — message
   *  goes out as MMS / iMessage with media. */
  imageUrls?: string[];
}): Promise<SendResult> {
  const encoded = encodeURIComponent(opts.phoneE164); // "+" → "%2B"
  const url = `${BASE}/chats/${encoded}/messages`;

  const payload: Record<string, unknown> = { text: opts.text };
  if (opts.imageUrls && opts.imageUrls.length > 0) {
    payload.attachments = opts.imageUrls.map((u) => ({ url: u, type: 'image' }));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        'Idempotency-Key': opts.idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return { ok: false, status: 0, body: String(e) };
  }

  const body = await res.text();
  if (res.status === 202) {
    try {
      const parsed = JSON.parse(body);
      return { ok: true, messageId: parsed.message_id, status: 202 };
    } catch {
      return { ok: true, status: 202 };
    }
  }
  return { ok: false, status: res.status, body };
}

// ============================================================
// Read endpoints (used by the Inbox view).
// ============================================================

export interface BlooioChat {
  id: string;                  // phone number e.g. "+12025551234"
  type: string;
  is_group: boolean;
  contact: { contact_id: string; name: string | null; identifier: string };
  message_count: number;
  inbound_count: number;
  outbound_count: number;
  last_message_time: number | null;
  last_inbound_time: number | null;
  last_outbound_time: number | null;
  last_message: BlooioMessage | null;
}

export interface BlooioMessage {
  message_id: string;
  direction: 'inbound' | 'outbound';
  external_id: string;
  internal_id?: string;
  text: string;
  attachments: unknown[];
  reactions: unknown[];
  sender?: string;
  time_sent: number;
  time_delivered: number | null;
  status: string;
  protocol: string;            // 'imessage' | 'sms' | ...
  error: string | null;
}

export async function blooioListChats(opts?: {
  limit?: number;
  offset?: number;
}): Promise<{ ok: boolean; chats: BlooioChat[]; status: number }> {
  const params = new URLSearchParams({
    limit: String(opts?.limit ?? 100),
    offset: String(opts?.offset ?? 0),
  });
  try {
    const res = await fetch(`${BASE}/chats?${params}`, { headers: authHeaders() });
    if (!res.ok) return { ok: false, chats: [], status: res.status };
    const json = await res.json();
    return { ok: true, chats: json.chats || [], status: res.status };
  } catch {
    return { ok: false, chats: [], status: 0 };
  }
}

export async function blooioListMessages(
  chatId: string,
  opts?: { limit?: number; offset?: number }
): Promise<{ ok: boolean; messages: BlooioMessage[]; status: number }> {
  const encoded = encodeURIComponent(chatId);
  const params = new URLSearchParams({
    limit: String(opts?.limit ?? 100),
    offset: String(opts?.offset ?? 0),
  });
  try {
    const res = await fetch(`${BASE}/chats/${encoded}/messages?${params}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return { ok: false, messages: [], status: res.status };
    const json = await res.json();
    return { ok: true, messages: json.messages || [], status: res.status };
  } catch {
    return { ok: false, messages: [], status: 0 };
  }
}
