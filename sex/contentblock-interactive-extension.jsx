# Blockwise Academy — Motion & Design Directive (Unified v1.0)

Consolidated from the raw section-by-section brief. This is the single source of truth we hand to a worker agent — not six overlapping prompts.

---

## 0. Before We Build — Verify, Don't Assume

We haven't confirmed these against the actual repo. Run this first:

```bash
cat package.json | grep -E "gsap|motion|framer-motion|lenis|@react-three"
cat tailwind.config.ts  # or .js — confirm existing color/spacing tokens before inventing new ones
```

- If `gsap`, `motion`, and `lenis` aren't installed, that's Prompt 1 (Architect), not an assumption baked into the design prompt.
- If Tailwind already defines a charcoal/lime scale, we use it — we don't propose parallel tokens that drift from the real ones.

## 1. Stack Ownership (prevents the scroll-listener conflict in the original brief)

| System | Owns | Never touches |
|---|---|---|
| **Lenis** | Global smooth-scroll wrapper only | Individual element animation |
| **GSAP ScrollTrigger** | Section-level choreography: pinning, scrub, scroll-triggered reveals, hero compression | Hover/tap states, layout transitions |
| **Motion (React)** | Discrete UI micro-interactions: hover, tap, `layoutId` shared transitions (nav underline, tab indicator), accordion expand/collapse | Anything scroll-scrubbed |

**Hard rule:** no element gets both a GSAP ScrollTrigger instance and a Motion `whileInView`/scroll-linked animation. Pick one owner per element or we get double-firing and jank.

**R3F (hero 3D):** deferred, not decided. Flag as an open decision — don't build it into the base prompt. If we want it, that's its own scoped prompt with a measured perf budget (target: no hero LCP regression, test on mid-tier mobile before merging).

## 2. Design Tokens (proposed — confirm against Tailwind config before locking)

```
--bg-charcoal-900   (base background layer)
--bg-charcoal-800   (elevated surface / cards)
--bg-charcoal-700   (hover surface)
--accent-lime       (single interactive accent — sparing use only)
--surface-offwhite  (light-section background)
--border-glass      (low-contrast card border, ~8-12% opacity)
```

Motion timing tokens (lock these once, reference everywhere — this replaces "subtle/premium/restrained" with numbers):

```
--ease-signature: cubic-bezier(0.22, 1, 0.36, 1)   // premium decel, use for reveals
--ease-hover: cubic-bezier(0.4, 0, 0.2, 1)          // standard, use for hover states
--dur-micro: 150ms     // hover/tap feedback
--dur-reveal: 500ms    // element enter
--dur-section: 800ms   // section-level transitions
--stagger-tight: 40ms  // per-item stagger, tab/card grids
--stagger-loose: 90ms  // per-line stagger, headline text
```

## 3. Section Directives (deduplicated, one entry per section, numeric not adjectival)

### Nav
- Transparent over hero → on scroll (trigger: scroll past hero bottom), transitions to `--bg-charcoal-800` at 80% opacity + `backdrop-filter: blur(12px)` + 1px bottom border at `--border-glass`. GSAP ScrollTrigger owns this transition, `--dur-section`.
- Active-link indicator: Motion `layoutId="nav-indicator"`, 1px lime line, animates position on route/section change.
- Link hover: lime underline grows left→right on enter (`--dur-micro`), retracts right→left on leave (asymmetric, not a mirrored reverse — this is what makes it feel intentional).

### Hero
- Headline: line-by-line stagger, `--stagger-loose`, `--ease-signature`, translateY 24px → 0.
- Lime highlighted words: glow/underline sweep starts 200ms after last headline line lands (not simultaneous — sequential draws attention correctly).
- CTAs: fade+translateY(12px) 300ms after headline completes.
- Floating node cards: idle state = slow autonomous drift (GSAP timeline, ~8-12s loop, ±6px). On mousemove: layered parallax, 2-3 depth layers, max shift 8-16px depending on layer, damped (no 1:1 cursor tracking — that reads as cheap, not premium).
- Scroll: hero compresses via ScrollTrigger scrub (not a discrete trigger) as the network visualization section takes over.
- **Mobile/touch:** disable cursor parallax entirely (no cursor = no signal). Reduce idle drift amplitude by 50%. This wasn't in the original brief and needs to be.

### CTA Buttons
- Primary: lime fill, hover = 2px lift (`translateY(-2px)`) + moving highlight sweep (diagonal, 600ms, one-shot on hover-enter). `--ease-hover`.
- Secondary (outlined): border + background fill sweep left→right on hover, `--dur-micro`.
- Magnetic pull: max 6px displacement toward cursor within a 40px proximity radius — small enough to feel tactile, not gimmicky.

### "Noise vs Clarity" Statement + Tab Strip
- Statement: upward reveal, `--stagger-loose` per line, lime accent behind "understand it" — implemented as a low-opacity horizontal line sweep, not a glow (matches "signal line" language in the original brief — this was the one specific, well-described detail, we keep it exact).
- Tab strip: GSAP ScrollTrigger fade+translateY(16px) on enter. Active tab = shared background via Motion `layoutId`, not a fade — this is what makes tab switches feel connected rather than like separate re-renders.
- Content swap on tab change: outgoing content exits down+fade (`--dur-micro`), incoming enters up+fade, 80ms overlap (not sequential — sequential reads as sluggish).

### Light-Surface 4-Card Grid
- Enter: stagger `--stagger-tight`, translateY 16px → 0.
- Hover: lift 4-8px, shadow deepens (define two shadow states in Tailwind config, not inline), icon gets a small path-draw or 8-12° rotation, link arrow slides 4px right. No bounce/spring easing — `--ease-hover` only, per the original brief's "engineered not playful" instruction (this one's correct as written, keeping it).

### Benefits Checklist (scroll-pinned)
- Left headline pins for the scroll distance of the right-side list only (GSAP ScrollTrigger `pin` + `end` tied to list height, not a fixed px value — fixed values break on content edits).
- Checklist items reveal one-by-one via scrub, not discrete triggers.
- Expand-on-click: height auto via Motion layout animation, arrow rotates 90°, detail text fades in after height settles (100ms delay) — not simultaneously, or the text clips during the height transition.

### FAQ Accordion
- Same layout-animation pattern as benefits checklist for consistency — we're not building two different accordion systems for two sections.

### Ambient Background (dark sections)
- Grid: barely-visible, opacity ≤6%.
- Radial lime glow: static position, animate opacity only (4-6% → 10% pulse, 6s loop) — do not animate position, that reads as a loading spinner, not ambiance.
- Line/particle sweep: single element, one direction, ~15-20s loop, low opacity. This needs a hard performance check — a continuous animated SVG/canvas element on every dark section can tank scroll performance on low-end devices. Test with Chrome DevTools performance panel before shipping, not after.

## 4. What the Original Brief Was Missing (added here, not optional)

- **`prefers-reduced-motion`**: every animation above needs a reduced-motion fallback (opacity-only, no transform/scrub). This isn't a nice-to-have — it's an accessibility requirement.
- **Performance budget**: target no CLS from any reveal animation (use `transform`/`opacity` only, never animate layout properties like `width`/`top`), and no hero LCP regression from the parallax/drift system.
- **Acceptance criteria**: each section prompt to a worker agent needs a "success when" — e.g., "Success when: tab switch completes in <300ms perceived, active indicator uses layoutId (not opacity toggle), no console errors, works at 375px viewport."

## 5. Next Convergence Step

This directive is ready to become **Prompt 1 (Repo Architect)** in the multiprompt-directive-suite format — but we need two answers first before we generate the pack:

- [ ] What's the current state of the Blockwise Academy repo — is this greenfield, or is there an existing hero/nav already built that we're upgrading?
- [ ] Confirm: are `gsap`, `motion`, and `lenis` already installed, or does Prompt 1 need to include the install step?

Once we have those, we run the actual prompt pack (Architect → Worker → QA) against this directive instead of the raw brief.
