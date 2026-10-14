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

Liquid Glass supports multi-theme configurations via custom property overrides on `[data-theme='...']`.
Below are the default base tokens (**Obsidian Silver**):

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

  /* accents & primary actions */
  --accent-a: #d5dae2; /* light silver — focus rings, caret, highlights */
  --accent-b: #0a0a0c; /* near black — primary surfaces/buttons */
  --accent-glow: rgba(255, 255, 255, 0.2);

  --accent-btn-bg: linear-gradient(180deg, #20222a, #0a0a0c);
  --accent-btn-hover: linear-gradient(180deg, #2a2d36, #101116);
  --accent-btn-bd: rgba(255, 255, 255, 0.22);
  --accent-btn-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.95);

  /* subtle / secondary buttons (Sample, Clear, Import, row actions) */
  --btn-subtle-bg: rgba(255, 255, 255, 0.05);
  --btn-subtle-bd: rgba(255, 255, 255, 0.14);
  --btn-subtle-hover-bg: rgba(255, 255, 255, 0.11);
  --btn-subtle-hover-bd: rgba(255, 255, 255, 0.35);
  --btn-subtle-glow: 0 0 12px rgba(255, 255, 255, 0.12);

  /* neutral chips & kbd badges */
  --chip-neutral-bg: rgba(255, 255, 255, 0.05);
  --chip-neutral-bd: rgba(255, 255, 255, 0.15);

  /* hover rows & table borders */
  --hover-row-bg: rgba(255, 255, 255, 0.04);
  --hover-row-bd: rgba(255, 255, 255, 0.14);
  --table-border: rgba(255, 255, 255, 0.15);
  --table-border-subtle: rgba(255, 255, 255, 0.07);

  /* toast feedback */
  --toast-bg: rgba(14, 15, 20, 0.85);
  --toast-bd: rgba(255, 255, 255, 0.25);
  --toast-glow: 0 0 20px rgba(255, 255, 255, 0.12);

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

  /* ambient gradient and sweeping light beams */
  --bg-gradient:
    radial-gradient(900px 620px at 88% -12%, rgba(255, 255, 255, 0.09), transparent 62%),
    radial-gradient(760px 560px at -14% 32%, rgba(174, 186, 210, 0.08), transparent 58%),
    radial-gradient(720px 640px at 55% 118%, rgba(120, 132, 158, 0.09), transparent 62%),
    radial-gradient(460px 320px at 5% 0%, rgba(255, 255, 255, 0.12), transparent 62%),
    linear-gradient(165deg, var(--bg-1) 0%, #0b0d13 45%, var(--bg-0) 100%);
  --beam-1: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3) 35%,
    rgba(226, 233, 245, 0.44) 52%,
    rgba(255, 255, 255, 0.22) 68%,
    transparent
  );
  --beam-2: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2) 38%,
    rgba(203, 212, 228, 0.3) 55%,
    transparent
  );
}
```

### 2.1 Multi-Theme Presets (6 Curated Palettes)

To switch themes, apply `data-theme="<id>"` to `<html>`:

```html
<html lang="en" data-theme="matrix"></html>
```

| Theme ID               | Name                | Accent Character                         | Ambient Feel                        |
| :--------------------- | :------------------ | :--------------------------------------- | :---------------------------------- |
| `obsidian` _(Default)_ | **Obsidian Silver** | Pure silver (`#d5dae2`) & mercury sheen  | Quiet luxury, deep monochrome glass |
| `matrix`               | **The Matrix**      | Cyber phosphor green (`#00ff66`)         | High-voltage digital terminal       |
| `amber`                | **Cyber Amber**     | Polished topaz amber (`#ffaa00`)         | Warm retro-futuristic console       |
| `synthwave`            | **Neon Synthwave**  | Electric violet (`#d946ef`) & cyan laser | Neon nightscape & vaporwave vibes   |
| `cyan`                 | **Electric Cyan**   | Ice cyan plasma (`#00d2ff`)              | Deep ocean, crisp high-tech clarity |
| `crimson`              | **Crimson Red**     | High-energy crimson (`#ff2a55`)          | Fiery cyber scarlet, intense laser  |

Each preset overrides surface hues, glows, primary buttons, and secondary borders:

```css
/* Example: The Matrix Theme */
[data-theme='matrix'] {
  --bg-0: #030805;
  --bg-1: #09190d;
  --text-hi: #e8faee;
  --accent-a: #00ff66;
  --accent-glow: rgba(0, 255, 102, 0.25);
  --accent-btn-bg: linear-gradient(180deg, #10421e, #041409);
  --accent-btn-bd: #00ff66;
  --btn-subtle-bg: rgba(0, 255, 102, 0.06);
  --btn-subtle-bd: rgba(0, 255, 102, 0.2);
  --btn-subtle-hover-bg: rgba(0, 255, 102, 0.14);
  --btn-subtle-hover-bd: rgba(0, 255, 102, 0.45);
  --btn-subtle-glow: 0 0 14px rgba(0, 255, 102, 0.2);
  --chip-neutral-bg: rgba(0, 255, 102, 0.06);
  --chip-neutral-bd: rgba(0, 255, 102, 0.22);
  --toast-bg: rgba(3, 16, 7, 0.85);
  --toast-bd: rgba(0, 255, 102, 0.35);
  --toast-glow: 0 0 20px rgba(0, 255, 102, 0.18);
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

Four fixed layers, front to back: `.shell` content (z `1`) → `.noise` (z `0`) → `.aurora`
(z `0`) → `.bg` (z `0`, gradients + beams). All ambient layers are `position: fixed`,
`pointer-events: none`, and sit at **z-index 0 with the content wrapper at z-index 1** — never
negative: some embedded compositors (in-app browsers / webviews) drop negative-z fixed layers
entirely, which silently hides the whole ambience. This also replaces
`background-attachment: fixed`, which repaints poorly on mobile.

> **Atmospheric layering:** Beams are constructed as wide angled ribbons (`.bg::before`, `.bg::after`) with `filter: blur(42px)` and smooth linear-gradient transitions, drifting across the screen via subtle transform animations. Ambient `.aurora` blobs provide organic background illumination.

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
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--bg-gradient);
  transition: background 0.4s ease;
}

.shell {
  position: relative;
  z-index: 1; /* content sits above all ambient layers */
}
```

Light beams — wide soft ribbons (top-left, bottom-right) angled diagonally across the viewport with blur feathering. The wide ribbons (24vw/20vw height) create an expansive, luxurious wash across the header and bottom edge. Smooth transform drift glides the beam slowly across the viewport:

```css
.bg::before,
.bg::after {
  content: '';
  position: absolute;
  filter: blur(42px);
  opacity: 0.42;
  pointer-events: none;
  transition: background 0.4s ease;
}

.bg::before {
  width: 105vw;
  height: 24vw;
  min-height: 280px;
  left: -20vw;
  top: -6vw;
  transform: rotate(-22deg);
  background: var(--beam-1);
  animation: beamDriftTop 16s ease-in-out infinite alternate;
}

.bg::after {
  width: 95vw;
  height: 20vw;
  min-height: 230px;
  right: -18vw;
  bottom: 0;
  transform: rotate(-18deg);
  background: var(--beam-2);
  opacity: 0.34;
  animation: beamDriftBottom 20s ease-in-out infinite alternate;
  animation-delay: -8s;
}

@keyframes beamDriftTop {
  from {
    transform: rotate(-22deg) translate3d(-3vw, -1.5vh, 0);
  }
  to {
    transform: rotate(-22deg) translate3d(3vw, 1.5vh, 0);
  }
}

@keyframes beamDriftBottom {
  from {
    transform: rotate(-18deg) translate3d(-2vw, 1.5vh, 0);
  }
  to {
    transform: rotate(-18deg) translate3d(2vw, 1.5vh, 0);
  }
}
```

Aurora — three large blurred blobs drifting slowly (`mix-blend-mode: screen` keeps them luminous
without hue), providing the rich organic ambient backing for the glass panels:

```css
.aurora {
  position: fixed;
  inset: -22%;
  z-index: 0;
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
  z-index: 0;
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

Base subtle / secondary button (`.btn`) uses frosted glass tokens that automatically harmonize with the active theme; primary (`.btn--primary`) is a **glossy pill** bound to `--accent-btn-*`.

```css
.btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--btn-subtle-bd);
  border-radius: 12px;
  background: var(--btn-subtle-bg);
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
    box-shadow 0.2s ease,
    color 0.2s ease,
    filter 0.2s ease;
}

.btn:hover {
  background: var(--btn-subtle-hover-bg);
  border-color: var(--btn-subtle-hover-bd);
  box-shadow: var(--btn-subtle-glow);
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* primary — glossy themed pill */
.btn--primary {
  border: 1px solid var(--accent-btn-bd);
  background: var(--accent-btn-bg);
  color: var(--text-hi);
  box-shadow:
    var(--accent-btn-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.7);
}

.btn--primary:hover {
  border-color: var(--accent-a);
  background: var(--accent-btn-hover);
  box-shadow:
    var(--accent-btn-shadow),
    0 0 16px var(--accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 rgba(0, 0, 0, 0.7);
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

Dark translucent field; monospace when the input is data-like (codes, addresses, numbers). Features custom diagonal micro-grip lines on the textarea resizer to replace native browser controls.

```css
.input {
  width: 100%;
  min-height: 232px;
  resize: vertical;
  padding: 14px 16px;
  border: 1px solid var(--input-bd);
  border-radius: var(--radius-md);
  background: var(--input-bg);
  color: var(--text-hi);
  font: 500 0.92rem/1.65 var(--font-mono);
  caret-color: var(--accent-a);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--input-focus-bd);
  box-shadow: var(--input-focus-glow);
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
  background-color: var(--scrollbar-thumb);
}

/* modern diagonal micro-grip lines replacing native browser resize square */
.input::-webkit-resizer {
  background-color: transparent;
  background-repeat: no-repeat;
  background-position: bottom 3px right 3px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M10 3.5L3.5 10M10 7L7 10' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-opacity='0.45'/%3E%3C/svg%3E");
  opacity: var(--resizer-opacity);
  transition: opacity 0.2s ease;
}

.input:hover::-webkit-resizer {
  opacity: 0.9;
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
.chip--neutral strong {
  color: var(--text-hi);
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

## 9. Results table & alerts

For record-style output: one row per input item, `#` column carries the input line number.
A **blank result cell means "no result"** — that is a deliberate visual answer; don't fill it
with dashes unless the product language needs it. Invalid rows get an err-tinted background and
a reason line under the primary text.

```html
<div class="alert" hidden></div>
<div class="table-wrap">
  <table class="table">
    <caption class="visually-hidden">
      …
    </caption>
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Item</th>
        <th scope="col">Result</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>
```

```css
/* non-blocking warning shown between card header and table */
.alert {
  margin: 0 0 12px;
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--warn-bd);
  background: var(--warn-bg);
  color: var(--warn);
  font-size: 0.84rem;
}

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.table th {
  text-align: left;
  padding: 0.5rem 0.8rem;
  border-bottom: 1px solid var(--table-border);
  color: var(--text-low);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.table td {
  padding: 0.55rem 0.8rem;
  border-bottom: 1px solid var(--table-border-subtle);
  vertical-align: top;
}

.table tbody tr:last-child td {
  border-bottom: none;
}
.table tbody tr:hover td {
  background: var(--hover-row-bg);
}

.tr--invalid td {
  background: rgba(255, 73, 58, 0.05);
}

.table__num {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-low);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.table__ip {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  overflow-wrap: anywhere;
}

.table__reason {
  margin: 2px 0 0;
  color: var(--err);
  opacity: 0.85;
  font-size: 0.76rem;
}

/* one result per line, green = matched */
.table__match {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.84rem;
  color: var(--ok);
  white-space: nowrap;
}
```

Inline notes under an input (per-line warnings, normalization notices):

```css
.notes {
  display: grid;
  gap: 2px;
  margin-top: 10px;
}
.notes p {
  margin: 0;
  color: var(--text-low);
  font-size: 0.78rem;
}
.notes__error {
  color: var(--err);
  opacity: 0.85;
}
```

---

## 10. Toast

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
  border: 1px solid var(--toast-bd);
  background: var(--toast-bg);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  box-shadow:
    0 16px 40px -16px rgba(0, 0, 0, 0.95),
    var(--toast-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
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

## 11. Motion

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

## 12. Layout, topbar & multi-theme switcher

```css
.shell {
  max-width: 860px; /* content column */
  margin-inline: auto;
  padding: 0 20px 36px; /* bottom padding = breathing room under the footer */
  display: grid;
  gap: 22px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: clamp(1rem, 3vh, 1.8rem);
}
```

### 12.1 Page nav

Glass pill track on the left of `.topbar`; active page gets a brighter fill and theme-colored glow:

```css
.nav {
  display: flex;
}

.nav__track {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--nav-track-bd);
  background: var(--nav-track-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition:
    border-color 0.3s ease,
    background 0.3s ease;
}

.nav__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.95rem;
  border-radius: 999px;
  color: var(--text-mid);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.12s ease;
}

.nav__link:hover {
  color: var(--text-hi);
}

.nav__link:active {
  transform: scale(0.96);
}

.nav__link:focus {
  outline: none;
}

.nav__link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-a);
}

.nav__link--active {
  background: var(--nav-active-bg);
  color: var(--nav-active-color);
  box-shadow: var(--nav-active-glow);
}

.nav__link--active:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--accent-a),
    var(--nav-active-glow);
}
```

Mark the active link with `aria-current="page"`. On subpages use a compact hero
(`margin-top: clamp(0.75rem, 2.5vh, 1.5rem)`).

---

### 12.2 Modern Theme Switcher Capsule

A frosted glass pill housing 3D tactile jewel swatches with specular highlights and an animated pulsing active halo:

```html
<header class="topbar">
  <nav class="nav" aria-label="Tools">
    <div class="nav__track">
      <a class="nav__link nav__link--active" href="./index.html" aria-current="page">Verify</a>
      <a class="nav__link" href="./lookup.html">Lookup</a>
    </div>
  </nav>

  <div class="theme-bar" role="group" aria-label="Theme selection">
    <div class="theme-track" id="theme-track">
      <button
        type="button"
        class="theme-btn"
        data-theme-id="obsidian"
        title="Obsidian Silver (Default)"
        aria-label="Obsidian Silver theme"
      >
        <span class="theme-btn__dot theme-btn__dot--obsidian"></span>
      </button>
      <button
        type="button"
        class="theme-btn"
        data-theme-id="matrix"
        title="The Matrix"
        aria-label="The Matrix theme"
      >
        <span class="theme-btn__dot theme-btn__dot--matrix"></span>
      </button>
      <button
        type="button"
        class="theme-btn"
        data-theme-id="amber"
        title="Cyber Amber"
        aria-label="Cyber Amber theme"
      >
        <span class="theme-btn__dot theme-btn__dot--amber"></span>
      </button>
      <button
        type="button"
        class="theme-btn"
        data-theme-id="synthwave"
        title="Neon Synthwave"
        aria-label="Neon Synthwave theme"
      >
        <span class="theme-btn__dot theme-btn__dot--synthwave"></span>
      </button>
      <button
        type="button"
        class="theme-btn"
        data-theme-id="cyan"
        title="Electric Cyan"
        aria-label="Electric Cyan theme"
      >
        <span class="theme-btn__dot theme-btn__dot--cyan"></span>
      </button>
      <button
        type="button"
        class="theme-btn"
        data-theme-id="crimson"
        title="Crimson Red"
        aria-label="Crimson Red theme"
      >
        <span class="theme-btn__dot theme-btn__dot--crimson"></span>
      </button>
    </div>
  </div>
</header>
```

```css
.theme-track {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  border-radius: 999px;
  border: 1px solid var(--nav-track-bd);
  background: var(--nav-track-bg);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow:
    0 8px 24px -6px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition:
    border-color 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.theme-btn {
  appearance: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1.5px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition:
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.theme-btn:hover {
  transform: scale(1.18);
  background: rgba(255, 255, 255, 0.08);
}

.theme-btn:active {
  transform: scale(0.96);
}

.theme-btn--active {
  border-color: var(--accent-a);
  background: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 12px var(--accent-glow),
    inset 0 0 6px var(--accent-glow);
  animation: themePulse 2.4s ease-in-out infinite alternate;
}

@keyframes themePulse {
  from {
    box-shadow:
      0 0 8px var(--accent-glow),
      inset 0 0 4px var(--accent-glow);
  }
  to {
    box-shadow:
      0 0 16px var(--accent-glow),
      inset 0 0 8px var(--accent-glow);
  }
}

.theme-btn__dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  position: relative;
  transition:
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.65),
    0 2px 6px rgba(0, 0, 0, 0.5);
}

.theme-btn:hover .theme-btn__dot {
  transform: scale(1.12);
}

.theme-btn--active .theme-btn__dot {
  transform: scale(1.08);
}

/* 3D jewel specular gradient swatches */
.theme-btn__dot--obsidian {
  background: radial-gradient(
    circle at 35% 30%,
    #ffffff 0%,
    #cbd5e1 45%,
    #64748b 85%,
    #334155 100%
  );
  box-shadow:
    inset 0 1px 1.5px rgba(255, 255, 255, 0.85),
    0 0 8px rgba(255, 255, 255, 0.45);
}

.theme-btn__dot--matrix {
  background: radial-gradient(
    circle at 35% 30%,
    #a7f3d0 0%,
    #00ff66 45%,
    #059669 85%,
    #022c15 100%
  );
  box-shadow:
    inset 0 1px 1.5px rgba(255, 255, 255, 0.85),
    0 0 10px rgba(0, 255, 102, 0.7);
}

.theme-btn__dot--amber {
  background: radial-gradient(
    circle at 35% 30%,
    #fef08a 0%,
    #ffaa00 45%,
    #d97706 85%,
    #451a03 100%
  );
  box-shadow:
    inset 0 1px 1.5px rgba(255, 255, 255, 0.85),
    0 0 10px rgba(255, 170, 0, 0.7);
}

.theme-btn__dot--synthwave {
  background: radial-gradient(
    circle at 30% 25%,
    #f5d0fe 0%,
    #d946ef 45%,
    #8b5cf6 80%,
    #00f0ff 100%
  );
  box-shadow:
    inset 0 1px 1.5px rgba(255, 255, 255, 0.85),
    0 0 10px rgba(217, 70, 239, 0.7);
}

.theme-btn__dot--cyan {
  background: radial-gradient(
    circle at 35% 30%,
    #cffafe 0%,
    #00d2ff 45%,
    #0284c7 85%,
    #082f49 100%
  );
  box-shadow:
    inset 0 1px 1.5px rgba(255, 255, 255, 0.85),
    0 0 10px rgba(0, 210, 255, 0.7);
}

.theme-btn__dot--crimson {
  background: radial-gradient(
    circle at 35% 30%,
    #fecdd3 0%,
    #ff2a55 45%,
    #be123c 85%,
    #4c0519 100%
  );
  box-shadow:
    inset 0 1px 1.5px rgba(255, 255, 255, 0.85),
    0 0 10px rgba(255, 42, 85, 0.7);
}
```

**Zero-FOUC Early Theme Initializer** — add directly in `<head>` before stylesheets:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('subnet-verify-theme') || 'obsidian';
      document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
  })();
</script>
```

---

### 12.3 Split Editors & Mobile Wrap

Two independent input cards side by side, single column on mobile:

```css
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: start;
}

.input--short {
  min-height: 170px; /* pair with the default 232px tall input for full-page editors */
}

@media (max-width: 640px) {
  .topbar {
    flex-wrap: wrap;
    justify-content: center;
  }
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
  .split {
    grid-template-columns: 1fr;
  }
  .table th,
  .table td {
    padding-inline: 0.5rem;
  }
}
```

---

### 12.4 Software Versioning Badge

Keep software versions consistent between `package.json`, runtime modules, and the footer:

```html
<footer class="foot">
  <p>
    100% client-side — your data never leaves the browser.
    <span class="foot__sep" aria-hidden="true">·</span>
    <span class="foot__version" id="app-version">v1.1.0</span>
  </p>
</footer>
```

```css
.foot__version {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--text-low);
  opacity: 0.85;
}
```

---

## 13. Accessibility checklist

- [ ] `:focus-visible { outline: 2px solid var(--accent-a); outline-offset: 2px; }` — visible
      on every interactive element; inputs may swap it for a border + halo on `:focus`.
- [ ] Text contrast: `--text-hi` and `--text-mid` on glass pass AA; never dim body copy below
      `--text-low` (decorative only).
- [ ] Status is never color-only — pills/chips carry a text label.
- [ ] Theme switcher uses accessible `role="group"`, `aria-label`, and `aria-pressed` states on each button.
- [ ] Toasts and live summaries get `role="status"` (implicit `aria-live="polite"`).
- [ ] Data tables use `<th scope="col">` and a `<caption>` (a visually-hidden one is fine);
      blank result cells are an intentional convention — say so in the page copy.
- [ ] `prefers-reduced-motion` disables all ambient/entrance animation.
- [ ] Decorative layers (`bg`, `aurora`, `noise`) are `aria-hidden="true"` + `pointer-events: none`.
- [ ] `<meta name="theme-color">` dynamically updates with the active theme's `--bg-0`.
- [ ] Favicon and OG tags use the same monochrome palette.

---

## 14. New-project checklist

1. `npm i -D @fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono`
2. Copy §2 tokens, §3 font stacks, §4 background stack into `style.css` (or `tokens.css`).
3. Import fonts before the stylesheet in the entry file (§3).
4. Add the ambient layers to the page(s) (§4) and one `.shell` wrapper (§12).
5. Add early theme restoration script to `<head>` to prevent flash of wrong theme (§12.2).
6. Grab the component recipes you need: card (§5), buttons (§6), input with micro-grip (§7), chips/pills (§8),
   results table & alerts (§9), toast (§10), topbar with page nav & theme switcher capsule (§12.1–§12.2).
7. Connect software versioning from `package.json` to the footer badge (§12.4).
8. Search-replace `{{APP_NAME}}` placeholders with the product name.
9. Run through §13 before shipping.
