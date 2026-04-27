# L'argent Brûlé Digital Flagship - Deployment Checklist

## 1. Environment Variables
To start selling, create a `.env.local` (or add to your deployment platform like Vercel/Netlify) with these keys:

```bash
# Stripe Keys (Get these from your Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Brand Info
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 2. Post-Deployment Steps
1.  **Stripe Integration**: When you're ready to go live, we will update the `COMPLETE PURCHASE` logic to call a real Stripe PaymentIntent.
2.  **Domain Mapping**: Ensure your custom domain is correctly pointed to your hosting provider.
3.  **Asset Check**: Verify that all high-resolution images (`hero_final_lock_v10.jpg`, etc.) are loading smoothly on mobile networks.

## 3. Current State
- **Checkout**: Currently in "Mock Premium" mode. Clicking "Complete Purchase" triggers the Success Screen.
- **Navigation**: Structured for ARCHIVE focus (Collections, Lookbook, Our Story, Campaigns, FAQ).
- **Responsive**: Fully optimized for Desktop (Sidebar) and Mobile (Top Navbar Overlay).
