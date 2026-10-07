# DESIGN-LG — Liquid Glass Design System Template

A reusable dark **liquid glass** design system: black monochrome surfaces, translucent frosted
panels, silver light beams, and a single accent used sparingly. Copy the tokens and component
recipes below into any new project, replace the `{{APP_NAME}}` placeholders, and ship.

> **Convention used here:** all values are plain CSS custom properties. Nothing in this document
> refers to a specific product — component names are generic (`.card`, `.btn`, `.pill`, …).

---

## 1. Principles

1. **Depth over decoration** — hierarchy comes from blur, translucency and layered shadows, not
   from extra colors or borders.
2. **One accent, used sparingly** — the UI is monochrome; semantic colors appear only in status
   feedback (success / warning / error).
3. **Glass needs something behind it** — every glass surface sits on an ambient background layer
   (gradient + beams + aurora + noise), otherwise translucency reads as flat gray.
4. **Motion is subtle and optional** — short eased entrances only; everything is disabled under
   `prefers-reduced-motion: reduce`.
5. **Accessible by default** — AA contrast on glass, visible focus rings, status is never
   color-only.

---

## 2. Color tokens

```css
:root {
  color-scheme: dark;

  /* surfaces */
  --bg-0: #050507; /* page base — near black */
  --bg-1: #171a23; /* gradient top — dark charcoal */

  /* text */
  --text-hi: #f5f6f8;
  --text-mid: rgba(235, 238, 245, 0.66);
  --text-low: rgba(235, 238, 245, 0.4);

  /* accents (monochrome) */
  --accent-a: #d5dae2; /* light silver — focus rings, caret, highlights */
  --accent-b: #0a0a0c; /* near black — primary surfaces/buttons */

  /* semantic status */
  --ok: #30d168;
  --ok-bg: rgba(48, 209, 104, 0.1);
  --ok-bd: rgba(48, 209, 104, 0.34);
  --warn: #ffb020;
  --warn-bg: rgba(255, 176, 32, 0.1);
  --warn-bd: rgba(255, 176, 32, 0.34);
  --err: #ff493a;
  --err-bg: rgba(255, 73, 58, 0.1);
  --err-bd: rgba(255, 73, 58, 0.36);

  /* glass */
  --glass-stroke: rgba(255, 255, 255, 0.15); /* 1px panel border */
  --glass-sheen: rgba(255, 255, 255, 0.45); /* top edge light line */

  /* radii */
  --radius-lg: 24px; /* cards */
  --radius-md: 13px; /* inner blocks, inputs */
  --radius-sm: 9px; /* small buttons */
  /* 999px — pills and the large primary button */

  --shadow-card:
    0 28px 70px -30px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(0, 0, 0, 0.45);
}
```

**Rules of thumb**

| Do                                                     | Don't                                  |
| ------------------------------------------------------ | -------------------------------------- |
| Use `rgba(255,255,255,α)` overlays for all glass fills | Use solid opaque fills on glass panels |
| Reserve semantic colors for status only                | Use `--ok/--warn/--err` for decoration |
| Keep body text at `--text-hi` / `--text-mid`           | Go below `0.4` alpha for readable text |

---

## 3. Typography

Self-hosted variable fonts via [Fontsource](https://fontsource.org/) — no CDN, works offline:

```bash
npm i -D @fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono
```

```ts
// entry file — import fonts before the stylesheet
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './style.css';
```

```css
:root {
  --font-ui:
    'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --font-display: 'Space Grotesk Variable', 'Space Grotesk', var(--font-ui);
  --font-mono:
    'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, 'Cascadia Code', 'SF Mono', Consolas,
    monospace;
}

body {
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Scale**

| Role               | Font             | Size                           | Weight | Extras                                                            |
| ------------------ | ---------------- | ------------------------------ | ------ | ----------------------------------------------------------------- |
| Display / h1       | `--font-display` | `clamp(1.9rem, 4.6vw, 2.9rem)` | 700    | letter-spacing `-0.03em`, line-height `1.1`, silver gradient text |
| Section title / h2 | `--font-display` | `1.05rem`                      | 600    | letter-spacing `-0.01em`                                          |
| Body               | `--font-ui`      | `1rem`                         | 400    | line-height `1.5`                                                 |
| Button             | `--font-ui`      | `0.86rem`                      | 600    | letter-spacing `-0.005em`                                         |
| Hint / caption     | `--font-ui`      | `0.78–0.82rem`                 | 400    | color `--text-low`                                                |
| Data / mono        | `--font-mono`    | `0.88–0.92rem`                 | 500    | line-height `1.65`                                                |

Silver gradient text for display headings:

```css
.hero-title {
  background: linear-gradient(118deg, #ffffff 30%, #c3cad6 62%, #878e9c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

---

## 4. Ambient background stack

Four fixed layers, back to front: `.bg` (z `-3`, gradients + beams) → `.aurora` (z `-2`) →
`.noise` (z `-1`) → content. All layers are `position: fixed` and `pointer-events: none` — this
replaces `background-attachment: fixed`, which repaints poorly on mobile and breaks full-page
screenshots.

```html
<div class="bg" aria-hidden="true"></div>
<div class="aurora" aria-hidden="true">
  <span class="aurora__blob aurora__blob--1"></span>
  <span class="aurora__blob aurora__blob--2"></span>
  <span class="aurora__blob aurora__blob--3"></span>
</div>
<div class="noise" aria-hidden="true"></div>
```

```css
.bg {
  position: fixed;
  inset: 0;
  z-index: -3;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(900px 620px at 88% -12%, rgba(255, 255, 255, 0.09), transparent 62%),
    radial-gradient(760px 560px at -14% 32%, rgba(174, 186, 210, 0.08), transparent 58%),
    radial-gradient(720px 640px at 55% 118%, rgba(120, 132, 158, 0.09), transparent 62%),
    radial-gradient(460px 320px at 5% 0%, rgba(255, 255, 255, 0.12), transparent 62%),
    linear-gradient(165deg, var(--bg-1) 0%, #0b0d13 45%, var(--bg-0) 100%);
}

/* Sweeping light beams — blurred gradient bars. */
.bg::before,
.bg::after {
  content: '';
  position: absolute;
  filter: blur(42px);
  opacity: 0.4;
  pointer-events: none;
}

.bg::before {
  width: 95vw;
  height: 20vw;
  left: -20vw;
  top: -6vw;
  transform: rotate(-22deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3) 35%,
    rgba(226, 233, 245, 0.44) 52%,
    rgba(255, 255, 255, 0.22) 68%,
    transparent
  );
}

.bg::after {
  width: 85vw;
  height: 16vw;
  right: -18vw;
  bottom: 0;
  transform: rotate(-18deg);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2) 38%,
    rgba(203, 212, 228, 0.3) 55%,
    transparent
  );
  opacity: 0.32;
}
```

Aurora — three huge blurred blobs drifting slowly (`mix-blend-mode: screen` keeps them luminous
without hue):

```css
.aurora {
  position: fixed;
  inset: -22%;
  z-index: -2;
  overflow: hidden;
  filter: blur(84px) saturate(0.9);
  opacity: 0.34;
  pointer-events: none;
}

.aurora__blob {
  position: absolute;
  width: 44vmax;
  height: 44vmax;
  border-radius: 50%;
  mix-blend-mode: screen;
  animation: drift 30s ease-in-out infinite alternate;
}

.aurora__blob--1 {
  top: 4%;
  left: 6%;
  background: radial-gradient(circle at 32% 32%, rgba(255, 255, 255, 0.2), transparent 66%);
}
.aurora__blob--2 {
  right: 2%;
  bottom: 8%;
  background: radial-gradient(circle at 60% 40%, rgba(160, 174, 198, 0.2), transparent 66%);
  animation-duration: 36s;
  animation-delay: -9s;
}
.aurora__blob--3 {
  top: 48%;
  left: 38%;
  width: 34vmax;
  height: 34vmax;
  background: radial-gradient(circle at 50% 50%, rgba(96, 108, 132, 0.24), transparent 64%);
  animation-duration: 42s;
  animation-delay: -16s;
}

@keyframes drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(6vmax, -4vmax, 0) scale(1.16);
  }
}
```

Noise — film-grain texture that kills gradient banding:

```css
.noise {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
}
```

> **Tuning:** beam visibility lives in `.bg::before/::after` `opacity` (0.3–0.6). Keep glows
> neutral for the black theme; tint them with a hue only if the project brand demands it.

---

## 5. Glass card

The core surface. Translucent white gradient + heavy backdrop blur + inner top highlight.

```css
.card {
  position: relative;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--radius-lg);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.018) 55%);
  backdrop-filter: blur(26px) saturate(1.4);
  -webkit-backdrop-filter: blur(26px) saturate(1.4);
  box-shadow: var(--shadow-card);
  padding: 20px 22px;
  animation: card-in 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) backwards;
}

/* specular sheen along the top edge */
.card::before {
  content: '';
  position: absolute;
  inset: 0 12% auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--glass-sheen), transparent);
  opacity: 0.45;
  pointer-events: none;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
```

Card header pattern: title left, meta count, actions right (`margin-left: auto`, wraps on mobile).

---

## 6. Buttons

Base ghost button — translucent white with a crisp border; primary is a **glossy black pill**
(solid opaque fill distinguishes it from ghost on dark backgrounds).

```css
.btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-hi);
  font: 600 0.86rem/1 var(--font-ui);
  letter-spacing: -0.005em;
  padding: 0.58rem 1.05rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    transform 0.16s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0) scale(0.98);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* primary — glossy black pill */
.btn--primary {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(180deg, #20222a, var(--accent-b));
  color: #fff;
  box-shadow:
    0 12px 30px -10px rgba(0, 0, 0, 0.95),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.7);
}

.btn--primary:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: linear-gradient(180deg, #2a2d36, #101116);
}

/* sizes */
.btn--lg {
  padding: 0.68rem 1.5rem;
  font-size: 0.94rem;
  border-radius: 999px;
}
.btn--sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
  border-radius: var(--radius-sm);
}

/* destructive ghost */
.btn--ghost-danger:hover {
  color: var(--err);
  border-color: rgba(255, 73, 58, 0.45);
  background: rgba(255, 73, 58, 0.08);
}
```

---

## 7. Text input

Dark translucent field; monospace when the input is data-like (codes, addresses, numbers).

```css
.input {
  width: 100%;
  min-height: 232px;
  resize: vertical;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  background: rgba(4, 5, 8, 0.4);
  color: var(--text-hi);
  font: 500 0.92rem/1.65 var(--font-mono);
  caret-color: #e8ebf1;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.34);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.1),
    inset 0 0 26px rgba(255, 255, 255, 0.03);
}

.input::placeholder {
  color: var(--text-low);
}

.input::-webkit-scrollbar {
  width: 10px;
}
.input::-webkit-scrollbar-thumb {
  border-radius: 8px;
  border: 3px solid transparent;
  background-clip: content-box;
  background-color: rgba(255, 255, 255, 0.18);
}
```

---

## 8. Status chips & pills

**Chip** — neutral summary counter; the number (`strong`) carries the status color:

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.78rem;
  color: var(--text-mid);
  font-variant-numeric: tabular-nums;
}
.chip--ok strong {
  color: var(--ok);
}
.chip--warn strong {
  color: var(--warn);
}
.chip--err strong {
  color: var(--err);
}
```

**Pill** — uppercase status label with a glowing dot; the label text is required (never
color-only):

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.24rem 0.62rem;
  border-radius: 999px;
  border: 1px solid;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pill::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.pill--ok {
  color: var(--ok);
  background: var(--ok-bg);
  border-color: var(--ok-bd);
}
.pill--warn {
  color: var(--warn);
  background: var(--warn-bg);
  border-color: var(--warn-bd);
}
.pill--err {
  color: var(--err);
  background: var(--err-bg);
  border-color: var(--err-bd);
}
```

---

## 9. Toast

Transient feedback. Fixed bottom-center pill; toggle a `--show` class, auto-hide after ~2.4s.
Pair with `role="status"` for screen readers.

```css
.toast {
  position: fixed;
  left: 50%;
  bottom: 30px;
  translate: -50% 14px;
  z-index: 10;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(10, 11, 15, 0.6);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  box-shadow:
    0 16px 40px -16px rgba(0, 0, 0, 0.95),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  color: var(--text-hi);
  font-size: 0.86rem;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.24s ease,
    translate 0.24s ease;
}

.toast--show {
  opacity: 1;
  translate: -50% 0;
}
```

---

## 10. Motion

| Name        | Spec                                                                    | Used for        |
| ----------- | ----------------------------------------------------------------------- | --------------- |
| `card-in`   | 0.5s `cubic-bezier(0.2, 0.7, 0.3, 1)`, fade + `translateY(10px)`        | panel entrances |
| row stagger | 0.32s fade + `translateY(5px)`, `animation-delay: min(i * 35ms, 400ms)` | list items      |
| `drift`     | 30–42s ease-in-out alternate                                            | aurora blobs    |

Kill switch — always ship this block unchanged:

```css
@media (prefers-reduced-motion: reduce) {
  .aurora__blob,
  .card,
  .row {
    animation: none;
  }

  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Layout & responsive

```css
.shell {
  max-width: 860px; /* content column */
  margin-inline: auto;
  padding: 0 20px 36px; /* bottom padding = breathing room under the footer */
  display: grid;
  gap: 22px;
}

@media (max-width: 640px) {
  .shell {
    padding-inline: 14px;
  }
  .card {
    padding: 16px;
  }
  .toolbar {
    margin-left: 0;
    width: 100%;
  } /* action rows wrap above content */
}
```

Keep side-by-side rows (label / body / actions) single-column-collapsed below 640px: the actions
group drops to its own full-width row, laid out horizontally with `space-between`.

---

## 12. Accessibility checklist

- [ ] `:focus-visible { outline: 2px solid var(--accent-a); outline-offset: 2px; }` — visible
      on every interactive element; inputs may swap it for a border + halo on `:focus`.
- [ ] Text contrast: `--text-hi` and `--text-mid` on glass pass AA; never dim body copy below
      `--text-low` (decorative only).
- [ ] Status is never color-only — pills/chips carry a text label.
- [ ] Toasts and live summaries get `role="status"` (implicit `aria-live="polite"`).
- [ ] `prefers-reduced-motion` disables all ambient/entrance animation.
- [ ] Decorative layers (`bg`, `aurora`, `noise`) are `aria-hidden="true"` + `pointer-events: none`.
- [ ] `<meta name="theme-color">` matches `--bg-0`.
- [ ] Favicon and OG tags use the same monochrome palette.

---

## 13. New-project checklist

1. `npm i -D @fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono`
2. Copy §2 tokens, §3 font stacks, §4 background stack into `style.css` (or `tokens.css`).
3. Import fonts before the stylesheet in the entry file (§3).
4. Add the ambient layers to `index.html` (§4) and one `.shell` wrapper (§11).
5. Grab the component recipes you need: card (§5), buttons (§6), input (§7), chips/pills (§8),
   toast (§9).
6. Search-replace `{{APP_NAME}}` placeholders with the product name; adjust `--bg-1` glow strength
   if the brand needs a hue.
7. Run through §12 before shipping.
