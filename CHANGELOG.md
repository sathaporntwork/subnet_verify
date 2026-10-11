# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-11

### Added

- **Subnet Lookup Tool**: Match IPv4 & IPv6 addresses against multiple reference subnets client-side.
- **Interactive Multi-Theme Switcher**: 5 curated themes (Obsidian Silver default, The Matrix, Cyber Amber, Neon Synthwave, Electric Cyan) with instant switcher and `localStorage` persistence.
- **Software Versioning**: Automatic version injection from `package.json` across the UI and runtime.
- **Modern Textarea Resizer**: Replaced native browser resizer box with sleek diagonal micro-grip lines.

### Fixed

- **FOUC (Flash of Unstyled Content)**: Linked stylesheet directly in `<head>` with critical dark background fallback to eliminate initial unstyled rendering on refresh.
- **Header Spacing Inconsistency**: Aligned top margin of hero header between Verify and Lookup pages.

## [1.0.0] - 2026-10-11

### Added

- Initial release of **Subnet Verify**.
- Batch verification for IPv4 and IPv6 subnet prefixes.
- One-click deterministic auto-fixing for misaligned host bits, netmask notations, and leading zeros.
- Export / copy / sample data capabilities.
- 100% client-side privacy-first processing.
