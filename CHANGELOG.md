# Changelog

## [0.3.0] — 2026-05-17

- `mdk feature start <name> --type api --family <family>` — cross-repo branches + SSOT entry + handler stub
- `mdk feature submit` — pushes both branches, opens 2 PRs, patches each body with the sibling URL
- `mdk feature status [name]` — list in-flight features
- `mdk codegen [--check]` — wrapper for `pnpm contracts:gen`

## [0.2.0] — 2026-05-17

- `mdk bootstrap` — 11-step idempotent setup from clean MacBook to running Engine
- `mdk doctor` — precondition health check (node, pnpm, gh, xcode CLI, cocoapods)

## [0.1.0] — 2026-05-17

Initial release. Subcommands wired but no-op:
- `mdk bootstrap`
- `mdk doctor`

(Full subcommand surface in v0.2.)
