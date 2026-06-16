import type { Metadata, Viewport } from "next";
import { Inter, Scriptina } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-drawer";
import { CartToggle } from "@/components/cart-toggle";
import { RootLayoutClient } from "@/components/root-layout-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const scriptina = Scriptina({ weight: "400", subsets: ["latin"], variable: "--font-scriptina" });

export const metadata: Metadata = {
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
      <body className={`${inter.variable} ${scriptina.variable} font-sans antialiased bg-white overflow-x-hidden`}>
        <CartProvider>
          <CartToggle />
          <RootLayoutClient>{children}</RootLayoutClient>
        </CartProvider>
      </body>
    </html>
  );
}
