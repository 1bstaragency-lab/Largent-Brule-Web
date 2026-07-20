import type { Metadata, Viewport } from "next";
import { Inter, Great_Vibes } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/components/cart-drawer";
import { CartToggle } from "@/components/cart-toggle";
import { RootLayoutClient } from "@/components/root-layout-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-scriptina" });

export const metadata: Metadata = {
  // Resolves all relative OG/icon URLs to absolute https://largentbrule.com/...
  // Without this, Next falls back to localhost and link previews (iMessage,
  // etc.) can't load the thumbnail — they render as a bare link bubble.
  metadataBase: new URL("https://largentbrule.com"),
  title: "L'argent Brûlé | Official Flagship",
  description: "Luxury technical apparel for the volatile era.",
  openGraph: {
    title: "L'argent Brûlé | Official Flagship",
    description: "Luxury technical apparel for the volatile era.",
    url: "https://largentbrule.com",
    siteName: "L'argent Brûlé",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "L'argent Brûlé",
      },
    ],
    type: "website",
  },
  // iMessage / Safari / iOS home-screen use apple-touch-icon. Compact
  // link previews ("Official Flagship" + small icon) pull from this.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${greatVibes.variable} font-sans antialiased bg-white overflow-x-hidden`}>
        {/* Brevo PushOwl SDK — headless install (site is Next.js on Vercel,
            Shopify is backend-only). See docs.pushowl.com "Using PushOwl on
            a Headless Store". Requires /pushowl/service-worker.js at root. */}
        <Script id="pushowl-init" strategy="afterInteractive">
          {`
            window.pushowl = window.pushowl || {
              queue: [],
              trigger: function (taskName, taskData) {
                return new Promise((resolve, reject) => {
                  this.queue.push({ taskName, taskData, promise: { resolve, reject } });
                });
              },
              init: function () {
                const subdomain = 'th0stz-kz';
                const platform = 'shopify';
                this.subdomain = subdomain;
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = 'https://cdn.pushowl.com/sdks/pushowl-sdk.js?subdomain=' + subdomain +
                  '&environment=production&shop=' + subdomain + '.my' + platform + '.com' +
                  '&platform=' + platform;
                var x = document.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
              }
            };
            window.pushowl.init();
          `}
        </Script>
        <CartProvider>
          <CartToggle />
          <RootLayoutClient>{children}</RootLayoutClient>
        </CartProvider>
      </body>
    </html>
  );
}
