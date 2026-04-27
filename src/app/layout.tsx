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
      <body className={`${inter.variable} font-sans antialiased flex flex-col lg:flex-row min-h-screen bg-white`}>
        <CartProvider>
          {/* Global Bag Toggle - Upper Right */}
          <CartToggle />

          {/* Top Announcement Bar - Script Marquee */}
          <div className="h-[35px] w-full bg-[#f6f6f6] border-b border-border flex items-center overflow-hidden fixed top-0 z-[2000]">
            <div className="marquee-container">
              <div className="marquee-content script-font text-[18px] text-black">
                {[...Array(10)].map((_, i) => (
                  <span key={i} className="px-8">
                    L&apos;argent Brûlé | Limited Edition Drop &nbsp; —
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row w-full mt-[35px]">
            {/* Navigation: Sidebar for Desktop, MobileNavbar for Mobile */}
            <div className="lg:hidden">
              <MobileNavbar />
            </div>
            <div className="hidden lg:block lg:fixed lg:left-0 lg:top-[35px] lg:h-[calc(100vh-35px)]">
              <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 min-h-[calc(100vh-35px)]">
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
