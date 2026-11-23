export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface ProductGalleryImage {
  label: 'Front' | 'Back' | 'Tag / Label' | 'Details' | 'Flaws';
  src: string;
  lightSrc?: string;
  alt: string;
}

export interface ProductMeasurement {
  label: string;
  value: string;
}

export interface ProductItem {
  id: string;
  slotCode: string;
  name: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
  status: ProductStatus;
  conditionNotes: string;
  measurements: ProductMeasurement[];
  gallery: ProductGalleryImage[];
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  tag?: string;
  isPlaceholder?: boolean;
}

export interface ConditionGradeItem {
  grade: string;
  description: string;
}

export interface FaqItem {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

export interface PrincipleItem {
  number: string;
  title: string;
  description: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface ExpectationItem {
  number: string;
  title: string;
  description: string;
}

/**
 * Generates a clearly labeled monochrome gray placeholder image (SVG data URI).
 * Replace src with real photo URLs or local paths (e.g. "/images/drop-01-front.jpg")
 * when listing actual pieces (and omit lightSrc for real photos).
 */
function createPlaceholderPhoto(
  slotCode: string,
  viewLabel: string,
  tone: 'front' | 'back' | 'tag' | 'detail' | 'flaws',
  mode: 'dark' | 'light' = 'dark'
): string {
  const darkPalettes = {
    front: { bg: '#222222', grid: '#363636', frame: '#4A4A4A', text: '#A8A8A4', sub: '#6E6E6B' },
    back: { bg: '#2A2A2A', grid: '#3D3D3D', frame: '#525252', text: '#B5B5B0', sub: '#7A7A76' },
    tag: { bg: '#252525', grid: '#383838', frame: '#4E4E4E', text: '#ADADA8', sub: '#737370' },
    detail: { bg: '#272727', grid: '#3B3B3B', frame: '#505050', text: '#B0B0AB', sub: '#757572' },
    flaws: { bg: '#1E1E1E', grid: '#323232', frame: '#464646', text: '#9E9E9A', sub: '#6A6A67' },
  };

  const lightPalettes = {
    front: { bg: '#E6E5DE', grid: '#CECDC6', frame: '#B5B4AC', text: '#42423F', sub: '#70706B' },
    back: { bg: '#DDDCDA', grid: '#C4C3BC', frame: '#ACABA3', text: '#383835', sub: '#686864' },
    tag: { bg: '#E2E1DA', grid: '#CAC9C2', frame: '#B0AFA8', text: '#40403D', sub: '#6E6E6A' },
    detail: { bg: '#DFDED7', grid: '#C7C6BF', frame: '#AEADA6', text: '#3D3D3A', sub: '#6B6B67' },
    flaws: { bg: '#E9E8E1', grid: '#D1D0C9', frame: '#B8B7B0', text: '#464643', sub: '#747470' },
  };

  const palette = (mode === 'dark' ? darkPalettes : lightPalettes)[tone];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" fill="none">
    <rect width="800" height="800" fill="${palette.bg}"/>
    <rect x="36" y="36" width="728" height="728" stroke="${palette.grid}" stroke-width="1"/>
    <line x1="36" y1="76" x2="76" y2="76" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="76" y1="36" x2="76" y2="76" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="724" y1="76" x2="764" y2="76" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="724" y1="36" x2="724" y2="76" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="36" y1="724" x2="76" y2="724" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="76" y1="724" x2="76" y2="764" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="724" y1="724" x2="764" y2="724" stroke="${palette.frame}" stroke-width="1"/>
    <line x1="724" y1="724" x2="724" y2="764" stroke="${palette.frame}" stroke-width="1"/>
    <circle cx="400" cy="368" r="96" stroke="${palette.grid}" stroke-width="1"/>
    <path d="M400 342 L404.5 363.5 L426 368 L404.5 372.5 L400 394 L395.5 372.5 L374 368 L395.5 363.5 Z" fill="${palette.frame}"/>
    <text x="400" y="515" text-anchor="middle" fill="${palette.text}" font-family="sans-serif" font-size="18" letter-spacing="6">${viewLabel.toUpperCase()}</text>
    <text x="400" y="548" text-anchor="middle" fill="${palette.sub}" font-family="sans-serif" font-size="13" letter-spacing="4">${slotCode} · PHOTO PLACEHOLDER</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPlaceholderProduct(
  index: number,
  status: ProductStatus
): ProductItem {
  const code = `DROP ${String(index).padStart(2, '0')}`;
  return {
    id: `placeholder-item-${index}`,
    slotCode: code,
    name: 'Item Name',
    brand: 'Brand',
    size: '—',
    condition: '—',
    price: '₱—',
    status,
    conditionNotes: '[Condition notes to be added]',
    measurements: [
      { label: 'Chest (Pit to Pit)', value: '—' },
      { label: 'Length', value: '—' },
      { label: 'Shoulder', value: '—' },
      { label: 'Sleeve', value: '—' },
    ],
    gallery: [
      {
        label: 'Front',
        src: createPlaceholderPhoto(code, 'Front View', 'front', 'dark'),
        lightSrc: createPlaceholderPhoto(code, 'Front View', 'front', 'light'),
        alt: `${code} front view placeholder image`,
      },
      {
        label: 'Back',
        src: createPlaceholderPhoto(code, 'Back View', 'back', 'dark'),
        lightSrc: createPlaceholderPhoto(code, 'Back View', 'back', 'light'),
        alt: `${code} back view placeholder image`,
      },
      {
        label: 'Tag / Label',
        src: createPlaceholderPhoto(code, 'Tag / Label', 'tag', 'dark'),
        lightSrc: createPlaceholderPhoto(code, 'Tag / Label', 'tag', 'light'),
        alt: `${code} tag and label placeholder image`,
      },
      {
        label: 'Details',
        src: createPlaceholderPhoto(code, 'Details', 'detail', 'dark'),
        lightSrc: createPlaceholderPhoto(code, 'Details', 'detail', 'light'),
        alt: `${code} garment details placeholder image`,
      },
      {
        label: 'Flaws',
        src: createPlaceholderPhoto(code, 'Flaws', 'flaws', 'dark'),
        lightSrc: createPlaceholderPhoto(code, 'Flaws', 'flaws', 'light'),
        alt: `${code} flaws documentation placeholder image`,
      },
    ],
  };
}

export const siteConfig = {
  brand: {
    name: 'NOIR DEPT.',
    descriptor: 'STREETWEAR • RARE FINDS',
    slogan: 'WEAR THE PAST. KEEP THE STYLE.',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61596666997168',
    facebookHandle: 'NOIR DEPT. on Facebook',
  },

  nav: {
    links: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Services', to: '/services' },
    ],
    ctaLabel: 'Message Us',
  },

  meta: {
    home: {
      title: 'NOIR DEPT. — Streetwear • Rare Finds',
      description:
        'Independent resale shop for secondhand branded streetwear, graphic hoodies, and distinctive pre-loved pieces.',
    },
    about: {
      title: 'About — NOIR DEPT.',
      description:
        'THE DEPARTMENT. An independent shop for secondhand branded streetwear. Pre-loved pieces, picked with intent.',
    },
    services: {
      title: 'Services — NOIR DEPT.',
      description:
        'How NOIR DEPT. works: curated drops on Facebook, direct item inquiries, honest condition reports, and straightforward buying steps.',
    },
  },

  home: {
    hero: {
      primaryCta: 'View the Latest Drop',
      secondaryCta: 'Message on Facebook',
    },
    latestDrop: {
      kicker: '01 / DROP',
      title: 'LATEST DROP',
      subtitle: 'Selected secondhand branded pieces. Click any piece to view photos and measurements.',
      emptyMessage: 'No pieces under this status right now.',
      modalInquiryCta: 'Message to Inquire',
    },
    introStrip: {
      kicker: '02 / ETHOS',
      statement: 'Pre-loved pieces. Picked with intent.',
      linkLabel: 'Read About Us',
      linkTo: '/about',
    },
    whatToExpect: {
      kicker: '03 / STANDARD',
      title: 'WHAT TO EXPECT',
      linkLabel: 'See Services',
      linkTo: '/services',
      items: [
        {
          number: '01',
          title: 'Real photos',
          description: 'Actual photos of the exact piece in hand, front to tag.',
        },
        {
          number: '02',
          title: 'Honest condition',
          description: 'Wear, fading, and flaws noted plainly before you inquire.',
        },
        {
          number: '03',
          title: 'Direct inquiries',
          description: 'Message our Facebook page for sizing, details, and availability.',
        },
      ] as ExpectationItem[],
    },
  },

  // Placeholder drop items only — replace with real pieces, prices, and photos when ready.
  products: [
    buildPlaceholderProduct(1, 'AVAILABLE'),
    buildPlaceholderProduct(2, 'AVAILABLE'),
    buildPlaceholderProduct(3, 'AVAILABLE'),
    buildPlaceholderProduct(4, 'RESERVED'),
    buildPlaceholderProduct(5, 'AVAILABLE'),
    buildPlaceholderProduct(6, 'SOLD'),
  ] as ProductItem[],

  about: {
    hero: {
      label: '02 / ABOUT',
      title: 'THE DEPARTMENT',
      subtitle: 'An independent shop for secondhand branded streetwear.',
    },
    story: {
      kicker: 'OUR POINT OF VIEW',
      statement: 'Pre-loved pieces. Picked with intent.',
      paragraphs: [
        "NOIR DEPT. finds secondhand branded clothing worth a second look: graphic hoodies, recognizable labels and distinctive pieces. We're not a bargain bin or a generic thrift rack. Each piece is chosen for its look, label, fit and condition, then listed with real photos and honest details.",
      ],
      ownerStoryPlaceholder: '[Owner story — to be added]',
    },
    founder: {
      label: '03 / THE FOUNDER',
      portraitSrc: '', // Replace with portrait photo URL or local path when ready
      portraitAlt: 'Portrait of the founder of NOIR DEPT.',
      name: '[Founder Name]',
      role: 'Founder, NOIR DEPT.',
      paragraphs: [
        '[Founder bio — paste your copy here]',
      ],
      signature: '[Signature line — paste your copy here]',
    },
    principles: {
      kicker: 'WHAT WE STAND FOR',
      title: 'FOUR PRINCIPLES',
      items: [
        {
          number: '01',
          title: 'Selective',
          description: 'Fewer pieces, chosen with care.',
        },
        {
          number: '02',
          title: 'Honest',
          description: 'Real size, real condition, real photos, flaws included.',
        },
        {
          number: '03',
          title: 'Independent',
          description: 'Our own identity, separate from the labels we resell.',
        },
        {
          number: '04',
          title: 'Direct',
          description: 'Questions answered clearly, no pressure.',
        },
      ] as PrincipleItem[],
    },
    sloganSection: {
      kicker: 'NOIR DEPT.',
      slogan: 'WEAR THE PAST. KEEP THE STYLE.',
    },
  },

  services: {
    hero: {
      label: '03 / SERVICES',
      title: 'HOW WE WORK',
      subtitle: 'From the drop to your door, kept simple.',
    },
    offerings: {
      kicker: 'WHAT WE DO',
      title: 'SERVICES',
      items: [
        {
          number: '01',
          title: 'Curated Drops',
          description:
            'New secondhand branded pieces, posted as drops on our Facebook page.',
        },
        {
          number: '02',
          title: 'Item Inquiries',
          description:
            'Message us for sizing, measurements, extra photos or details on any piece.',
        },
        {
          number: '03',
          title: 'Honest Condition Reports',
          description:
            'Every listing describes wear, fading, marks or repairs plainly, with photos of any flaws.',
        },
        {
          number: '04',
          title: 'Sourcing Requests',
          description: '[To be confirmed]',
          tag: 'COMING SOON / TBC',
          isPlaceholder: true,
        },
        {
          number: '05',
          title: 'Reservations',
          description: '[Policy to be added]',
          isPlaceholder: true,
        },
        {
          number: '06',
          title: 'Delivery & Meet-ups',
          description: '[Couriers / areas to be added]',
          isPlaceholder: true,
        },
      ] as ServiceItem[],
    },
    howToBuy: {
      kicker: 'PROCESS',
      title: 'HOW TO BUY',
      steps: [
        {
          number: '01',
          title: 'Browse the drop',
          description: 'Review photos, size, condition notes, and measurements.',
        },
        {
          number: '02',
          title: 'Message the page',
          description: 'Send the item name on Facebook to check availability or ask questions.',
        },
        {
          number: '03',
          title: 'Confirm details',
          description: 'Finalize condition, fit, and handover directly with us.',
        },
      ] as StepItem[],
    },
    conditionGuide: {
      kicker: 'REFERENCE',
      title: 'CONDITION GUIDE',
      intro:
        'Each listing uses a plain condition label paired with close-up photos of any wear or flaws. Fill in your grading scale below.',
      grades: [
        { grade: '[Grade 01]', description: '[description]' },
        { grade: '[Grade 02]', description: '[description]' },
        { grade: '[Grade 03]', description: '[description]' },
        { grade: '[Grade 04]', description: '[description]' },
      ] as ConditionGradeItem[],
    },
    faq: {
      kicker: 'QUESTIONS',
      title: 'FREQUENTLY ASKED',
      items: [
        {
          id: 'sizing',
          topic: 'SIZING',
          question: 'How are sizing and measurements taken?',
          answer: '[Answer to be added]',
        },
        {
          id: 'payment',
          topic: 'PAYMENT',
          question: 'What payment methods are accepted?',
          answer: '[Answer to be added]',
        },
        {
          id: 'shipping',
          topic: 'SHIPPING',
          question: 'How do shipping and delivery work?',
          answer: '[Answer to be added]',
        },
        {
          id: 'reservations',
          topic: 'RESERVATIONS',
          question: 'Can an item be reserved?',
          answer: '[Answer to be added]',
        },
        {
          id: 'returns',
          topic: 'RETURNS',
          question: 'What is the return or exchange policy?',
          answer: '[Answer to be added]',
        },
      ] as FaqItem[],
    },
  },

  ctaBand: {
    kicker: 'FACEBOOK DROPS',
    headline: 'NEW DROPS, POSTED ON FACEBOOK.',
    buttonLabel: 'Follow NOIR DEPT.',
  },

  footer: {
    disclaimer:
      'NOIR DEPT. is an independent reseller of pre-owned clothing and is not affiliated with, endorsed by, or sponsored by any of the brands it resells. All brand names belong to their respective owners.',
  },
} as const;
