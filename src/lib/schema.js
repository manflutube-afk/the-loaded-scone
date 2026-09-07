/* Schema.org structured data, built from the same data the pages render, so the
   two can never drift apart. */
import site from '../data/site.json';
import menu from '../data/menu.json';

const abs = (base, path) => new URL(path, base).href;

export function businessSchema(base) {
  const a = site.address;
  return {
    '@type': 'Restaurant',
    '@id': abs(base, '/') + '#business',
    name: site.name,
    alternateName: site.alternateName,
    description:
      'Independent Cornish scone shop in Falmouth serving handcrafted sweet and savoury loaded scones, Roskilly’s Cornish ice cream milkshakes, signature sundaes and banana splits. Eat in, take away, or order online for postal delivery.',
    url: abs(base, '/'),
    logo: abs(base, '/images/logo.jpg'),
    image: [
      abs(base, '/images/gallery-shopfront.jpg'),
      abs(base, '/images/gallery-counter.jpg'),
      abs(base, '/images/social-share.jpg'),
    ],
    email: site.email,
    servesCuisine: ['Cornish', 'Cafe', 'Desserts', 'Afternoon Tea'],
    priceRange: '££',
    currenciesAccepted: 'GBP',
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.locality,
      addressRegion: a.region,
      postalCode: a.postcode,
      addressCountry: a.country,
    },
    areaServed: [
      { '@type': 'City', name: a.locality },
      { '@type': 'AdministrativeArea', name: a.region },
    ],
    hasMenu: abs(base, '/menu/'),
    sameAs: Object.values(site.social),
  };
}

export function websiteSchema(base) {
  return {
    '@type': 'WebSite',
    '@id': abs(base, '/') + '#website',
    url: abs(base, '/'),
    name: site.name,
    publisher: { '@id': abs(base, '/') + '#business' },
    inLanguage: 'en-GB',
  };
}

/** Every named, described item in a section — card grids and the milkshake columns. */
function itemsOf(section) {
  const out = [];
  for (const block of section.blocks) {
    if (block.type === 'cards') {
      for (const it of block.items) out.push({ name: it.name, description: it.desc });
    }
    if (block.type === 'columns') {
      for (const col of block.columns) {
        for (const it of col.items) out.push({ name: it.name, description: it.desc });
      }
    }
  }
  return out;
}

export function menuSchema(base, description) {
  return {
    '@type': 'Menu',
    '@id': abs(base, '/menu/') + '#menu',
    name: `${site.name} Menu`,
    url: abs(base, '/menu/'),
    inLanguage: 'en-GB',
    description,
    hasMenuSection: menu.sections.map((section) => ({
      '@type': 'MenuSection',
      name: section.schemaName,
      hasMenuItem: itemsOf(section).map((it) => ({
        '@type': 'MenuItem',
        name: it.name,
        description: it.description,
        offers: { '@type': 'Offer', price: section.price, priceCurrency: 'GBP' },
      })),
    })),
  };
}

export function breadcrumbSchema(base, trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(base, t.path),
    })),
  };
}

export function webPageSchema(base, { path, name, description, primaryImage }) {
  return {
    '@type': 'WebPage',
    '@id': abs(base, path) + '#webpage',
    url: abs(base, path),
    name,
    description,
    isPartOf: { '@id': abs(base, '/') + '#website' },
    about: { '@id': abs(base, '/') + '#business' },
    ...(primaryImage
      ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(base, primaryImage) } }
      : {}),
  };
}
