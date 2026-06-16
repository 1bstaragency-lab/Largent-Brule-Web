"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileNavbar } from "@/components/mobile-navbar";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/product/");
  const isVipPage = pathname === "/vip";

  return (
    <div className="w-full min-h-screen relative">
      {/* Desktop Sidebar - Hidden on Mobile and Product Pages */}
      {!isProductPage && (
        <div className="hidden lg:block fixed left-0 top-0 w-64 h-screen border-r border-neutral-100 bg-white overflow-y-auto z-[90]">
          <Sidebar />
        </div>
      )}

      {/* Mobile Navbar Overlay */}
      {!isVipPage && (
        <div className="lg:hidden fixed top-0 left-0 w-full z-[100] bg-white border-b border-neutral-100">
          <MobileNavbar />
        </div>
      )}

      {/* Main Content Area */}
      <main className={`w-full ${!isProductPage ? "lg:pl-64" : ""} ${!isVipPage ? "pt-20" : ""} lg:pt-0 bg-white`}>
        {children}
      </main>
    </div>
  );
}
