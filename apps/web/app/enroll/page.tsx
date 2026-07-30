import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enroll | Iron Vault",
};

export default function EnrollPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 12 }}>Enroll</h1>
      <p style={{ lineHeight: 1.7 }}>
        This is the dedicated enroll page in the multi-page Iron Vault public website.
      </p>
    </main>
  );
}
