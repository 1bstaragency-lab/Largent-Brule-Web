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

          <div className="mt-[35px] grid grid-cols-1 lg:grid-cols-[256px_1fr] w-full min-h-[calc(100vh-35px)]">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block border-r border-neutral-100 bg-white sticky top-[35px] h-[calc(100vh-35px)] overflow-y-auto">
              <Sidebar />
            </div>

            {/* Mobile Navbar Overlay */}
            <div className="lg:hidden absolute top-0 left-0 w-full z-[100]">
              <MobileNavbar />
            </div>

            {/* Main Content Area */}
            <main className="w-full bg-white relative">
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
