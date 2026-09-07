/* Generated at build time so it can never drift from the pages that exist. */
const PAGES = [
  {
    path: '/',
    priority: '1.0',
    images: [
      '/images/gallery-shopfront.jpg',
      '/images/gallery-counter.jpg',
      '/images/roskillys-ice-cream.jpg',
    ],
  },
  { path: '/menu/', priority: '0.9', images: [] },
];

export async function GET({ site }) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const abs = (p) => new URL(p, site).href;

  const urls = PAGES.map(({ path, priority, images }) => [
    '  <url>',
    `    <loc>${abs(path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    '    <changefreq>monthly</changefreq>',
    `    <priority>${priority}</priority>`,
    ...images.map((i) => `    <image:image><image:loc>${abs(i)}</image:loc></image:image>`),
    '  </url>',
  ].join('\n')).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
