import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SmoothScroll } from "./SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Iron Vault | Vaulted Academy — Learn. Prove. Operate. Earn.",
    description: "Structured crypto, blockchain, and DeFi education built for practical execution, verified mastery, progression, and onchain-ready skills.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Iron Vault | Vaulted Academy",
      description: "Learn. Prove. Operate. Earn. Build practical, onchain-ready skills through structured education and verified mastery.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "Iron Vault | Vaulted Academy crypto, DeFi, and blockchain education" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Iron Vault | Vaulted Academy",
      description: "Learn. Prove. Operate. Earn. Structured education for onchain-ready skills.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
