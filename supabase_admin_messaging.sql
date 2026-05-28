-- ============================================================
-- L'argent Brule -- Admin Messaging Schema
-- Adds: campaign queue, send log, coupons, opt-outs.
-- Untouched: early_access table, existing Cowork welcome task.
-- A new Cowork task (largent-brule-campaign-sender) will pull from
-- campaign_recipients and respect a shared 15-per-day Blooio cap
-- by counting today's rows in sent_messages.
-- ============================================================

-- ------------------------------------------------------------
-- campaigns: composed in admin UI. Created first so other
-- tables can declare inline foreign keys to it.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  body_template TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'all'
    CHECK (segment IN ('all', 'unwelcomed', 'date_range', 'custom')),
  segment_filter JSONB,
  coupon_discount_pct INT,
  coupon_expires_days INT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'queued', 'sending', 'completed', 'paused', 'cancelled')),
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  estimated_completion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  queued_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- sent_messages: log of every Blooio send across welcomes,
-- campaigns, and manual sends. The existing welcome task should
-- ALSO insert here so the unified history and the shared rate
-- limit counter both reflect reality.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sent_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL
    CHECK (message_type IN ('welcome', 'campaign', 'manual')),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  coupon_code TEXT,
  body TEXT NOT NULL,
  blooio_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'delivered', 'failed')),
  error TEXT,
  idempotency_key TEXT UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS sent_messages_sent_at_idx ON sent_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS sent_messages_phone_idx ON sent_messages(phone_number);
CREATE INDEX IF NOT EXISTS sent_messages_campaign_idx ON sent_messages(campaign_id);
CREATE INDEX IF NOT EXISTS sent_messages_type_idx ON sent_messages(message_type);

-- ------------------------------------------------------------
-- campaign_recipients: one row per recipient per campaign.
-- The Cowork sender task reads pending rows from this table.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  coupon_code TEXT,
  rendered_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped_opt_out', 'cancelled')),
  idempotency_key TEXT NOT NULL UNIQUE,
  blooio_message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (campaign_id, phone_number)
);
CREATE INDEX IF NOT EXISTS campaign_recipients_pending_idx
  ON campaign_recipients(created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx
  ON campaign_recipients(campaign_id);

-- ------------------------------------------------------------
-- coupons: unique codes bound to a phone, optionally to a campaign.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  discount_pct INT,
  expires_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  redeemed_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS coupons_phone_idx ON coupons(phone_number);
CREATE INDEX IF NOT EXISTS coupons_campaign_idx ON coupons(campaign_id);

-- ------------------------------------------------------------
-- opt_outs: STOP replies and manual opt-outs. The sender task
-- MUST check this table before sending any message.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opt_outs (
  phone_number TEXT PRIMARY KEY,
  reason TEXT,
  opted_out_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- Row Level Security: admin-only tables. Anon role gets no
-- access. The service_role key (used by Next.js admin server
-- code and by the Cowork scheduler) bypasses RLS automatically.
-- No policies are created, so anon cannot read or write.
-- ============================================================
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_outs            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper view: count of sends in the last 24 hours, for the
-- "X of 15 used today" stat on the admin overview.
-- ============================================================
CREATE OR REPLACE VIEW v_sends_last_24h AS
  SELECT COUNT(*)::int AS sent_24h
  FROM sent_messages
  WHERE sent_at >= NOW() - INTERVAL '24 hours';
