import type { Metadata } from "next";
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
    title: "L'argent Brûlé | Official Flagship",
    description: "Luxury technical apparel for the volatile era.",
    images: ["/logo_red_script.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "L'argent Brûlé | Official Flagship",
    description: "Luxury technical apparel for the volatile era.",
    images: ["/logo_red_script.png"],
  },
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

          <div className="mt-[35px] w-full">
            {/* Desktop Sidebar - Absolute Fixed */}
            <div className="hidden lg:block fixed left-0 top-[35px] w-64 h-[calc(100vh-35px)] border-r border-neutral-100 z-[90]">
              <Sidebar />
            </div>

            {/* Mobile Navbar */}
            <div className="lg:hidden">
              <MobileNavbar />
            </div>

            {/* Main Content Area */}
            <main className="w-full lg:pl-64 min-h-[calc(100vh-35px)]">
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
