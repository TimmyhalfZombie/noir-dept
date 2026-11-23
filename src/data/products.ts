export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface ProductMeasurements {
  pitToPit: string;
  length: string;
  sleeve: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  size: string;
  condition: string;
  conditionNote: string;
  price: string;
  status: ProductStatus;
  measurements: ProductMeasurements;
  frontImage: string;
  backImage: string;
  isSample: boolean;
}

export function getProductImageAlt(
  product: Pick<Product, 'brand' | 'name'>,
  side: 'front' | 'back'
): string {
  const nameLower = product.name.trim().toLowerCase();
  const brandLower = product.brand.trim().toLowerCase();
  const label = nameLower.startsWith(brandLower)
    ? product.name
    : `${product.brand} ${product.name}`;
  return `${label}, ${side} view`;
}

/**
 * Automatic local photo override.
 * Drop files named item-1-front.jpg, item-1-back.jpg, ..., item-6-back.jpg
 * (also supports .jpeg, .png, .webp) into src/assets/products/ or src/assets/images/
 * and they will automatically replace the preview URLs below.
 */
const localProductImages = import.meta.glob<string>(
  [
    '/src/assets/products/item-*-{front,back}.{jpg,jpeg,png,webp}',
    '/src/assets/images/item-*-{front,back}.{jpg,jpeg,png,webp}',
    '/src/assets/item-*-{front,back}.{jpg,jpeg,png,webp}',
  ],
  { eager: true, import: 'default' }
);

function resolveProductImage(slotName: string, remoteUrl: string): string {
  const lowerPrefix = `/${slotName.toLowerCase()}.`;
  for (const [filePath, resolvedUrl] of Object.entries(localProductImages)) {
    if (filePath.toLowerCase().includes(lowerPrefix)) {
      return resolvedUrl;
    }
  }
  return remoteUrl;
}

/**
 * Fallback circle + star monochrome placeholder SVG used if an image URL fails to load.
 */
export function getFallbackPlaceholder(
  viewLabel: string,
  mode: 'dark' | 'light' = 'dark'
): string {
  const palette =
    mode === 'dark'
      ? { bg: '#222222', ring: '#3B3B3B', star: '#6B6B6B', text: '#8A8A8A' }
      : { bg: '#E6E5DE', ring: '#C4C3BC', star: '#686864', text: '#4A4A47' };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" fill="none">
    <rect width="800" height="800" fill="${palette.bg}"/>
    <circle cx="400" cy="376" r="108" stroke="${palette.ring}" stroke-width="1.2"/>
    <path d="M400 348 L405 371 L428 376 L405 381 L400 404 L395 381 L372 376 L395 371 Z" fill="${palette.star}"/>
    <text x="400" y="530" text-anchor="middle" fill="${palette.text}" font-family="sans-serif" font-size="16" letter-spacing="6">${viewLabel.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Editable Latest Drop product catalog.
 * To swap photos locally without editing URLs, upload item-1-front.jpg, item-1-back.jpg, etc.
 * into src/assets/products/ (or src/assets/images/).
 */
export const products: Product[] = [
  {
    id: 'chrome-hearts-horseshoe-zip-hoodie',
    name: 'Chrome Hearts Horseshoe Zip Hoodie',
    brand: 'Chrome Hearts',
    size: 'L',
    condition: 'Very Good',
    conditionNote: 'Light fading on the cuffs.',
    price: '₱38,000',
    status: 'AVAILABLE',
    measurements: {
      pitToPit: '24"',
      length: '28"',
      sleeve: '25"',
    },
    frontImage: resolveProductImage(
      'item-1-front',
      'https://shop.shoegamemanila.com/cdn/shop/files/IMG_0251.webp?v=1759832558'
    ),
    backImage: resolveProductImage(
      'item-1-back',
      'https://images.stockx.com/images/Chrome-Hearts-Horseshoe-Floral-Cross-Sleeve-Zip-Up-Hoodie-Black-White.jpg'
    ),
    isSample: true,
  },
  {
    id: 'carhartt-wip-hooded-chase-sweatshirt',
    name: 'Carhartt WIP Hooded Chase Sweatshirt',
    brand: 'Carhartt WIP',
    size: 'M',
    condition: 'Excellent',
    conditionNote: 'No visible flaws.',
    price: '₱3,200',
    status: 'AVAILABLE',
    measurements: {
      pitToPit: '23"',
      length: '27.5"',
      sleeve: '24.5"',
    },
    frontImage: resolveProductImage(
      'item-2-front',
      'https://cdn.media.amplience.net/i/carhartt_wip/I033661_00M_XX-ST-01?%24ST%24=&fmt=auto&w=1200&qlt=default'
    ),
    backImage: resolveProductImage(
      'item-2-back',
      'https://cdn.media.amplience.net/i/carhartt_wip/I033661_00M_XX-ST-02?%24ST%24=&fmt=auto&w=1200&qlt=default'
    ),
    isSample: true,
  },
  {
    id: 'champion-reverse-weave-hoodie',
    name: 'Champion Reverse Weave Hoodie',
    brand: 'Champion',
    size: 'XL',
    condition: 'Good',
    conditionNote: 'Some pilling, small mark near the hem.',
    price: '₱2,400',
    status: 'AVAILABLE',
    measurements: {
      pitToPit: '26"',
      length: '29.5"',
      sleeve: '26"',
    },
    frontImage: resolveProductImage(
      'item-3-front',
      'https://media.endclothing.com/media/catalog/product/0/7/07-12-2022_gh_217976-kk001-nbk_m1.jpg'
    ),
    backImage: resolveProductImage(
      'item-3-back',
      'https://media.endclothing.com/media/catalog/product/0/7/07-12-2022_gh_217976-kk001-nbk_2.jpg'
    ),
    isSample: true,
  },
  {
    id: 'bape-shark-full-zip-hoodie',
    name: 'BAPE Shark Full Zip Hoodie',
    brand: 'BAPE',
    size: 'M',
    condition: 'Very Good',
    conditionNote: 'Zip works fine, light wear on the drawcords.',
    price: '₱14,500',
    status: 'RESERVED',
    measurements: {
      pitToPit: '21.5"',
      length: '26.5"',
      sleeve: '24"',
    },
    frontImage: resolveProductImage(
      'item-4-front',
      'https://us.bape.com/cdn/shop/files/001ZPM301007_YEL_A_V2_336c4cba-35ac-4a0d-a988-a81cfccbe0a0.jpg'
    ),
    backImage: resolveProductImage(
      'item-4-back',
      'https://us.bape.com/cdn/shop/files/001ZPL801310_YEL_B_V2_69ee8b57-4c42-45a9-aa7f-36ad5c8a17f8.jpg?v=1786597790&width=1200'
    ),
    isSample: true,
  },
  {
    id: 'aape-moonface-hoodie',
    name: 'AAPE Moonface Hoodie',
    brand: 'AAPE',
    size: 'L',
    condition: 'Good',
    conditionNote: 'Even fade throughout.',
    price: '₱3,800',
    status: 'AVAILABLE',
    measurements: {
      pitToPit: '23.5"',
      length: '28"',
      sleeve: '24.5"',
    },
    frontImage: resolveProductImage(
      'item-5-front',
      'https://us.aape.com/cdn/shop/files/AAPSWM3834XXHBKX-pdp-1_grande.jpg?v=1771771697'
    ),
    backImage: resolveProductImage(
      'item-5-back',
      'https://us.aape.com/cdn/shop/files/AAPSWM3834XXHBKX-pdp-2_grande.jpg?v=1771771697'
    ),
    isSample: true,
  },
  {
    id: 'stussy-stock-logo-hoodie',
    name: 'Stüssy Stock Logo Hoodie',
    brand: 'Stüssy',
    size: 'S',
    condition: 'Very Good',
    conditionNote: 'Slight cracking on the print.',
    price: '₱4,200',
    status: 'SOLD',
    measurements: {
      pitToPit: '21.5"',
      length: '26"',
      sleeve: '23.5"',
    },
    frontImage: resolveProductImage(
      'item-6-front',
      'https://www.stussy.com/cdn/shop/files/1925000_BLAC_1.jpg'
    ),
    backImage: resolveProductImage(
      'item-6-back',
      'https://www.stussy.com/cdn/shop/files/1925000_BLAC_2.jpg'
    ),
    isSample: true,
  },
];
