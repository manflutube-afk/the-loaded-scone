// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Used for canonical URLs, Open Graph tags, structured data and the sitemap.
  // Change this one value if the site moves to a different domain.
  site: 'https://www.theloadedsconeco.co.uk',
  // Pre-rendered HTML. Cloudflare serves dist/ as static assets; there is no server.
  output: 'static',
  build: {
    // /menu -> dist/menu/index.html, so the live URL stays /menu/.
    format: 'directory',
  },
});
