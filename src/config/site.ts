export const site = {
  siteUrl: 'https://noirdept.ai.studio', // Live domain: og:image, canonical, sitemap use it
  name: 'NOIR DEPT.',
  tagline: 'Streetwear • Rare Finds',
  slogan: 'Wear the past. Keep the style.',
  defaultDescription:
    'Secondhand branded streetwear with real photos and honest condition. New drops posted on Facebook.',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61596666997168',
  locale: 'en_PH',
  themeColor: '#0D0D0D',
  ogImage: '/og-image.jpg',
  ogImageAlt: 'NOIR DEPT.',
  logo: '/icon-512.png',
  lastUpdated: '2026-11-22',
  lastUpdatedDisplay: 'November 22, 2026',
} as const;

export interface SeoRouteConfig {
  path: string;
  title: string;
  description: string;
  changefreq?: 'weekly' | 'monthly';
  noindex?: boolean;
}

export const seoRoutes = {
  home: {
    path: '/',
    title: 'NOIR DEPT.',
    description:
      'Secondhand branded streetwear with real photos and honest condition. New drops posted on Facebook.',
    changefreq: 'weekly',
  },
  about: {
    path: '/about',
    title: 'About - NOIR DEPT.',
    description:
      'An independent shop for secondhand branded streetwear. Fewer pieces, picked with care.',
    changefreq: 'monthly',
  },
  services: {
    path: '/services',
    title: 'How We Work - NOIR DEPT.',
    description:
      'Drops, item inquiries, condition reports, sourcing requests and how to buy from NOIR DEPT.',
    changefreq: 'monthly',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy - NOIR DEPT.',
    description: 'How NOIR DEPT. handles your information.',
    changefreq: 'monthly',
  },
  notFound: {
    path: '/404',
    title: 'Page Not Found - NOIR DEPT.',
    description: "This page doesn't exist, or it's sold out.",
    noindex: true,
  },
} as const satisfies Record<string, SeoRouteConfig>;

export const indexableRoutes: SeoRouteConfig[] = [
  seoRoutes.home,
  seoRoutes.about,
  seoRoutes.services,
  seoRoutes.privacy,
];

export function getNormalizedSiteUrl(): string {
  return site.siteUrl.replace(/\/+$/, '');
}

export function buildAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = getNormalizedSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === '/' ? `${base}/` : `${base}${normalizedPath}`;
}

export function getOgImageUrl(): string {
  return buildAbsoluteUrl(site.ogImage);
}
