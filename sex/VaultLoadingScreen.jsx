# VaultLoadingScreen — Integration Guide

## Install deps (if not already in project)
```bash
npm install gsap
```

---

## Drop-in usage

```jsx
// app/learn/page.jsx  (or wherever the academy lands after logo screen)
"use client";
import { useState } from "react";
import VaultLoadingScreen from "@/components/VaultLoadingScreen";
import IronVaultAcademy from "@/components/IronVaultAcademy"; // your existing component

export default function LearnPage() {
  const [vaultDone, setVaultDone] = useState(false);

  return (
    <>
      {!vaultDone && (
        <VaultLoadingScreen onComplete={() => setVaultDone(true)} />
      )}
      {vaultDone && <IronVaultAcademy />}
    </>
  );
}
```

---

## Flow

```
Logo screen (your existing component)
    ↓  fades out (#080808 overlay)
VaultLoadingScreen mounts
    ↓  GSAP overlay fades: #080808 → transparent (0.6s)
    ↓  Scanline pulses
    ↓  Gold/lime glow builds behind door seam
    ↓  Bolts retract (staggered per corner)
    ↓  Left + right doors slide offscreen (2.2s, power4.inOut)
    ↓  Top + bottom plates peel (1.8s, power4.inOut)
    ↓  Crest + status fade out as doors open
    ↓  Glow blasts and dissolves
    ↓  Reveal content fades in: "IRON VAULT / Your education begins now."
    ↓  ScrollTrigger pin releases
    ↓  onComplete() fires → parent unmounts loading screen
IronVaultAcademy renders
```

---

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onComplete` | `() => void` | Called when ScrollTrigger pin releases (vault fully open) |

---

## Customizing the reveal content

Edit the `.vault-reveal` div inside the component:

```jsx
<div ref={revealContentRef} className="vault-reveal">
  <div className="reveal-eyebrow">▸ Financial Intelligence System</div>
  <div className="reveal-title">
    IRON<br /><span>VAULT</span>
  </div>
  <div className="reveal-sub">Your education begins now.</div>
</div>
```

Swap in whatever you want behind the doors — the academy hub, a splash message, a CTA, anything.

---

## Notes

- Component is fully self-contained — all styles are inline `<style>` tags, no Tailwind classes needed (avoids purge issues with dynamic class names)
- GSAP ScrollTrigger `pin: true` keeps the section fixed until the timeline completes
- `scrub: false` means the animation plays at full speed on scroll entry, not frame-by-frame scrub — correct for a loading screen
- The `onComplete` fires on `onLeave` (when scroll exits the pinned section) — parent can unmount this and mount the academy
- `will-change: transform` is set on all four door panels for GPU compositing
- All colors match the Iron Vault system: `#080808` bg, `#C9A227` gold, `#AAFF00` lime, `#7B2FBE` purple
- Fonts: Bebas Neue, DM Sans, Space Mono (same Google Fonts import as existing academy)
