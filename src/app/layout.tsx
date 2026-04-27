import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNavbar } from "@/components/mobile-navbar";
import { CartProvider } from "@/components/cart-drawer";
import { CartToggle } from "@/components/cart-toggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "L'argent Brûlé | Official Flagship",
  description: "Luxury technical apparel for the volatile era.",
  openGraph: {
    images: ["/logo_red_script.png"],
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
      <body className={`${inter.variable} font-sans antialiased bg-white overflow-x-hidden`}>
        <CartProvider>
          {/* Announcement Bar */}
          <div className="h-[35px] w-full border-b border-neutral-100 bg-white flex items-center justify-center overflow-hidden fixed top-0 z-[110]">
            <div className="marquee-content whitespace-nowrap flex">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] px-10">L&apos;argent Brûlé / Limited Edition Drop — L&apos;argent Brûlé / Limited Edition Drop — L&apos;argent Brûlé / Limited Edition Drop</span>
            </div>
          </div>

          <CartToggle />

          <div className="mt-[35px] w-full min-h-[calc(100vh-35px)] relative">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden lg:block fixed left-0 top-[35px] w-64 h-[calc(100vh-35px)] border-r border-neutral-100 bg-white overflow-y-auto z-[90]">
              <Sidebar />
            </div>

            {/* Mobile Navbar Overlay */}
            <div className="lg:hidden fixed top-[35px] left-0 w-full z-[100] bg-white border-b border-neutral-100">
              <MobileNavbar />
            </div>

            {/* Main Content Area */}
            <main className="w-full lg:pl-64 pt-16 lg:pt-0 bg-white">
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
