// Server-only coupon code generator.
// Format: LB-VIP-XXXXXX (6 chars, unambiguous alphabet).
// Collision-safe: retries up to 5 times against the UNIQUE constraint
// on coupons.code before throwing.
import { supabaseAdmin } from './supabase-admin';

// 31 chars — excludes 0, 1, I, L, O for visual clarity over SMS.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCouponCode(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `LB-VIP-${suffix}`;
}

export interface MintCouponInput {
  phoneE164: string;        // bound to this phone
  campaignId: string | null;
  discountPct: number | null;
  expiresAt: Date | null;
}

/**
 * Mint one unique coupon code bound to a phone number. Throws if a
 * unique code cannot be generated after 5 retries (cosmic-ray odds).
 */
export async function mintUniqueCoupon(input: MintCouponInput): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCouponCode();
    const { error } = await supabaseAdmin.from('coupons').insert({
      code,
      phone_number: input.phoneE164,
      campaign_id: input.campaignId,
      discount_pct: input.discountPct,
      expires_at: input.expiresAt?.toISOString() || null,
    });
    if (!error) return code;
    // Postgres unique violation = 23505. Supabase surfaces this in
    // error.code OR error.message. Retry only on collision.
    const msg = (error.message || '').toLowerCase();
    const isDuplicate =
      (error as { code?: string }).code === '23505' ||
      msg.includes('duplicate') ||
      msg.includes('unique');
    if (!isDuplicate) {
      throw new Error(`mintUniqueCoupon failed: ${error.message}`);
    }
    // else: collision, try a new code
  }
  throw new Error('mintUniqueCoupon: 5 collisions in a row — exhausted retries');
}
