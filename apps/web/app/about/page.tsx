import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Iron Vault",
};

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 12 }}>About</h1>
      <p style={{ lineHeight: 1.7 }}>
        This is the dedicated about page in the multi-page Iron Vault public website.
      </p>
    </main>
  );
}
