// Single source of truth for phone normalization on every Blooio send
// path (campaigns, welcome, VIP groups, test-send, inbox matching).
//
// The subscriber table holds a mix of formats:
//   - legacy US signups stored as bare 10 digits ........ "3236295415"
//   - legacy sends stored as E.164 ...................... "+13236295415"
//   - international signups from the country dropdown ... "+33612345678"
//
// toE164() is the gate right before a text goes out: it adds +1 to bare
// US numbers, preserves explicit country codes, and returns null for
// anything unsendable (so routes can bucket it as invalid_phone instead
// of erroring the whole campaign).

// Dialing codes accepted when a plus-less number can't be a US shape
// (e.g. rows imported from a CSV that dropped the "+"). Longest first so
// "358" (Finland) wins over a hypothetical shorter prefix match.
const INTL_DIAL_CODES = [
  '358', '351', '353', '420', '971', '966', '972', '234', '212', '880',
  '20', '27', '30', '31', '32', '33', '34', '36', '39', '41', '43', '44',
  '45', '46', '47', '48', '49', '52', '55', '60', '61', '62', '63', '64',
  '65', '66', '81', '82', '84', '86', '90', '91', '92', '7',
];

/**
 * Canonical digits-only key for cross-referencing subscriber rows with
 * sent_messages / opt_outs regardless of stored format.
 * US variants collapse to "1XXXXXXXXXX"; international numbers collapse
 * to their E.164 digits (e.g. "+33 6 12 34 56 78" -> "33612345678").
 */
export function normalizePhone(input: string): string {
  const d = (input || '').replace(/\D/g, '');
  if (d.length === 10) return `1${d}`;
  return d;
}

/**
 * Convert any stored/user-entered phone into sendable E.164, defaulting
 * bare 10-digit numbers to US (+1). Returns null when the number can't
 * be confidently normalized — callers must skip those, not send.
 */
export function toE164(input: string): string | null {
  const raw = (input || '').trim();
  const hadPlus = raw.startsWith('+');
  const d = raw.replace(/\D/g, '');

  // E.164 bounds: country code + subscriber number, 8–15 digits total.
  if (d.length < 8 || d.length > 15) return null;

  // Explicit country code — trust it as entered.
  if (hadPlus) return `+${d}`;

  // Bare US shapes.
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;

  // Plus-less international: only accept a known dialing code, and
  // require a plausible national number after it.
  const code = INTL_DIAL_CODES.find((c) => d.startsWith(c));
  if (code && d.length - code.length >= 6) return `+${d}`;

  return null;
}
