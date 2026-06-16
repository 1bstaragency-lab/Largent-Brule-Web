import { CartProvider } from "@/components/cart-drawer";
import { CartToggle } from "@/components/cart-toggle";

export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <CartToggle />
      <main className="w-full bg-white">
        {children}
      </main>
    </CartProvider>
  );
}
