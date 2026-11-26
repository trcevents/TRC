# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TRC Events ("The Right Connection. The Reggae Connection.") — trcevent.com, the marketing arm of
Ras Tafari Inc (a 501(c)(3) nonprofit that also runs SelassieFest / selassiefest.com). Built with
TanStack Start (file-based router + SSR) on React 19, styled with Tailwind v4 + shadcn/ui
("new-york" style). Originally exported from Lovable; as of 2026-07-15 this repo is **disconnected
from the Lovable editor** (no more push-to-sync, no more manual Publish step there) — deploys now
happen via `.github/workflows/deploy.yml` (see Deployment below). The `@lovable.dev/vite-tanstack-config`
build-tooling dependency is unrelated to that editor connection and is still in use; leave it.

Lovable's export scaffolded a generic demo directory (fake DJs/venues/events, dashboards, a
booking-system vision — see the original spec if you need it) — that placeholder content and its
mock data layer were deliberately deleted (2026-07-13) once real content existed. **Only ship real
TRC Events content** — don't resurrect the mock DJ/venue/event directory pattern for new features;
build against real data (hardcoded event details, or the shared Supabase project once a feature
needs it) instead.

## Deployment

**One repo, one push.** This repo, `trcevents/TRC` (local folder
`C:\Users\mkepr\Documents\GitHub\trcevents-events-inspect`), is both the source and the live site.
`git push origin main` deploys trcevent.com: `.github/workflows/deploy.yml` runs `bun install
--frozen-lockfile` and `bun run build`, then publishes `dist/client` to GitHub Pages (Pages source
is set to "GitHub Actions"). It goes live 1–3 minutes after the push. Check the run with
`gh run list -R trcevents/TRC`. If the build fails, the previous deploy stays live.

- Never commit build output (`dist/`). CI builds it.
- Never force-push or rewrite history on `main`.
- The custom domain (`public/CNAME` → trcevent.com) and "Enforce HTTPS" are set in the repo's
  Pages settings.
- Local builds: bun isn't installed on the owner's machine, so use `node node_modules/vite/bin/vite.js build`.
- Edge functions in `supabase/functions/` are deployed separately with the Supabase CLI
  (project `xdjbgcqaynnzykrglgnf`, shared with other sites). Pushing does not deploy them.
- History: until 2026-11-25 the source lived in a separate repo and built HTML was committed to
  `trcevents/events`. On 2026-11-25 the site moved to this fresh repo, `trcevents/TRC`, starting
  from a single commit without that history. The old full history is kept locally on the
  `old-events-main` branch. Don't recreate the old setup, and don't add a second repo or
  cross-repo tokens.

## Commands

Package manager is **bun** (`bun.lock`, `bunfig.toml` present — don't use npm/yarn/pnpm). See `package.json` for scripts.

`bunfig.toml` enforces a 24h supply-chain guard (`minimumReleaseAge`) blocking newly published
package versions. Only add a package to `minimumReleaseAgeExcludes` after confirming with the
user.

## Architecture

**Routing.** File-based routing via TanStack Router, rooted at `src/routes/`. See
`src/routes/README.md` for the naming conventions (`$slug` dynamic segments, `{-$optional}`,
splats, `_layout`, `__root.tsx`). `src/routeTree.gen.ts` is auto-generated — never hand-edit it (it
regenerates automatically whenever `bun dev`/`bun run build` is running and a route file changes).
`src/routes/__root.tsx` is the single app shell (`RootShell` for the `<html>` doc, `RootComponent`
for the `Navbar`/`Outlet`/`Footer` layout) and also owns the global `notFoundComponent` /
`errorComponent`.

There are about 50 routes. Each route file in `src/routes/` is a thin wrapper that imports its
page from a `-<name>-page.tsx` file (the `-` prefix keeps it out of route generation).
`src/routes/index.tsx` renders the Irie Jerk & Juggling page at `/`. Event pages are
self-contained, with hardcoded copy where content is static and live Supabase reads only where the
data is genuinely dynamic (signups, leaderboard, door check-in, admin tools). Admin and other
private pages set `noindex`.

`/sitemap.xml` is the hand-maintained static file `public/sitemap.xml`. Keep it in sync when
public routes are added, removed or archived.

**SSR error handling (Lovable-specific plumbing — treat carefully).** There's a layered fallback
so a broken SSR render never shows a raw crash:
- `src/start.ts` — `createStart` request middleware that catches server errors and returns
  `renderErrorPage()` as a plain HTML `Response` (except for errors that already carry a
  `statusCode`, which are rethrown for normal handling).
- `src/server.ts` — wraps the TanStack Start server entry (`@tanstack/react-start/server-entry`).
  It also detects the case where h3 has already swallowed an in-handler throw into a generic JSON
  500 (`{"unhandled":true,"message":"HTTPError"}`) and replaces that response with the same
  rendered error page, pulling the real error via `consumeLastCapturedError()` for logging.
- `src/lib/error-capture.ts` — records the last uncaught `error`/`unhandledrejection` event
  out-of-band (5s TTL) so `server.ts` can log the real cause even after h3 has swallowed it.
- `src/lib/error-page.ts` — the static HTML string used for the above 500 fallback.
- `src/lib/lovable-error-reporting.ts` — `reportLovableError`, called from the root route's React
  `errorComponent`, forwards client-side render errors to `window.__lovableEvents.captureException`
  (a hook Lovable's editor listens on) — a no-op outside the Lovable iframe/preview.

**Vite config.** `@lovable.dev/vite-tanstack-config` already wires up `tanstackStart`, `viteReact`,
`tailwindcss`, `tsConfigPaths`, `nitro` (build-only, Cloudflare target), the dev-only component
tagger, `VITE_*` env injection, the `@` path alias, React/TanStack deduping, and the error-logger
plugins described above. Do not re-add any of these plugins manually in `vite.config.ts` — doing
so breaks the app with duplicate plugins. Only pass extra config through `defineConfig({ vite: {...} })`.

**UI components.** `src/components/ui/*` are shadcn/ui primitives (generated via the shadcn CLI per
`components.json` — style `new-york`, base color `slate`, icon library `lucide`). `src/components/site/*`
are the app-specific composed components: `Navbar`/`Footer` (site chrome, used on every page) and
`BrandIcons.tsx` (hand-traced TikTok/Pinterest SVGs — lucide-react doesn't ship those two). Import
both via the `@/*` alias (maps to `src/*`).

**Social links.** `src/lib/social.ts` exports `SOCIAL_LINKS` — the one place real social profile
URLs + contact email live. Both the Footer and any page linking out to socials should import from
here rather than hardcoding URLs inline.

**Design tokens.** `src/styles.css` defines the full design system as OKLCH CSS custom properties
(`:root` for light, `.dark` for the dark-first default theme) mapped into Tailwind utilities via
`@theme inline`. The brand is black + gold: `--color-gold`/`--color-gold-foreground` and
`font-display` (Playfair Display, headings) vs. the default sans (Jost, body) are used throughout
routes/components — follow this existing token set (all new colors must also be OKLCH) rather than
introducing arbitrary Tailwind colors.
