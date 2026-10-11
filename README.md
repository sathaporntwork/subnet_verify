# Subnet Verify

A liquid-glass dark web app with two client-side tools:

- **Verify** — paste subnet prefixes (one per line), hit **Verify**, and review the results.
  Broken prefixes get a one-click **Correct** / **Cancel** decision.
- **Lookup** — keep reference subnets on one side and a list of IP addresses on the other; the
  lookup table reports which subnets contain each IP (blank cell = no match).

100% client-side: nothing ever leaves the browser.

**Supported input (IPv4 & IPv6):**

| Form              | Example                      | Result                     |
| ----------------- | ---------------------------- | -------------------------- |
| CIDR              | `192.168.1.0/24`             | Valid                      |
| Host bits set     | `192.168.1.77/24`            | Fixable → `192.168.1.0/24` |
| Dotted netmask    | `10.0.14.9 255.255.0.0`      | Fixable → `10.0.0.0/16`    |
| Netmask as suffix | `10.0.0.1/255.255.255.0`     | Fixable → `10.0.0.0/24`    |
| Leading zeros     | `192.168.01.0/24`            | Fixable → `192.168.1.0/24` |
| Malformed         | `300.1.2.3/24`, `8.8.8.8/33` | Invalid (manual fix)       |

IPv6 is validated on 128-bit arithmetic and rendered in RFC 5952 canonical form
(e.g. `2001:db8:0:f101::1/64` → `2001:db8:0:f101::/64`).

## Features

- One prefix per line, batch verify with summary chips (valid / fixable / invalid / kept)
- Per-line **Correct** / **Cancel**, plus **Apply all fixes**
- Line-number badges jump straight to the offending line in the editor
- **Copy valid** prefixes to clipboard, **Import .txt**, **Sample** data
- `Ctrl`/`⌘ + Enter` to verify
- **Subnet Lookup page** — reference subnets × IP list, per-IP match table, copy as TSV;
  reference subnets accept the same notations and are normalized automatically (host bits
  masked, with a note); a 5M-pair guard rejects absurd batch sizes
- Black liquid-glass theme — silver light beams, frosted panels, film-grain texture,
  reduced-motion aware
- Self-hosted variable fonts: **Inter** (UI), **Space Grotesk** (display), **JetBrains Mono**
  (data) — no external font requests
- Zero runtime dependencies — pure HTML/CSS/TypeScript

## Design system

The visual language (tokens, glass surfaces, ambient background stack, components, motion,
accessibility rules) is documented as a reusable template in
[DESIGN-LG.md](./DESIGN-LG.md) — clone it for the next project and swap the `{{APP_NAME}}`
placeholders.

## Development

Requires Node 20+.

```bash
npm install
npm run dev        # Vite dev server
npm test           # Vitest unit tests (parsers, fixers, orchestration)
npm run lint       # ESLint
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build locally
```

## Versioning & Releases

This project follows [Semantic Versioning (SemVer 2.0.0)](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/).
The application version is managed in `package.json` and automatically injected into the UI and build artifacts.

To release a new version:

```bash
npm run version:patch   # e.g. 1.1.0 -> 1.1.1 (bug fixes)
npm run version:minor   # e.g. 1.1.0 -> 1.2.0 (new features)
npm run version:major   # e.g. 1.1.0 -> 2.0.0 (breaking changes)
```

See [CHANGELOG.md](./CHANGELOG.md) for full release history.

## Deploy to GitHub Pages

The repo ships with a ready-made workflow (`.github/workflows/deploy.yml`):

1. Push this project to GitHub (branch `main`).
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and select
   **GitHub Actions**.
3. Push (or re-run the _Deploy to GitHub Pages_ workflow). The site goes live at
   `https://<user>.github.io/<repo>/`.

The build uses relative asset paths (`base: './'`), so it works at any repository subpath.

## Project structure

```
├── index.html                    # Verify page
├── lookup.html                   # Lookup page (multi-page app, two Vite inputs)
├── public/favicon.svg            # monochrome glass droplet icon
├── DESIGN-LG.md                  # reusable liquid glass design system template
├── HANDOFF.md                    # current project state for the next maintainer
├── .github/workflows/deploy.yml  # lint → test → build → deploy to Pages
└── src/
    ├── main.ts                   # Verify page: app state & event wiring (+ font imports)
    ├── style.css                 # liquid glass black theme (shared by both pages)
    ├── lib/
    │   ├── types.ts              # Parsed<T>, LineResult, PrefixStatus
    │   ├── ipv4.ts               # IPv4 parse / mask / normalize (bitwise)
    │   ├── ipv6.ts               # IPv6 parse / mask / RFC 5952 canonical (BigInt)
    │   ├── verify.ts             # per-line verify orchestration
    │   ├── lookup.ts             # subnet normalization + IP membership matching
    │   └── __tests__/            # Vitest suites
    ├── pages/
    │   └── lookup.ts             # Lookup page bootstrap & event wiring
    └── ui/
        ├── render.ts             # DOM rendering for results, chips, actions
        ├── dom.ts / toast.ts     # shared $ helper and toast
        └── clipboard.ts          # clipboard with execCommand fallback
```
