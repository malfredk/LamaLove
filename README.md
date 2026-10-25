## Wedding weather

The weather box is rendered as static HTML. Browsers never call MET's API.
`npm run weather:update` saves the forecast to `src/data/weather.json`; rebuild to display it.

**Change the wedding date only in `src/config/wedding.mjs` (`WEDDING_DATE`, YYYY-MM-DD).** The header, weather date label, API selection, and scheduled publishing window all derive from this value. Run `npm run weather:update` and rebuild locally, or push the config change to trigger the workflow. `src/data/weather.json` is generated data; do not edit its date manually. Cached forecasts for another wedding date are ignored.

- Before the wedding date enters forecast coverage: rain illustration only.
- Once available: Subseasonal's daily temperature range and probability of precipitation for the configured wedding date.
- When an afternoon summary is available: Locationforecast takes priority, using a period nearest 15:00 in Europe/Oslo (preferably 12:00–18:00). Temperature is measured at the start of that period.

The updater identifies this repository to MET, honours cache expiry and conditional requests, and keeps a saved forecast on transient failures. No API calls are made before wedding date minus 21 days; Locationforecast is requested from wedding date minus 10 days. After the wedding, the saved forecast for that date is retained. Raw API responses are cached in `.cache/` (not committed).

`.github/workflows/pages.yml` builds and publishes GitHub Pages on pushes to `master`, manual runs, and every six hours from wedding date minus 21 days through the wedding day. It reads the same config as the site and updater. It supports both project URLs and custom domains. To activate it after pushing these changes, select **Settings → Pages → Source → GitHub Actions**. Nothing is published by local builds.

GitHub may disable scheduled workflows in public repositories after 60 days without repository activity. **Check that the workflow is enabled before the final three weeks**, and run it manually once. Schedules may be delayed by GitHub; the displayed update time comes from MET. GitHub caches can be evicted, in which case a fresh request is made during the forecast window.

Run `npm run test:weather` for selection, fallback, and timezone checks.
API references: [Subseasonal](https://api.met.no/weatherapi/subseasonal/1.0/documentation), [Locationforecast](https://api.met.no/weatherapi/locationforecast/2.0/documentation), [MET terms](https://docs.api.met.no/doc/TermsOfService).

## Home page photos

Store carousel photos in `src/assets/lama_photos/`. Astro optimizes these images during the build.

Add or remove photos directly in this folder without changing any code. Supported extensions are `.jpg`, `.jpeg`, `.png`, and `.webp` (lowercase or uppercase). Photos appear in filename order; use prefixes such as `01-`, `02-`, etc. to choose the order. Keep photos directly in the folder, rather than in subfolders.

The local development server picks up changes automatically. Rebuild and redeploy the site for changes to appear on the published website.

# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
