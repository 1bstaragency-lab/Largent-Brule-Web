-- ============================================================
-- L'argent Brule -- Shopify Extension Schema
-- Adds Shopify variant references to cart_items so we can build
-- /cart/{variant_id}:{qty} permalinks at checkout time.
-- Safe to re-run.
-- ============================================================

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT,           -- gid://shopify/ProductVariant/123
  ADD COLUMN IF NOT EXISTS shopify_variant_legacy_id TEXT;    -- numeric id used in /cart/ permalink

-- Lookup index — Shopify webhook may need to find carts by variant later.
CREATE INDEX IF NOT EXISTS cart_items_variant_idx
  ON cart_items(shopify_variant_legacy_id)
  WHERE shopify_variant_legacy_id IS NOT NULL;
