// BlueBubbles API client for sending iMessages/SMS.
// Uses the high-level REST API: POST /api/v1/message/text
// Auth is via the ?password= query param (server password).
// Requires BLUEBUBBLES_SERVER_URL and BLUEBUBBLES_PASSWORD.

const SERVER_URL = process.env.BLUEBUBBLES_SERVER_URL || '';
const PASSWORD = process.env.BLUEBUBBLES_PASSWORD || '';

export type SendResult =
  | { ok: true; messageId?: string; status: number }
  | { ok: false; status: number; body: string };

/** Build the iMessage chat GUID BlueBubbles expects, e.g.
 *  "iMessage;-;+13236295415". Address should already be E.164. */
function chatGuidFor(addressE164: string): string {
  return `iMessage;-;${addressE164}`;
}

/**
 * Send a message via BlueBubbles.
 * @param address Phone number in E.164 (e.g. "+13236295415")
 * @param text    Message body
 * @param tempGuid Stable per-send id used by BlueBubbles to dedupe
 */
export async function bluebubblesSend(opts: {
  address: string;
  text: string;
  tempGuid: string;
}): Promise<SendResult> {
  if (!SERVER_URL) {
    return { ok: false, status: 0, body: 'BLUEBUBBLES_SERVER_URL is not set' };
  }
  if (!PASSWORD) {
    return { ok: false, status: 0, body: 'BLUEBUBBLES_PASSWORD is not set' };
  }

  const url = `${SERVER_URL}/api/v1/message/text?password=${encodeURIComponent(PASSWORD)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatGuid: chatGuidFor(opts.address),
        tempGuid: opts.tempGuid,
        message: opts.text,
        method: 'apple-script',
      }),
    });

    const body = await res.text();
    if (res.status >= 200 && res.status < 300) {
      try {
        const parsed = JSON.parse(body);
        return { ok: true, messageId: parsed.data?.guid || parsed.data?.tempGuid, status: res.status };
      } catch {
        return { ok: true, status: res.status };
      }
    }
    return { ok: false, status: res.status, body };
  } catch (e) {
    return { ok: false, status: 0, body: String(e) };
  }
}
