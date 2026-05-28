-- ============================================================
-- L'argent Brule -- Cart & Events Schema (Phase A)
-- Adds: persistent carts, line items, append-only event log.
-- Lays the groundwork for abandoned-cart recovery (Phase B).
-- Independent of any specific ecommerce backend -- Shopify (or
-- Stripe, or anything else) plugs in later as a thin layer.
-- ============================================================

-- ------------------------------------------------------------
-- carts: one row per browser session. Keyed by session_id from
-- the lb_session httpOnly cookie. phone_number is linked when
-- we learn it (VIP password entry, Join VIP signup, or phone
-- captured at checkout).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  phone_number TEXT,                            -- E.164 once known
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'checkout_started', 'purchased', 'abandoned', 'recovered')),
  last_activity_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  checkout_started_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  recovery_sent_at TIMESTAMPTZ,                 -- when an abandoned-cart SMS went out
  recovery_step INT DEFAULT 0,                  -- 0 none, 1 gentle (1hr), 2 discount (24hr)
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS carts_phone_idx ON carts(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS carts_status_activity_idx ON carts(status, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS carts_session_idx ON carts(session_id);

-- ------------------------------------------------------------
-- cart_items: mutable current state of each cart.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,                     -- e.g. 'bomber'
  product_name TEXT NOT NULL,
  variant TEXT,                                 -- e.g. 'CHARCOAL / M'
  price_cents INT NOT NULL,                     -- 31000 = $310
  image_url TEXT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (cart_id, product_id, variant)         -- collapse duplicate adds into quantity bumps
);
CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items(cart_id);

-- ------------------------------------------------------------
-- cart_events: append-only audit log. Powers analytics and the
-- abandoned-cart scheduler.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  phone_number TEXT,
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'cart_created',
      'item_added',
      'item_removed',
      'cart_viewed',
      'checkout_started',
      'phone_captured',
      'purchase_completed',
      'recovery_sent',
      'recovery_clicked'
    )),
  payload JSONB,                                -- e.g. { "product_id": "bomber", "variant": "CHARCOAL / M" }
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS cart_events_cart_idx ON cart_events(cart_id);
CREATE INDEX IF NOT EXISTS cart_events_session_idx ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS cart_events_phone_idx ON cart_events(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS cart_events_type_time_idx ON cart_events(event_type, created_at DESC);

-- ============================================================
-- RLS: tables are read/written ONLY by server-side Next.js
-- routes using the service_role key. Anonymous browsers never
-- talk to these directly.
-- ============================================================
ALTER TABLE carts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper view: abandoned carts ready for recovery.
-- - "active" or "checkout_started" status
-- - last activity 60+ minutes ago AND less than 7 days ago
-- - has phone_number
-- - has at least one cart_item
-- - not opted out
-- - not yet recovered or purchased
-- The abandoned-cart Cowork task (Phase B) queries this view
-- to decide who to text.
-- ============================================================
CREATE OR REPLACE VIEW v_abandoned_carts AS
  SELECT
    c.id AS cart_id,
    c.session_id,
    c.phone_number,
    c.status,
    c.last_activity_at,
    c.recovery_step,
    c.recovery_sent_at,
    EXTRACT(EPOCH FROM (NOW() - c.last_activity_at)) / 60 AS minutes_since_activity,
    (SELECT COUNT(*) FROM cart_items ci WHERE ci.cart_id = c.id) AS item_count,
    (SELECT SUM(price_cents * quantity) FROM cart_items ci WHERE ci.cart_id = c.id) AS subtotal_cents
  FROM carts c
  WHERE c.status IN ('active', 'checkout_started')
    AND c.phone_number IS NOT NULL
    AND c.last_activity_at < NOW() - INTERVAL '60 minutes'
    AND c.last_activity_at > NOW() - INTERVAL '7 days'
    AND EXISTS (SELECT 1 FROM cart_items ci WHERE ci.cart_id = c.id)
    AND NOT EXISTS (SELECT 1 FROM opt_outs o WHERE o.phone_number = c.phone_number);
