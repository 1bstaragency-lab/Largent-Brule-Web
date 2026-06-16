import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L'argent Brûlé | Early Access Portal",
  description: "Exclusive early access to new collections. VIP shopping portal.",
  openGraph: {
    title: "L'argent Brûlé | Early Access Portal",
    description: "Exclusive early access to new collections. VIP shopping portal.",
    url: "https://largentbrule.com/vip",
    siteName: "L'argent Brûlé",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "L'argent Brûlé Early Access Portal",
      },
    ],
    type: "website",
  },
};

export default function VipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
