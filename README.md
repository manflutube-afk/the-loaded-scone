# The Loaded Scone Co.

Website for The Loaded Scone Co., 1 St Georges Arcade, Falmouth.

Built with [Astro](https://astro.build) and deployed to Cloudflare as a **Worker with
static assets**. `npm run build` turns `src/` into pre-rendered HTML in `dist/`, and
Cloudflare serves that. Pages are built ahead of time, so they load as fast as plain
HTML — the build exists so the source stays maintainable, not to slow anything down.

```
src/
  data/
    site.json          address, email, socials, nav — the one place to change them
    menu.json          the entire menu: every section, item and price
  layouts/Base.astro   <head>, meta tags, header + footer, script — written once
  components/
    Header.astro       site header and nav
    Footer.astro       footer
    CtaBand.astro      "Fresh. Loaded. Just for you." band
    MenuPanel.astro    renders one menu tab from menu.json
  lib/schema.js        Schema.org structured data, generated from the data files
  pages/
    index.astro        home page                → /
    menu.astro         the full menu            → /menu/
    404.astro          not-found page
    sitemap.xml.js     generates /sitemap.xml
  scripts/main.js      nav toggle, menu tabs, lightbox, seasonal reveal
  styles/style.css     the whole stylesheet

public/                copied to the site root as-is
  images/  audio/  robots.txt  _headers

dist/                  build output — COMMITTED to git (see Deploying), never edit by hand
```

## Local development

```bash
npm install
npm run dev
```

Astro's dev server runs at `http://localhost:4321` with live reload — save a file and
the browser updates.

To check the real production build under Cloudflare's own runtime (so `/menu/`, the
404 page and `_headers` behave exactly as they will live):

```bash
npm run build && npm run serve
```

## Deploying

This is a **Cloudflare Pages** project (`the-loaded-scone.pages.dev`) connected to
`manflutube-afk/the-loaded-scone`. Pushing to `main` deploys automatically.

> ### ⚠️ Always run `npm run build` before you commit
>
> Cloudflare has **no build command set**, so it publishes the `dist/` folder exactly
> as committed to git. `dist/` is therefore checked in on purpose — it is the thing
> that gets deployed.
>
> ```bash
> npm run build
> git add -A
> git commit -m "your change"
> git push
> ```
>
> Skip the build and your change goes into git but never reaches the live site,
> because the committed `dist/` still holds the previous version.

To deploy straight from this machine without going through git:

```bash
npm run deploy
```

### Letting Cloudflare do the building instead

Better long term, and removes the footgun above. In the project's **Build
configuration**, set **Build command** to `npm run build`. Then `dist/` no longer
needs to be committed — add it back to `.gitignore`, remove it with
`git rm -r --cached dist`, and delete this section.

## Editing the menu

**`src/data/menu.json` is the whole menu.** Change it and everything updates: the page,
the tab bar, and the structured data Google reads. You never have to touch HTML.

Each section has an `id`, a `label` (the tab text), a `price` (used for that section's
structured data) and a list of `blocks` rendered in order. A block is one of:

| Block | What it renders |
| --- | --- |
| `intro` | The section heading, price pill, blurb, tick list, milkshake size boxes |
| `cards` | The grid of item cards (`cols: 2` or `3`) |
| `build` | A "Build Your Own" panel with numbered steps |
| `columns` | The four-column milkshake flavour lists |
| `extras` | The "extras" boxes at the bottom of a section |
| `footnote` | The small print line |

To add a sweet scone, add one entry to that section's `cards` block:

```json
{ "num": "11", "name": "New Scone Name", "desc": "What goes on it." }
```

Add `"featured": true` and `"tag": "Best Seller"` to highlight it. To change a price,
edit the `price` on the section's `intro` block (what customers see) and the section's
top-level `price` (what Google is told) — they are separate because the pill can read
`from £6.95` while the structured data needs a bare number.

## Editing everything else

- **Address, email, social links, nav** — `src/data/site.json`. They appear in the
  header, footer and structured data automatically.
- **Home page copy** — `src/pages/index.astro`.
- **Seasonal "What's On"** — in `src/pages/index.astro`, between the
  `SEASONAL CARD START` / `SEASONAL CARD END` comments. Swap the `.season-card` block
  each season; the blurred tap-to-reveal and the sound come along automatically.
- **Styling** — `src/styles/style.css`.

## SEO

- Unique `<title>`, meta description and canonical URL per page.
- Open Graph and Twitter cards using `/images/social-share.jpg` (1200×630).
- Schema.org JSON-LD **generated from the data files**, so it cannot drift out of sync
  with the page: `Restaurant` and `WebSite` on the home page; `Menu` with all 57 items
  and their prices, plus `BreadcrumbList`, on the menu page.
- `sitemap.xml` generated at build time from the list of real pages.
- Descriptive `alt` text, explicit `width`/`height` on every image, lazy loading below
  the fold, one `<h1>` per page, a skip link, and ARIA roles on the menu tabs.
- CSS is fingerprinted by the build (`/_astro/index.<hash>.css`) and cached for a year
  via `_headers`; a new build gets a new filename, so there is nothing to purge.

### If the site moves to a different domain

Change `site` in `astro.config.mjs`. That single value feeds every canonical URL, Open
Graph tag, structured-data URL and the sitemap.

### Google Search Console

1. Add the site at [Search Console](https://search.google.com/search-console) as a
   **Domain** property (DNS TXT verification — easy since Cloudflare hosts the DNS).
2. Under **Sitemaps**, submit `sitemap.xml`.
3. **URL Inspection → Request indexing** on `/` and `/menu/` to be crawled sooner.
4. Check the menu markup with the
   [Rich Results Test](https://search.google.com/test/rich-results).

Worth more than anything on-page for a shop: claim the **Google Business Profile** for
the Falmouth address and point its menu link at `https://www.theloadedsconeco.co.uk/menu/`.

### Not filled in yet

Left out of the structured data on purpose, because wrong data is worse than none:

- **Opening hours** — add an `openingHoursSpecification` to `businessSchema()` in
  `src/lib/schema.js`, and consider showing them in the "Find Us" section.
- **Phone number** — the site says "call in store for the full number". Add a
  `telephone` field to the same function when you want it public.

## History

This started as a single 2.8 MB `loaded-scone-co-index.html` with inline CSS and
JavaScript and every image base64-embedded. That file is still on disk as a backup but
is **git-ignored and not deployed** — it is superseded, and editing it does nothing.
Delete it whenever you're happy.
