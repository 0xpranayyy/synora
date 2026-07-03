# Handoff: Synora Animated Logo

## Overview
An animated version of the Synora wordmark for the site's hero. The reveal
**ignites from the four‑point star in the center of the S icon**: a bright core
flashes, a cross‑flare bursts out, the S swirl scales up out of that spark, then
the "SYNORA" wordmark wipes in left‑to‑right with a metallic light sweep. It
settles into a gentle "breathing" idle and loops every ~5.2s. Background is
transparent — built to sit on the dark app UI.

## About the Design Files
The files in this bundle are **design references**, not drop‑in production code.
The animation was authored in plain HTML/CSS over a single raster logo. Your job
is to **recreate it in this codebase's environment** (React/Next, Vue, etc.)
using its own conventions. To make that trivial, this bundle already includes a
clean, framework‑agnostic React component + CSS you can adapt — see **Files**.

There is **no build‑tool or runtime dependency**: it's CSS `@keyframes` over one
`.webp`. No Lottie, no JS animation loop, no canvas.

## Fidelity
**High‑fidelity.** Colors, timing, easing, and geometry below are final. Recreate
exactly; the numbers matter because several effects are pinned to the star's
position inside the artwork.

## The Asset
- `synora-wordmark.webp` — the full Synora lockup (icon + wordmark), 640×219,
  transparent PNG‑style alpha. **This single image is used three times** and
  split with `clip-path`, so you do NOT need separate icon/wordmark files:
  - **Icon** = left **29%** of the artwork (`clip-path: inset(0 71% 0 0)`).
  - **Wordmark** = the rest, revealed by animating the right inset from 71%→0.
- The **center star** of the S icon sits at **x ≈ 13.6%, y ≈ 48%** of the
  artwork box. Every ignition element (core, glow, rays, halo) and the icon's
  `transform-origin` are anchored to that point. If you swap the asset, re‑measure
  this point.

## Structure / Layers (back to front)
All layers are absolutely positioned inside one relatively‑positioned box that
carries the native **640 / 219** aspect ratio.

1. **Halo** — soft blue radial glow behind the icon (`syn-halo`).
2. **Icon** `<img>` — clipped to left 29%, scales out of the star (`syn-icon`).
3. **Wordmark** `<img>` — full art, left‑to‑right clip wipe (`syn-word`). This is
   the layer that should carry the accessible `alt="Synora"`; the icon img is
   `aria-hidden`.
4. **Shimmer** — a diagonal white gradient bar swept across, **masked to the logo
   pixels** via `mask-image: url(synora-wordmark.webp)` + `mix-blend-mode: screen`
   (`syn-shimmer`). The mask is what keeps the sweep inside the letters — without
   it you get a rectangle.
5. **Glow / Rays / Core** — the center ignition: soft glow (`syn-glow`), a
   vertical + horizontal flare bar forming a cross (`syn-ray`), and a bright
   round core (`syn-spark-core`).
6. The whole box also runs a subtle `syn-breathe` scale (1 → 1.012) on a 6.5s
   loop for a "living" idle.

## Timing & Easing
- Reveal loop: **5.2s**, `ease-in-out`, `infinite`. (Was 8s originally; sped up
  per request.)
- Idle breathe: **6.5s**, `ease-in-out`, `infinite` (deliberately offset from the
  reveal so they don't visibly sync).
- Rough beats within the 5.2s loop: 0–7% spark ignites → 8–16% cross‑flare →
  5–24% icon scales in → 22–48% wordmark wipes → ~50–64% shimmer sweep →
  ~82–100% fade out and restart.

## Design Tokens
Colors (all cool silver/blue to match the metallic mark on a dark UI):
- Spark core: `rgba(255,255,255,0.95)` → `rgba(190,210,255,0.3)`
- Ray flare: `rgba(235,242,255,0.9–0.95)`
- Glow: `rgba(210,225,255,0.55)` → `rgba(150,180,235,0.14)`
- Halo: `rgba(150,180,235,0.22)` → `rgba(120,150,210,0.06)`
- Shimmer band: `rgba(255,255,255,0.85)` (blend mode `screen`)
- Background: **transparent** (host provides the dark backdrop, e.g. `#0a0a0f`)

Geometry (as % of the artwork box):
- Star anchor: `left 13.6% / top 48%`
- Icon clip: `inset(0 71% 0 0)`; wordmark reveal: `inset(0 71%→0% 0 29%)`
- Icon transform-origin: `13.6% 48%`
- Core Ø 14%, glow Ø 34%, halo 46%×120%, vertical ray 2.2% wide (1:15), horizontal ray 20% wide (15:1)

## Interactions & Behavior
- **Autoplay, infinite loop.** No user interaction required.
- **No hover/click behavior** in the hero (the original showcase had a
  click‑to‑replay caption; that was removed for site use).
- **Reduced motion:** the CSS includes a `prefers-reduced-motion: reduce` block
  that hides all animated layers and shows the **static wordmark** only. Keep it.

## Recommended Usage
- Use the animation for the **hero lockup only**.
- Keep the **small sidebar icon static** — a looping animation in persistent nav
  is distracting. Use a plain `<img src="synora-wordmark.webp">` clipped to the
  icon there, or a static icon asset.
- Size via the container width; everything scales proportionally. Hero ~440–560px
  wide reads well.

## Sizing / Integration Notes
- Put `synora-wordmark.webp` where your bundler/`/public` can serve it and make
  sure the **shimmer's `mask-image` URL resolves to the same file** (it's set
  inline in the JSX so it tracks the imported `src`).
- The component takes a `width` prop; height derives from `aspect-ratio`.
- Transparent background — no wrapper background needed; it inherits the hero.

## Files
- `SynoraLogo.jsx` — ready‑to‑adapt React component (props: `width`, `src`,
  `className`, `style`). Renders all layers described above.
- `SynoraLogo.css` — all keyframes + layer styles + reduced‑motion fallback.
- `synora-wordmark.webp` — the source artwork (used by all layers).
- `synora-logo-animated.html` — the self‑contained reference build. Open it in a
  browser to see the exact intended result, or embed via `<iframe>` if you'd
  rather not port it to a component.
- `Synora Logo Web.dc.html` — the original authoring source (ignore the
  `<x-dc>` / `support.js` wrapper — that's a prototyping runtime, not needed).

## Verify Against
Open `synora-logo-animated.html` in a browser — your recreated component should
match its motion and look 1:1. Common pitfalls: (1) shimmer showing as a
rectangle → the `mask-image` isn't resolving; (2) flare not centered on the star
→ re‑check the 13.6%/48% anchor and `transform-origin`; (3) icon/wordmark
doubling → verify the `clip-path` insets.
