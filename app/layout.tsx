import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { headers } from "next/headers";
import { SmoothScroll } from "./SmoothScroll";
import "./globals.css";
import "./iv/iron.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Iron Vault | Vaulted Academy — Learn first. Participate with context.",
    description: "An education-first Web3 ecosystem built around financial literacy, emerging technology, operational transparency, and informed participation. Vaulted Academy is the knowledge layer. IV SOL is the participation layer.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Iron Vault | Vaulted Academy",
      description: "Learn first. Participate with context. A precision-engineered operating system for financial and technological literacy.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "Iron Vault | Vaulted Academy — education-first Web3 ecosystem" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Iron Vault | Vaulted Academy",
      description: "Learn first. Participate with context. Education before participation — proof before promises.",
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
    <html lang="en" suppressHydrationWarning className={`${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable} ${interTight.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('iv-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.ivTheme=t;document.documentElement.style.colorScheme=t}catch(e){}})()` }} />
      </head>
      <body className="antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
