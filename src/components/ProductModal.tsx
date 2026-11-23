import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { siteConfig, type ProductItem } from '../config/siteConfig';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';
import { FourPointStar } from './Motifs';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((idx) => (idx + 1) % product.gallery.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((idx) => (idx - 1 + product.gallery.length) % product.gallery.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose]);

  const activePhoto = product ? product.gallery[activeIndex] ?? product.gallery[0] : null;
  const activePhotoSrc =
    activePhoto && theme === 'light' && activePhoto.lightSrc
      ? activePhoto.lightSrc
      : activePhoto?.src ?? '';
  const isSold = product?.status === 'SOLD';

  return (
    <AnimatePresence>
      {product && activePhoto && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/55 dark:bg-[#0D0D0D]/90 p-3 sm:p-6 md:p-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-noir border border-charcoal"
          >
            {/* Top utility bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-7 py-4 bg-noir border-b border-charcoal">
              <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.24em] text-steel">
                <FourPointStar className="w-2.5 h-2.5 text-ivory" />
                <span>{product.slotCode}</span>
                <span aria-hidden="true">/</span>
                <span className={isSold ? 'text-stone line-through' : 'text-ivory'}>
                  {product.status}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close item details"
                className="inline-flex items-center justify-center w-10 h-10 border border-charcoal text-ivory hover:border-ivory transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Split body: Gallery left, editorial specs right */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Gallery column */}
              <div className="lg:col-span-7 p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-charcoal space-y-4">
                <div className="relative aspect-square w-full bg-charcoal border border-charcoal overflow-hidden">
                  <img
                    src={activePhotoSrc}
                    alt={activePhoto.alt}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover ${isSold ? 'grayscale opacity-75' : ''}`}
                  />

                  {/* Previous / Next controls */}
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex(
                          (idx) => (idx - 1 + product.gallery.length) % product.gallery.length
                        )
                      }
                      aria-label="Previous photo"
                      className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 bg-noir/85 border border-charcoal text-ivory hover:border-ivory transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((idx) => (idx + 1) % product.gallery.length)
                      }
                      aria-label="Next photo"
                      className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 bg-noir/85 border border-charcoal text-ivory hover:border-ivory transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Active photo label footer */}
                  <div className="absolute bottom-0 inset-x-0 px-4 py-2.5 bg-noir/85 border-t border-charcoal flex items-center justify-between text-[11px] uppercase tracking-[0.2em]">
                    <span className="text-ivory">{activePhoto.label}</span>
                    <span className="text-steel tabular-nums">
                      0{activeIndex + 1} / 0{product.gallery.length}
                    </span>
                  </div>
                </div>

                {/* 5-angle gallery thumbnails (Front, Back, Tag/Label, Details, Flaws) */}
                <div
                  role="tablist"
                  aria-label="Item gallery views"
                  className="grid grid-cols-5 gap-2"
                >
                  {product.gallery.map((img, idx) => {
                    const selected = idx === activeIndex;
                    const thumbSrc =
                      theme === 'light' && img.lightSrc ? img.lightSrc : img.src;
                    return (
                      <button
                        key={img.label}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setActiveIndex(idx)}
                        className={`flex flex-col text-left border transition-colors cursor-pointer ${
                          selected
                            ? 'border-ivory'
                            : 'border-charcoal hover:border-steel'
                        }`}
                      >
                        <div className="aspect-square w-full bg-charcoal overflow-hidden">
                          <img
                            src={thumbSrc}
                            alt={img.alt}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className={`h-full w-full object-cover ${
                              selected ? 'opacity-100' : 'opacity-65'
                            } ${isSold ? 'grayscale' : ''}`}
                          />
                        </div>
                        <span
                          className={`px-1.5 py-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.14em] truncate w-full text-center border-t border-charcoal ${
                            selected ? 'text-ivory' : 'text-stone'
                          }`}
                        >
                          {img.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specifications column */}
              <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-8">
                <div className="space-y-6">
                  {/* Brand, Name, Price */}
                  <div className="pb-6 border-b border-charcoal space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-steel">
                      {product.brand}
                    </p>
                    <h2
                      id="product-modal-title"
                      className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[-0.02em] leading-tight text-ivory"
                    >
                      {product.name}
                    </h2>
                    <p className="pt-2 text-xl font-medium text-ivory tabular-nums">
                      {product.price}
                    </p>
                  </div>

                  {/* Size & Condition summary */}
                  <dl className="grid grid-cols-2 gap-4 pb-6 border-b border-charcoal">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.22em] text-stone mb-1">
                        Size
                      </dt>
                      <dd className="text-sm text-ivory">{product.size}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.22em] text-stone mb-1">
                        Condition
                      </dt>
                      <dd className="text-sm text-ivory">{product.condition}</dd>
                    </div>
                  </dl>

                  {/* Condition notes */}
                  <div className="pb-6 border-b border-charcoal space-y-2">
                    <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone">
                      Condition Notes
                    </h3>
                    <p className="text-sm text-steel leading-relaxed">
                      {product.conditionNotes}
                    </p>
                  </div>

                  {/* Measurements table */}
                  <div className="space-y-3">
                    <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone">
                      Measurements
                    </h3>
                    <dl className="divide-y divide-charcoal border-t border-b border-charcoal">
                      {product.measurements.map((m) => (
                        <div
                          key={m.label}
                          className="py-2.5 flex items-center justify-between gap-4 text-sm"
                        >
                          <dt className="text-steel">{m.label}</dt>
                          <dd className="text-ivory tabular-nums">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                {/* Inquiry action */}
                <div className="space-y-3 pt-2">
                  <Button
                    href={siteConfig.brand.facebookUrl}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    <span>{siteConfig.home.latestDrop.modalInquiryCta}</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <p className="text-[11px] text-stone leading-relaxed text-center">
                    {isSold
                      ? 'This piece is marked sold. Message our Facebook page for upcoming drops.'
                      : 'All inquiries and purchases are handled directly through our Facebook page.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
