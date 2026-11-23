import { buildAbsoluteUrl, getNormalizedSiteUrl, site } from '../config/site';
import type { FaqItem } from '../config/siteConfig';
import type { Product, ProductStatus } from '../data/products';

type JsonLdObject = Record<string, unknown>;

const AVAILABILITY_MAP: Record<ProductStatus, string> = {
  AVAILABLE: 'https://schema.org/InStock',
  RESERVED: 'https://schema.org/LimitedAvailability',
  SOLD: 'https://schema.org/SoldOut',
};

function parsePhpPrice(price: string): string {
  const numeric = price.replace(/[^\d.]/g, '');
  return numeric || '0';
}

export function buildOrganizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: `${getNormalizedSiteUrl()}/`,
    logo: buildAbsoluteUrl(site.logo),
    sameAs: [site.facebookUrl],
  };
}

export function buildWebSiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: `${getNormalizedSiteUrl()}/`,
    description: site.defaultDescription,
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[]
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}

export function buildFaqSchema(items: FaqItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Outputs Product + Offer JSON-LD ONLY when previewMode is false AND product.isSample is false.
 * Never outputs Product schema for sample or preview listings.
 */
export function buildLiveProductSchemas(
  products: Product[],
  previewMode: boolean
): JsonLdObject[] {
  if (previewMode) {
    return [];
  }

  return products
    .filter((item) => !item.isSample)
    .map((item) => {
      const images = [item.frontImage, item.backImage]
        .filter((img) => Boolean(img) && !img.startsWith('data:'))
        .map((img) => buildAbsoluteUrl(img));

      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: item.name,
        description: `${item.brand} ${item.name}. Size ${item.size}. Condition: ${item.condition}. ${item.conditionNote}`,
        brand: {
          '@type': 'Brand',
          name: item.brand,
        },
        ...(images.length > 0 ? { image: images } : {}),
        offers: {
          '@type': 'Offer',
          url: `${getNormalizedSiteUrl()}/#latest-drop`,
          priceCurrency: 'PHP',
          price: parsePhpPrice(item.price),
          itemCondition: 'https://schema.org/UsedCondition',
          availability: AVAILABILITY_MAP[item.status],
        },
      };
    });
}
