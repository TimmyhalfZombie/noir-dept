import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {
  buildAbsoluteUrl,
  getNormalizedSiteUrl,
  getOgImageUrl,
  indexableRoutes,
  seoRoutes,
  site,
  type SeoRouteConfig,
} from './src/config/site';
import {siteConfig} from './src/config/siteConfig';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from './src/lib/schema';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildRouteHtml(
  baseHtml: string,
  route: SeoRouteConfig,
  schemas: Record<string, unknown>[]
): string {
  const title = escapeHtmlAttr(route.title);
  const description = escapeHtmlAttr(route.description);
  const canonical = escapeHtmlAttr(buildAbsoluteUrl(route.path));
  const ogImage = escapeHtmlAttr(getOgImageUrl());
  const ogAlt = escapeHtmlAttr(site.ogImageAlt);
  const siteName = escapeHtmlAttr(site.name);
  const locale = escapeHtmlAttr(site.locale);
  const themeColor = escapeHtmlAttr(site.themeColor);

  let html = baseHtml;

  // Replace title
  html = html.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    `<title data-rh="true">${title}</title>`
  );

  // Replace standard meta description & theme-color
  html = html.replace(
    /<meta\s+(?:[^>]*?\s+)?name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta data-rh="true" name="description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+(?:[^>]*?\s+)?name="theme-color"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="theme-color" content="${themeColor}" />`
  );

  // Replace or remove canonical; inject robots noindex for 404
  if (route.noindex) {
    html = html.replace(
      /<link\s+(?:[^>]*?\s+)?rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      '<meta data-rh="true" name="robots" content="noindex" />'
    );
  } else {
    html = html.replace(
      /<link\s+(?:[^>]*?\s+)?rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link data-rh="true" rel="canonical" href="${canonical}" />`
    );
  }

  // Sync Open Graph tags
  html = html
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:type"\s+content="[^"]*"\s*\/?>/i,
      '<meta data-rh="true" property="og:type" content="website" />'
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:site_name" content="${siteName}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:title" content="${title}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:description" content="${description}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:url" content="${canonical}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:image" content="${ogImage}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:image:width"\s+content="[^"]*"\s*\/?>/i,
      '<meta data-rh="true" property="og:image:width" content="1200" />'
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:image:height"\s+content="[^"]*"\s*\/?>/i,
      '<meta data-rh="true" property="og:image:height" content="630" />'
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:image:alt" content="${ogAlt}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?property="og:locale"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" property="og:locale" content="${locale}" />`
    );

  // Sync Twitter tags
  html = html
    .replace(
      /<meta\s+(?:[^>]*?\s+)?name="twitter:card"\s+content="[^"]*"\s*\/?>/i,
      '<meta data-rh="true" name="twitter:card" content="summary_large_image" />'
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" name="twitter:title" content="${title}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" name="twitter:description" content="${description}" />`
    )
    .replace(
      /<meta\s+(?:[^>]*?\s+)?name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta data-rh="true" name="twitter:image" content="${ogImage}" />`
    );

  // Inject static JSON-LD blocks before </head>
  if (schemas.length > 0) {
    const jsonLdBlock = schemas
      .map(
        (schema) =>
          `    <script data-rh="true" type="application/ld+json">${JSON.stringify(schema)}</script>`
      )
      .join('\n');
    html = html.replace(/<\/head>/i, `${jsonLdBlock}\n  </head>`);
  }

  return html;
}

function generateRobotsTxt(): string {
  const baseUrl = getNormalizedSiteUrl();
  return `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

function generateSitemapXml(lastmod: string): string {
  const urls = indexableRoutes
    .map(
      (route) => `  <url>
    <loc>${buildAbsoluteUrl(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq ?? 'monthly'}</changefreq>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function noirDeptSeoPlugin(): Plugin {
  return {
    name: 'noir-dept-seo-prerender',
    transformIndexHtml(html) {
      return buildRouteHtml(html, seoRoutes.home, []);
    },
    closeBundle(error?: Error): void {
      if (error) {
        return;
      }

      const distDir = path.resolve(__dirname, 'dist');
      const publicDir = path.resolve(__dirname, 'public');
      const distIndexPath = path.resolve(distDir, 'index.html');

      if (!fs.existsSync(distDir) || !fs.existsSync(distIndexPath)) {
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const robotsTxt = generateRobotsTxt();
      const sitemapXml = generateSitemapXml(today);

      // Write synced robots.txt and sitemap.xml to both dist/ and public/
      fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt, 'utf8');
      fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
      if (fs.existsSync(publicDir)) {
        fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robotsTxt, 'utf8');
        fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
      }

      // Prerender route-specific static HTML shells (meta, OG, Twitter, canonical, JSON-LD)
      const baseHtml = fs.readFileSync(distIndexPath, 'utf8');

      const routeOutputs: {
        outFile: string;
        route: SeoRouteConfig;
        schemas: Record<string, unknown>[];
      }[] = [
        {
          outFile: path.resolve(distDir, 'index.html'),
          route: seoRoutes.home,
          schemas: [buildOrganizationSchema(), buildWebSiteSchema()],
        },
        {
          outFile: path.resolve(distDir, 'about', 'index.html'),
          route: seoRoutes.about,
          schemas: [
            buildBreadcrumbSchema([
              {name: 'Home', path: '/'},
              {name: 'About', path: '/about'},
            ]),
          ],
        },
        {
          outFile: path.resolve(distDir, 'services', 'index.html'),
          route: seoRoutes.services,
          schemas: [
            buildBreadcrumbSchema([
              {name: 'Home', path: '/'},
              {name: 'Services', path: '/services'},
            ]),
            buildFaqSchema(siteConfig.services.faq.items),
          ],
        },
        {
          outFile: path.resolve(distDir, 'privacy', 'index.html'),
          route: seoRoutes.privacy,
          schemas: [
            buildBreadcrumbSchema([
              {name: 'Home', path: '/'},
              {name: 'Privacy', path: '/privacy'},
            ]),
          ],
        },
        {
          outFile: path.resolve(distDir, '404.html'),
          route: seoRoutes.notFound,
          schemas: [],
        },
      ];

      for (const entry of routeOutputs) {
        fs.mkdirSync(path.dirname(entry.outFile), {recursive: true});
        const rendered = buildRouteHtml(baseHtml, entry.route, entry.schemas);
        fs.writeFileSync(entry.outFile, rendered, 'utf8');
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      noirDeptSeoPlugin(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
