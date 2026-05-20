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
    images: ["/og-image.png"],
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
          <CartToggle />

          <div className="w-full min-h-screen relative">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden lg:block fixed left-0 top-0 w-64 h-screen border-r border-neutral-100 bg-white overflow-y-auto z-[90]">
              <Sidebar />
            </div>

            {/* Mobile Navbar Overlay */}
            <div className="lg:hidden fixed top-0 left-0 w-full z-[100] bg-white border-b border-neutral-100">
              <MobileNavbar />
            </div>

            {/* Main Content Area */}
            <main className="w-full lg:pl-64 pt-20 lg:pt-0 bg-white">
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
