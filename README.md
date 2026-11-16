## Feature organization

Each page owns a feature under `src/features/`, including its content, components, styles, assets, and any scripts or tests. Related modules keep separate responsibilities within that folder. Page-specific subfeatures live under their page.

`src/pages/` contains thin routing adapters that preserve the existing URLs. Shared UI and global configuration live in `src/common/`; common code does not import feature implementations or assets. npm commands and workflows invoke feature-owned scripts directly.

```text
src/
  pages/                         # Routes: /, /information, /visitor, /timeline, /404
  common/
    components/                  # Header/navigation, InfoBox, InfoBoxes, Illustration
    layouts/Layout.astro
    styles/                      # Typography, global styles, shared boxes
    assets/background.png
  features/
    home/                        # HomePage, carousel, styles, photos
    information/                 # InformationPage and illustrations
    visitor/                     # VisitorPage, photo carousel, hotel code, photos
    timeline/                    # TimelinePage and timeline styles
```

## Typography

Edit `src/common/styles/typography.css` to change content text across the entire site. Normal text uses `--page-text-*` and subtitles use `--page-subtitle-*`.

Font sizes, weights, letter spacing, line spacing, and mobile adjustments live there. Page and component styles inherit these settings; keep typography changes in this shared file. Small print uses `.page-text-small`; the hotel code keeps its distinct monospace font.

The complete header is defined in `src/common/components/Header.astro`: markup, names, date, navigation, spacing, and mobile styling. `Layout.astro` renders this same component on every page. Edit `--names-*`, `--header-date-*`, `--header-nav-gap`, and `--nav-*` there to adjust the header. Its row spacing is explicit and does not depend on paragraph line height.

All environments use the same Astro client-side navigation and normal browser caching. There are no development-only navigation or cache rules.

Astro 7.4.7 includes the [upstream ClientRouter stylesheet fix](https://github.com/withastro/astro/pull/17612), so live style edits remain current after navigation without disabling caching. Node.js 22.23.4 or newer is required.

Use `npm run dev` while editing. To test the production build locally, run `npm run build` followed by `npm run preview`; the generated `dist/` folder is also the deployment artifact. Rebuild before previewing further code changes.

## Wedding date and deployment

Change the visible wedding date directly in `src/common/components/Header.astro`. Rebuild and redeploy to publish changes.

`.github/workflows/pages.yml` builds and deploys the site on pushes to `master` and manual runs. The workflow supports project URLs and custom domains. To activate GitHub Pages, select **Settings > Pages > Source > GitHub Actions**. Nothing is published by local builds.

## Home page photos

Store carousel photos in `src/features/home/assets/photos/`. Astro optimizes these images during the build.

Add or remove photos directly in this folder without changing any code. Supported extensions are `.jpg`, `.jpeg`, `.png`, and `.webp` (lowercase or uppercase). Photos appear in filename order; use prefixes such as `01-`, `02-`, etc. to choose the order. Keep photos directly in the folder, rather than in subfolders.

The local development server picks up changes automatically. Rebuild and redeploy the site for changes to appear on the published website.

## Information page illustrations

The information feature owns its hand-drawn sketches in `src/features/information/assets/illustrations/`, as black strokes on transparent PNGs. They are registered by name in `src/features/information/illustrations.ts`; give an info item an `illustration` name in `InformationPage.astro` to show it. The feature passes image metadata to the common `InfoBox` renderer.

Each sketch is used as a CSS mask, so it is drawn in the page colour (`--text`) and changes with it. Draw new sketches in black on white and remove the white background before adding them; any grey becomes partial transparency. Every sketch is scaled to the same area, so tall and wide drawings carry equal weight. Draw all sketches at a similar size and line weight so their strokes match once scaled.

On wide screens the sketch sits beside the content and alternates left and right from box to box, while the title and text stay centred. On phones it sits above the title.

## Commands

Run these commands from the project root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development. |
| `npm run build` | Generate the production site in `dist/`. |
| `npm run preview` | Preview the latest production build locally. |
