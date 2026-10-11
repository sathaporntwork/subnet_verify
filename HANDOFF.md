# HANDOFF — Subnet Verify

> Snapshot of the project state for whoever picks this up next (human or agent).
> Last updated: 2026-10-11 · HEAD: `1e2cab4` (initial release, branch `main`, **no remote yet**)

---

## 1. What this is

A static web app with two client-side tools: **Verify** (batch-check subnet prefixes and
auto-fix broken ones) and **Lookup** (match a list of IPs against reference subnets).
**Vite multi-page app + vanilla TypeScript (strict) + hand-written CSS — zero runtime
dependencies.** Deploys to GitHub Pages as plain static files.

Core rule of the domain logic: a prefix is **valid** only when the host bits are zero. Anything
parseable but misaligned is **fixable** with a deterministic suggestion; unparseable input is
**invalid** and must be fixed by hand.

## 2. Current status — everything green

| Area                 | State                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| Unit tests           | 61/61 passing (`npm test`, Vitest)                                                                      |
| Lint / format        | ESLint + Prettier clean (`npm run lint`, `npm run format:check`)                                        |
| Build                | `npm run build` = `tsc --noEmit` + Vite MPA → `dist/` (two pages, ~2.5 kB JS gzip each + shared chunks) |
| Browser verification | Full flow tested in a real browser (see `gui-test-screenshots/`, git-ignored)                           |
| Git                  | One commit on `main`; **not pushed anywhere yet**                                                       |
| Deploy               | **Pending** — workflow exists, remote + Pages toggle do not                                             |

## 3. Where things live

```
DESIGN-LG.md                 reusable design-system template extracted from this theme
HANDOFF.md                   this file
README.md                    features, dev commands, Pages deploy steps
.github/workflows/deploy.yml lint → test → build → deploy (Pages, on push to main)
index.html / lookup.html     the two pages (Verify / Lookup)
src/lib/                     pure logic: types, ipv4, ipv6, verify, lookup (+ __tests__)
src/pages/lookup.ts          Lookup page bootstrap & wiring
src/ui/                      render.ts (Verify results), dom.ts, toast.ts, clipboard.ts
src/main.ts                  Verify page state & event wiring, font imports
src/style.css                the whole theme; tokens live in :root
```

## 4. Decisions you should not "fix" by accident

- **Fonts are self-hosted** via `@fontsource-variable/{inter,space-grotesk,jetbrains-mono}` as
  devDependencies, imported in `src/main.ts` _before_ `style.css`. Deliberately no Google Fonts
  CDN (offline/GitHub Pages friendly, zero external requests at runtime).
- **`vite.config.ts` uses `base: './'`** so the build works at any Pages subpath. Don't change to
  `/` unless deploying to a custom domain root.
- **Ambient background uses fixed-position layers**, not `background-attachment: fixed` (mobile
  repaint jank; also breaks full-page screenshot capture). The layers are `.bg` (z -3) →
  `.aurora` (z -2) → `.noise` (z -1).
- **Netmask notation and leading zeros are "fixable", not "invalid"** — they are interpreted as
  decimal and normalized to CIDR (matches modern parsers; the suggestion is deterministic).
  IPv6 zone IDs (`%eth0`) are rejected outright.
- **"Cancel" on a fixable row sets status `kept` for the current verification cycle only.** A
  fresh Verify (or any fix application) recomputes it back to `fixable`. This is intended — don't
  persist cancellations unless the requirement changes.
- **Lookup semantics are deliberate:** reference subnets accept every notation the Verify page
  accepts and are silently normalized (host bits masked, count shown as a note); the IP column
  accepts bare addresses only (prefix length = invalid); a blank "Found in subnets" cell means
  no match (per spec — no dash, no "none"); matching is same-family only; linear scan with a
  `MAX_PAIRS = 5_000_000` guard instead of an index — fine at realistic scale, revisit if
  someone feeds it millions of rows.
- **`vite.config.ts` declares both HTML entries** under `build.rollupOptions.input` — adding a
  third page means adding it there too.
- The theme is documented as a **generic template in `DESIGN-LG.md`**; if the UI changes, update
  that file too (it's meant to be cloned into future projects).

## 5. Next steps (in order)

1. `git remote add origin <repo-url> && git push -u origin main`
2. GitHub repo → **Settings → Pages → Source: GitHub Actions**. The workflow
   (`deploy.yml`) then builds and publishes on every push to `main` →
   `https://<user>.github.io/<repo>/`.
3. Optional ideas, none started: shareable state in the URL hash, verify-history, a "swap
   theme hue" hook documented in DESIGN-LG §4.

## 6. How to verify a change

```bash
npm test && npm run lint && npm run build && npm run preview   # http://localhost:4173
```

Manual smoke (Verify): click **Sample** → **Verify** → expect chips `4 valid · 4 fixable · 2 invalid`;
try one **Correct**, one **Cancel**, then **Apply all fixes**; **Copy valid** toasts the count;
a line-number badge focuses and selects that line in the editor; `Ctrl/Cmd+Enter` verifies.

Manual smoke (Lookup): fill both **Sample** buttons → **Look up** → expect chips
`7 subnets · 6 matched · 2 no match · 1 invalid`; row for `10.42.7.9` lists two subnets;
`8.8.8.8` / `192.168.2.1` rows have a blank match cell; **Copy table** toasts 8 rows;
clearing the subnets and re-running shows the "No valid reference subnets" alert.

> **Note for browser automation in this environment:** the in-app browser's Playwright locator
> `click` and scroll commands time out on this page — use coordinate-based `cua.click` (measure
> centers via a read-only `evaluate`) and `scrollIntoView` for scrolling. Viewport screenshots
> lag one action behind unless you wait ~400–600 ms after the action; avoid `fullPage: true`
> (the fixed background layers tile/mirror in that mode).

## 7. Known limitations (accepted for v1)

- A bare address without a prefix length (`1.2.3.4`) is invalid — no `/32` assumption.
- IPv6 output never re-embeds dotted-quad tails; canonical form is hex groups only
  (`::ffff:c0a8:0/112`), deterministic but not "pretty".
- No persistence: reload clears the editor. No i18n: UI is English only.
