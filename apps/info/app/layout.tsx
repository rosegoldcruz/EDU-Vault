import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iron Vault Info",
  description: "Operational and product documentation for Iron Vault.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
