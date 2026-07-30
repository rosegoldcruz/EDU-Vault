const docs = [
  ["Architecture", "/docs/CANONICAL-ARCHITECTURE.md"],
  ["Entitlements", "/docs/ENTITLEMENT-MODEL.md"],
  ["Payments", "/docs/PAYMENTS-AND-ENTITLEMENTS.md"],
  ["Go-Live Checklist", "/docs/GO-LIVE-CHECKLIST.md"],
] as const;

export default function InfoHomePage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "56px 24px" }}>
      <p style={{ color: "#56e628", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
        Iron Vault Documentation
      </p>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", margin: "0 0 12px" }}>Operational reference center</h1>
      <p style={{ color: "#b8c0d4", maxWidth: 700 }}>
        This site is dedicated to implementation notes, runbooks, architecture decisions, and production checklists.
      </p>
      <section style={{ marginTop: 28, display: "grid", gap: 12 }}>
        {docs.map(([label, href]) => (
          <a
            key={href}
            href={href}
            style={{
              padding: "14px 16px",
              border: "1px solid rgba(184, 192, 212, 0.2)",
              borderRadius: 12,
              textDecoration: "none",
              display: "block",
              background: "rgba(15, 17, 23, 0.65)",
            }}
          >
            {label}
          </a>
        ))}
      </section>
    </main>
  );
}
