## Feature organization

Each page owns a feature under `src/features/`, including its content, components, styles, assets, and any scripts or tests. Related modules keep separate responsibilities within that folder. Page-specific subfeatures live under their page, so weather belongs to `information/weather/`.

`src/pages/` contains thin routing adapters that preserve the existing URLs. Shared UI and global configuration live in `src/common/`; common code does not import feature implementations or assets. npm commands and workflows invoke feature-owned scripts directly.

```text
src/
  pages/                         # Routes: /, /information, /visitor, /timeline, /404
  common/
    components/                  # Header/navigation, InfoBox, InfoBoxes, Illustration
    layouts/Layout.astro
    styles/                      # Typography, global styles, shared boxes
    config/wedding.mjs
    assets/background.png
  features/
    home/                        # HomePage, carousel, styles, photos
    information/                 # InformationPage, illustrations, weather subfeature
      weather/                   # UI, preview, data, logic, scripts, tests, assets
    visitor/                     # VisitorPage, photo carousel, hotel code, photos
    timeline/                    # TimelinePage and timeline styles
```

Weather's Node-only API/cache/filesystem orchestration lives in `information/weather/update.mjs`; the display component imports only its data, configuration, presentation helpers, and illustrations. Its CLI scripts (`update-weather.mjs` and `check-weather-window.mjs`) live alongside that implementation.

## Local weather preview

Run `npm run dev` and open `/weather-test` to compare all weather scenarios using example data. The preview source lives in `src/features/information/weather/WeatherPreview.astro` and can be committed. Astro registers this route only during development; `npm run build` excludes it, including builds run by GitHub Actions.

## Typography

Edit `src/common/styles/typography.css` to change content text across the entire site. Normal text uses `--page-text-*` and subtitles use `--page-subtitle-*`.

Font sizes, weights, letter spacing, line spacing, and mobile adjustments live there. Page and component styles inherit these settings; keep typography changes in this shared file. Small print uses `.page-text-small`; the hotel code keeps its distinct monospace font.

The complete header is defined in `src/common/components/Header.astro`: markup, names, date, navigation, spacing, and mobile styling. `Layout.astro` renders this same component on every page. Edit `--names-*`, `--header-date-*`, `--header-nav-gap`, and `--nav-*` there to adjust the header. Its row spacing is explicit and does not depend on paragraph line height.

All environments use the same Astro client-side navigation and normal browser caching. There are no development-only navigation or cache rules.

Astro 7.4.7 includes the [upstream ClientRouter stylesheet fix](https://github.com/withastro/astro/pull/17612), so live style edits remain current after navigation without disabling caching. Node.js 22.23.4 or newer is required.

Use `npm run dev` while editing. To test the production build locally, run `npm run build` followed by `npm run preview`; the generated `dist/` folder is also the deployment artifact. Rebuild before previewing further code changes.

## Wedding weather

The weather box is rendered as static HTML. Browsers never call MET's API.
`npm run weather:update` saves the forecast to `src/features/information/weather/weather.json`; `npm run build` reads that file and renders it. Neither `npm run dev` nor `npm run build` fetches weather automatically. The development server picks up a saved forecast change; production needs a new build and deployment.

### Files and responsibilities

| File | Responsibility |
| --- | --- |
| `src/common/config/wedding.mjs` | Shared wedding date, Norwegian timezone, and header date label. |
| `src/features/information/weather/config.mjs` | Bergen coordinates, Yr link, fallback forecast, forecast type, rain-message threshold, and the 21-day/10-day request windows. |
| `src/features/information/weather/copy.mjs` | Editable Norwegian messages. Dates and month follow the shared wedding configuration. |
| `src/features/information/weather/check-weather-window.mjs` | Tells GitHub Actions whether a scheduled run should publish. Pushes and manual runs always publish. |
| `src/features/information/weather/update-weather.mjs` | Thin CLI entry point that calls the weather feature's updater. |
| `src/features/information/weather/update.mjs` | Orchestrates reading saved data, requesting MET data with caching, choosing a forecast and saving the result. |
| `src/features/information/weather/selection.mjs` | Pure selection rules: interpret MET symbols, select the wedding date/afternoon, then prefer Locationforecast over Subseasonal over fallback. No requests or file writes. |
| `src/features/information/weather/weather.json` | The small, selected forecast that the site displays. Generated by the updater; not a raw API response. |
| `.cache/weather-api.json` | Raw MET responses and HTTP cache headers, used only by the updater. Ignored by Git. |
| `src/features/information/weather/presentation.mjs` | Chooses the introduction and illustration, and formats the rain probability and temperature. |
| `src/features/information/weather/WeatherForecast.astro` | Reads the selected forecast, rejects a saved forecast for another wedding date and renders the weather box. Accepts example data for the local preview. |
| `src/features/information/weather/WeatherPreview.astro` | Example scenarios at `/weather-test`, registered by `astro.config.mjs` only during `npm run dev`. |
| `src/features/information/weather/illustrations.ts` and `assets/` | Weather illustration registry and transparent PNG assets, passed into the shared illustration renderer. |
| `src/features/information/weather/weather.test.mjs` | Offline tests for selection, timezone, presentation, cache reuse and failed API requests. |

### Execution order

1. `.github/workflows/pages.yml` starts on a push to `master`, a manual run or the six-hour schedule. `check-weather-window.mjs` skips scheduled publishing outside the forecast window; pushes and manual runs continue regardless of the date.
2. The build job restores cached data, installs dependencies and runs the weather tests.
3. `npm run weather:update` checks today's date in `Europe/Oslo`. Before the forecast window it writes the fallback without API requests. Inside the window it loads Subseasonal first, then Locationforecast once within ten days. Fresh HTTP cache entries avoid requests; expired entries are revalidated with `If-Modified-Since`.
4. The feature's `selection.mjs` selects the result: usable Locationforecast afternoon summary, otherwise Subseasonal daily data, otherwise fallback. If no usable result is available, the updater retains a previously saved forecast for the same wedding date. After the wedding it preserves that date's saved forecast without requests.
5. The updater writes the selected result and raw API cache separately. `npm run build` renders the result into static HTML using the presentation helpers and weather component.
6. GitHub Actions uploads `dist/` and deploys it to GitHub Pages. Visitors receive that built forecast; it changes on the next successful update, build and deployment.

### Display rules

| Forecast | Illustration | Text and numbers |
| --- | --- | --- |
| Fallback, before a usable forecast exists | Open umbrella | General Bergen wedding message; no weather measurements. |
| Subseasonal | Clouds with folded umbrella | Daily min/max temperature and rain probability. At 50% or above after rounding, use the rain message; below that, use the hopeful dry-weather message. This source cannot establish sunshine. |
| Locationforecast: sun | Sun | Sunshine message and a temperature at the start of the selected period. |
| Locationforecast: cloudy/partly cloudy | Clouds | Dry-weather message and temperature. |
| Locationforecast: rain/thunder | Open umbrella | Rain message and temperature. |
| Locationforecast: snow/sleet | Open umbrella | General weather message and temperature. |
| Unknown symbol | Clouds with folded umbrella | General weather message, with temperature if available. |

Subseasonal's saved `icon: "rain"` is a legacy placeholder; presentation deliberately uses its source and probability instead. The numeric probability takes priority over the description, so both displayed percentage and introduction agree. Invalid measurements are omitted.

**Change the wedding date only in `src/common/config/wedding.mjs` (`WEDDING_DATE`, YYYY-MM-DD).** The header, weather text dates, API selection, and scheduled publishing window all derive from this value. Run `npm run weather:update` and rebuild locally, or push the config change to trigger the workflow. `src/features/information/weather/weather.json` is generated data; do not edit its date manually. Saved forecasts for another wedding date are ignored.

Locationforecast selects periods starting between 12:00 and 18:00 in `Europe/Oslo`, favouring a midpoint near 15:00 and six-hour summaries on equal scores. A period can extend beyond 18:00 when that is the available summary. Temperature is measured at the start of the selected period.

The workflow supports project URLs and custom domains. To activate GitHub Pages, select **Settings → Pages → Source → GitHub Actions**. Nothing is published by local builds.

GitHub may disable scheduled workflows in public repositories after 60 days without repository activity. **Check that the workflow is enabled before the final three weeks**, and run it manually once. Schedules may be delayed by GitHub. The saved `updatedAt` comes from MET and is not currently displayed. GitHub caches can be evicted, in which case a fresh request is made during the forecast window.

Run `npm run test:weather` for offline selection, fallback, timezone, presentation and HTTP-cache checks. Tests use fake API responses and make no network requests.
API references: [Subseasonal](https://api.met.no/weatherapi/subseasonal/1.0/documentation), [Locationforecast](https://api.met.no/weatherapi/locationforecast/2.0/documentation), [MET terms](https://docs.api.met.no/doc/TermsOfService).

## Home page photos

Store carousel photos in `src/features/home/assets/photos/`. Astro optimizes these images during the build.

Add or remove photos directly in this folder without changing any code. Supported extensions are `.jpg`, `.jpeg`, `.png`, and `.webp` (lowercase or uppercase). Photos appear in filename order; use prefixes such as `01-`, `02-`, etc. to choose the order. Keep photos directly in the folder, rather than in subfolders.

The local development server picks up changes automatically. Rebuild and redeploy the site for changes to appear on the published website.

## Information page illustrations

The information feature owns its hand-drawn sketches in `src/features/information/assets/illustrations/`, as black strokes on transparent PNGs. They are registered by name in `src/features/information/illustrations.ts`; give an info item an `illustration` name in `InformationPage.astro` to show it. The feature passes image metadata to the common `InfoBox` renderer. Weather owns its couple illustrations separately in `src/features/information/weather/assets/`.

Each sketch is used as a CSS mask, so it is drawn in the page colour (`--text`) and changes with it. Draw new sketches in black on white and remove the white background before adding them; any grey becomes partial transparency. Every sketch is scaled to the same area, so tall and wide drawings carry equal weight. Draw all sketches at a similar size and line weight so their strokes match once scaled.

On wide screens the sketch sits beside the content and alternates left and right from box to box, while the title and text stay centred. On phones it sits above the title.

## Commands

Run these commands from the project root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development, including `/weather-test`. |
| `npm run build` | Generate the production site in `dist/`. |
| `npm run preview` | Preview the latest production build locally. |
| `npm run weather:update` | Update the saved weather forecast using date windows and HTTP caching. |
| `npm run test:weather` | Run the weather feature's offline tests. |
