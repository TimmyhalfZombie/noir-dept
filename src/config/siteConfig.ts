import { seoRoutes, site } from './site';

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
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

export const siteConfig = {
  previewMode: true as boolean,

  brand: {
    name: site.name,
    descriptor: site.tagline.toUpperCase(),
    slogan: site.slogan.toUpperCase(),
    facebookUrl: site.facebookUrl,
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
      title: seoRoutes.home.title,
      description: seoRoutes.home.description,
    },
    about: {
      title: seoRoutes.about.title,
      description: seoRoutes.about.description,
    },
    services: {
      title: seoRoutes.services.title,
      description: seoRoutes.services.description,
    },
    privacy: {
      title: seoRoutes.privacy.title,
      description: seoRoutes.privacy.description,
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
      subtitle: "Drop 01. One of each, so when it's gone, it's gone.",
      previewSubtitle:
        'Preview pieces. Live drops are posted on our Facebook page.',
      emptyMessage: 'No pieces under this status right now.',
      modalInquiryCta: 'MESSAGE TO INQUIRE',
      modalSoldCta: 'SOLD, MESSAGE FOR SIMILAR PIECES',
      modalPreviewCta: 'SAMPLE LISTING, NOT FOR SALE',
      modalFootnote:
        'Secondhand item. Please check all photos and ask about anything before buying.',
    },
    introStrip: {
      kicker: '02 / ETHOS',
      statement: 'Pre-loved pieces. Picked with intent.',
      linkLabel: 'Read about us',
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
          description: 'Front, back, tags and flaws. You see the actual piece.',
        },
        {
          number: '02',
          title: 'Honest condition',
          description: 'Wear, fading and marks are written down, not hidden.',
        },
        {
          number: '03',
          title: 'Direct inquiries',
          description: 'Ask for measurements or extra photos. We reply straight.',
        },
      ] as ExpectationItem[],
    },
  },

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
    },
    founder: {
      label: '03 / FROM THE FOUNDER',
      portraitSrc: '/images/founder.jpg',
      portraitAlt: 'Founder of NOIR DEPT.',
      paragraphs: [
        "I started NOIR DEPT. because I kept finding pieces that deserved better than the bottom of a thrift pile. A good hoodie with the right label and the right wear says something new clothes can't.",
        "Every piece here passes through my hands first. I check the tags, the stitching and the flaws, and I photograph each one myself. If something's off, I'll tell you. I'd rather lose a sale than lose your trust.",
        "NOIR DEPT. is small, and that's on purpose. Fewer pieces, picked with care.",
      ],
      signature: '— NOIR DEPT.',
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
          title: 'Distinct',
          description: 'Our own name, our own look. Separate from the labels we resell.',
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
            'New pieces go up in drops on our Facebook page. Each one is one of one, so turn on notifications.',
        },
        {
          number: '02',
          title: 'Item Inquiries',
          description:
            'Message us for measurements, extra photos or a closer look at any flaw before you decide.',
        },
        {
          number: '03',
          title: 'Honest Condition Reports',
          description:
            'Every listing states the condition plainly, with photos of any wear, fading or repairs.',
        },
        {
          number: '04',
          title: 'Sourcing Requests',
          description:
            "Looking for a specific piece or label? Send us what you're after and your size. We'll message you if we find it.",
        },
        {
          number: '05',
          title: 'Reservations',
          description:
            "Ask about holding a piece when you message us. We'll tell you what's possible for that item.",
        },
        {
          number: '06',
          title: 'Delivery & Meet-ups',
          description:
            "Tell us your city when you message, and we'll walk you through delivery or meet-up options for your area.",
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
          description: 'Find a piece you like and note its name.',
        },
        {
          number: '02',
          title: 'Message the page',
          description: 'Send us the item name. Ask anything about size or condition.',
        },
        {
          number: '03',
          title: 'Confirm details',
          description:
            "We'll confirm availability, payment and delivery with you directly.",
        },
      ] as StepItem[],
    },
    conditionGuide: {
      kicker: 'REFERENCE',
      title: 'CONDITION GUIDE',
      intro:
        'Every listing is graded plainly and paired with close-up photos of any wear or flaws.',
      grades: [
        {
          grade: 'EXCELLENT',
          description: 'Barely worn. No visible flaws.',
        },
        {
          grade: 'VERY GOOD',
          description: 'Light signs of wear. No major flaws.',
        },
        {
          grade: 'GOOD',
          description:
            'Visible wear such as fading or pilling. Any marks are shown in photos.',
        },
        {
          grade: 'FAIR',
          description:
            'Noticeable flaws such as stains, small holes or repairs, all shown in photos.',
        },
      ] as ConditionGradeItem[],
    },
    faq: {
      kicker: 'QUESTIONS',
      title: 'FREQUENTLY ASKED',
      items: [
        {
          id: 'sizing',
          topic: 'SIZING',
          question: "How do I know if it'll fit?",
          answer:
            "Every listing shows the tag size. Message us and we'll send exact measurements: pit to pit, length and sleeve.",
        },
        {
          id: 'condition',
          topic: 'CONDITION',
          question: 'Are the items new?',
          answer:
            'No. Everything is secondhand. Condition is listed on every piece, flaws included.',
        },
        {
          id: 'reservations',
          topic: 'RESERVATIONS',
          question: 'Can I reserve a piece?',
          answer:
            "Message us about the item and we'll let you know if it can be held.",
        },
        {
          id: 'payment',
          topic: 'PAYMENT',
          question: 'How do I pay?',
          answer:
            'Payment options are confirmed when you message us to buy.',
        },
        {
          id: 'delivery',
          topic: 'DELIVERY',
          question: 'Do you ship or meet up?',
          answer:
            "Tell us where you are and we'll let you know the delivery or meet-up options.",
        },
        {
          id: 'orders',
          topic: 'ORDERS',
          question: "What if there's a problem with my order?",
          answer:
            "Each piece is secondhand and one of one, so check the photos and ask questions before buying. If something isn't right, message us and we'll talk it through.",
        },
        {
          id: 'independence',
          topic: 'BRANDS',
          question: 'Are you affiliated with the brands you sell?',
          answer:
            "No. NOIR DEPT. is an independent reseller of pre-owned clothing and isn't affiliated with, endorsed by or sponsored by any brand we resell.",
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
