# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static Astro 6 wedding website for Lars & Malene (Bergen), published to GitHub Pages. All user-facing text is Norwegian (bokmål, `lang="no"`) — keep new copy, alt text and aria labels in Norwegian. There is no JS framework; interactivity is vanilla custom elements in `<script>` blocks (e.g. `home-photo-carousel` in `src/pages/index.astro`, `visitor-carousel` in `src/components/PhotoInfoBox.astro`).

## Commands

Requires Node >= 22.12.

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — build to `dist/` (local builds are never published)
- `npm run preview` — serve the built site
- `npm run test:weather` — weather tests (`node --test scripts/weather.test.mjs`); run one test with `node --test --test-name-pattern="<name>" scripts/weather.test.mjs`
- `npm run weather:update` — fetch MET forecast into `src/data/weather.json` (rebuild to display)

There is no linter or other test suite.

## Architecture

**Single source of truth for the date:** `src/config/wedding.mjs` (`WEDDING_DATE`, YYYY-MM-DD). The header date label, weather date, API window (`FORECAST_DAYS` = 21, `LOCATION_FORECAST_DAYS` = 10) and the scheduled publishing window all derive from it. It's plain `.mjs` so the Astro site, the Node scripts and the GitHub workflow can all import it. Change the date only there.

**Weather is build-time only.** Browsers never call MET's API.
- `scripts/weather.mjs` — pure selection logic (Oslo timezone conversion, symbol mapping, choosing Locationforecast period nearest 15:00 vs. Subseasonal daily summary, fallback). This is what the tests cover.
- `scripts/update-weather.mjs` — does the fetching: identifies itself to MET via User-Agent, honours `Expires`/`If-Modified-Since`, caches raw responses in `.cache/` (gitignored), keeps the saved forecast on transient failures, makes no calls before wedding date − 21 days, and requests Locationforecast only from − 10 days.
- `src/data/weather.json` — generated output; don't edit by hand. Forecasts cached for a different wedding date are ignored.
- `src/config/weather-copy.mjs` — Norwegian intro messages chosen from the forecast; `src/components/WeatherForecast.astro` renders it.
- Test fixtures use a fixed date (`FIXTURE_DATE`), independent of the configured wedding date.

**Deployment:** `.github/workflows/pages.yml` runs on pushes to `master`, manual dispatch, and every 6 hours. `scripts/check-weather-window.mjs` gates scheduled runs so they only publish within the forecast window. The build job restores the weather cache, runs the tests, updates the weather and builds with `SITE_URL`/`BASE_PATH` from `configure-pages`.

**Base path:** `astro.config.mjs` reads `BASE_PATH`, so the site works under both a project URL and a custom domain. Internal links and `public/` assets must be prefixed with `import.meta.env.BASE_URL` (see the `base` const in `src/layouts/Layout.astro`) — never hard-code `/foo`.

**Layout & pages:** `src/layouts/Layout.astro` holds the header, nav (RSVP is an external Google Form) and Astro `ClientRouter` view transitions; pages pass `activePage` to highlight the nav. Because of `ClientRouter`, client scripts must survive page swaps: custom elements guard `customElements.define` and clean up in `disconnectedCallback`. Content pages (`information`, `visitor`) are built from data arrays rendered through `InfoBoxes` / `InfoBox` / `PhotoInfoBox`. Styles live per feature in `src/styles/` and are imported by the component that uses them.

**Images:** the home carousel auto-loads every image in `src/assets/lama_photos/` via `import.meta.glob`, sorted by filename (use `01-`, `02-` prefixes to order; no subfolders; jpg/jpeg/png/webp in either case). No code change is needed to add or remove photos. Bergen photos in `src/assets/bergen_photos/` are imported explicitly in `src/pages/visitor.astro` with location captions. All images go through `astro:assets` for optimization to webp.

## Operational notes

- GitHub may disable scheduled workflows after 60 days without repo activity — make sure the workflow is enabled and run it manually once before the final three weeks.
- GitHub Pages must have **Settings → Pages → Source → GitHub Actions** selected.
