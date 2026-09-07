# The Loaded Scone Co.

Static site for The Loaded Scone Co., 1 St Georges Arcade, Falmouth, deployed to
Cloudflare as a **Worker with static assets** (the successor to Cloudflare Pages —
same idea, current product).

`public/` is the deploy root — everything in it is served at the site root, nothing
outside it is published. There is no Worker script; files are served directly.

```
public/
  index.html              home page              → /
  menu/index.html         the full menu          → /menu/
  404.html                not-found page
  style.css               one stylesheet, shared by every page
  script.js               one script, shared by every page
  robots.txt
  sitemap.xml
  _headers                cache + security headers (parsed by Cloudflare, not served)
  images/                 all photography and logos
  audio/witch-laugh.mp3   the "What's On" spooky reveal sound
```

No build step. Edit the HTML/CSS/JS directly, commit, and Cloudflare rebuilds.

## Local preview

```bash
npm install
npm run dev
```

Serves at `http://localhost:8787` by default (`npm run dev -- --port 8796` to pick a port).
This runs Cloudflare's own runtime, so `/menu/`, the 404 page and `_headers` all behave
exactly as they will in production.

## Deploying

### Git integration (how this is set up)

The Cloudflare project is connected to `manflutube-afk/the-loaded-scone`. Every push to
`main` builds and deploys automatically; other branches get preview URLs.

The build configuration in the Cloudflare dashboard is:

| Field | Value |
| --- | --- |
| Build command | *(none)* |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` |
| Root directory | `/` |

There is no build step — `wrangler deploy` just uploads `public/`. All the routing
configuration lives in `wrangler.toml`, so the dashboard needs nothing else.

### Deploying by hand

```bash
npm run deploy
```

### A note on Pages vs Workers

This started out configured for Cloudflare Pages (`pages_build_output_dir`), but the
dashboard now creates **Workers** projects by default, and `wrangler deploy` refuses a
Pages config — which is what made the first build fail. `wrangler.toml` now uses the
Workers `[assets]` block instead. Behaviour is the same, `_headers` and `_redirects`
are supported either way, and Workers is the actively developed product.

## The menu page

The full menu lives at `/menu/` as its own page, so it can be linked, bookmarked,
printed and indexed by Google on its own. The home page carries a short preview
section that links into it.

Each menu tab is deep-linkable — these URLs open the page with that tab already
selected, which is what the home-page preview cards link to:

- `/menu/#sweet`
- `/menu/#savoury`
- `/menu/#milkshakes`
- `/menu/#sundaes`
- `/menu/#banana-splits`

Clicking a tab also updates the address bar, so any tab can be copied and shared.

## Editing the menu

`public/menu/index.html` is the only place menu items live. Each tab is a
`<div class="tab-panel" id="tab-...">` block; items inside are `.menu-card` blocks:

```html
<div class="menu-card"><h4><span class="num">11</span> New Scone Name</h4><p>Its toppings.</p></div>
```

Add `class="menu-card featured"` and a `<span class="tag">Best Seller</span>` inside
the `<h4>` to highlight one.

If you add, remove or reprice items, also update the matching entry in the
`application/ld+json` block in that file's `<head>` — that is the structured data
Google reads to show your menu in search results. It currently lists all 57 items
with their prices.

## SEO

Already in place:

- Unique `<title>`, meta description and `<link rel="canonical">` on each page.
- Open Graph and Twitter card tags pointing at `/images/social-share.jpg` (1200×630).
- Schema.org structured data: `Restaurant` (with address and social profiles) plus
  `WebSite` on the home page; `Menu` with all 57 items and prices, plus a
  `BreadcrumbList`, on the menu page.
- `sitemap.xml` and `robots.txt`.
- Descriptive `alt` text, explicit `width`/`height` on every image (prevents layout
  shift), and lazy loading below the fold.
- One `<h1>` per page, a skip-to-content link, and ARIA roles on the menu tabs.

### If the site moves to a different domain

Every absolute URL uses `https://www.theloadedsconeco.co.uk`. If the site ends up on
a different domain, find and replace that string across `public/` — it appears in the
canonical tags, Open Graph tags, structured data, `robots.txt` and `sitemap.xml`.

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console) and add the
   site as a **Domain** property (verified with a DNS TXT record — Cloudflare makes
   this easy since it already hosts the DNS) or as a **URL prefix** property.
2. Under **Sitemaps**, submit: `sitemap.xml`
3. Use **URL Inspection → Request indexing** on `/` and `/menu/` to get them crawled
   sooner than the normal schedule.
4. Check **Enhancements → Merchant listings / Structured data** after a few days to
   confirm the menu markup was picked up. You can test it any time with the
   [Rich Results Test](https://search.google.com/test/rich-results).

Also worth doing, and worth more than anything on-page for a shop like this: claim and
fill in the **Google Business Profile** for the Falmouth address, and set its menu link
to `https://www.theloadedsconeco.co.uk/menu/`.

### Not filled in yet

Two things were deliberately left out of the structured data rather than guessed at,
because wrong data is worse than none:

- **Opening hours** — add an `openingHoursSpecification` block to the `Restaurant`
  schema in `public/index.html`, and consider showing them in the "Find Us" section.
- **Phone number** — the site currently says "call in store for the full number".
  Add a `telephone` field to the same schema once you want it public.

## Seasonal "What's On"

`public/index.html` has a clearly marked block:

```html
<!-- SEASONAL CARD START ... -->
...
<!-- SEASONAL CARD END -->
```

Swap the `.season-card` inside it each season. The blurred tap-to-reveal behaviour and
the sound come along automatically.

## The original single-file version

This site started as one 2.8 MB `loaded-scone-co-index.html` with the CSS, JavaScript
and every image base64-embedded in it. That file is still on disk as a backup but is
**git-ignored and not deployed** — it is superseded, and editing it would do nothing.
Delete it whenever you're happy with the split version.
