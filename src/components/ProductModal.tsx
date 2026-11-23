import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import {
  getFallbackPlaceholder,
  getProductImageAlt,
  type Product,
} from '../data/products';
import { getTheme } from '../ui/theme';
import { Button } from './Button';
import { FourPointStar } from './Motifs';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

type ViewSide = 'front' | 'back';

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [activeSide, setActiveSide] = useState<ViewSide>('front');
  const [frontError, setFrontError] = useState(false);
  const [backError, setBackError] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Reset side and error state whenever product changes
  useEffect(() => {
    setActiveSide('front');
    setFrontError(false);
    setBackError(false);
  }, [product?.id]);

  // Lock body scroll, manage focus trap, restore focus on close, handle Esc & Arrow keys
  useEffect(() => {
    if (!product) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into dialog on open
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 10);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'));
        return;
      }

      // Focus trap inside modal
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [product, onClose]);

  const isSold = product?.status === 'SOLD';

  const frontSrc = product
    ? frontError
      ? getFallbackPlaceholder('Front', getTheme())
      : product.frontImage
    : '';
  const backSrc = product
    ? backError
      ? getFallbackPlaceholder('Back', getTheme())
      : product.backImage
    : '';

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(delta) > 40) {
      setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'));
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[55] flex items-center justify-center bg-[#0D0D0D]/60 dark:bg-[#0D0D0D]/90 p-3 sm:p-6 md:p-10"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-noir border border-charcoal"
          >
            {/* Top utility bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-7 py-4 bg-noir border-b border-charcoal">
              <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.24em] text-steel">
                <FourPointStar className="w-2.5 h-2.5 text-ivory" />
                <span>{product.brand}</span>
                <span aria-hidden="true">/</span>
                <span className={isSold ? 'text-stone line-through' : 'text-ivory'}>
                  {product.status}
                </span>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close item details"
                className="inline-flex items-center justify-center w-10 h-10 border border-charcoal text-ivory hover:border-ivory transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Split body: Gallery left, specs right */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Gallery column */}
              <div className="lg:col-span-7 p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-charcoal space-y-4">
                {/* Large square viewer with crossfade + touch swipe */}
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative aspect-square w-full bg-charcoal border border-charcoal overflow-hidden select-none"
                >
                  <img
                    src={frontSrc}
                    alt={getProductImageAlt(product, 'front')}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFrontError(true)}
                    className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${
                      activeSide === 'front'
                        ? isSold
                          ? 'opacity-60'
                          : 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                  <img
                    src={backSrc}
                    alt={getProductImageAlt(product, 'back')}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    onError={() => setBackError(true)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
                      activeSide === 'back'
                        ? isSold
                          ? 'opacity-60'
                          : 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />

                  {siteConfig.previewMode && (
                    <span className="pointer-events-none absolute top-3 left-3 z-10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.22em] bg-noir/85 text-ivory border border-ivory/60">
                      SAMPLE
                    </span>
                  )}
                </div>

                {/* FRONT / BACK tabs */}
                <div
                  role="tablist"
                  aria-label="Product photo views"
                  className="grid grid-cols-2 border border-charcoal"
                >
                  {(['front', 'back'] as const).map((side) => {
                    const selected = activeSide === side;
                    return (
                      <button
                        key={side}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setActiveSide(side)}
                        className={`py-2.5 text-[11px] uppercase tracking-[0.24em] transition-colors cursor-pointer ${
                          side === 'front' ? 'border-r border-charcoal' : ''
                        } ${
                          selected
                            ? 'bg-ivory text-noir font-medium'
                            : 'bg-noir text-steel hover:text-ivory'
                        }`}
                      >
                        {side === 'front' ? 'FRONT' : 'BACK'}
                      </button>
                    );
                  })}
                </div>

                {/* Two thumbnails */}
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { side: 'front' as const, label: 'Front', src: frontSrc },
                    { side: 'back' as const, label: 'Back', src: backSrc },
                  ]).map((thumb) => {
                    const selected = activeSide === thumb.side;
                    return (
                      <button
                        key={thumb.side}
                        type="button"
                        onClick={() => setActiveSide(thumb.side)}
                        aria-label={`View ${thumb.label.toLowerCase()} photo of ${product.name}`}
                        className={`aspect-square w-full overflow-hidden bg-charcoal border transition-colors cursor-pointer ${
                          selected
                            ? 'border-ivory'
                            : 'border-charcoal hover:border-steel'
                        }`}
                      >
                        <img
                          src={thumb.src}
                          alt={getProductImageAlt(product, thumb.side)}
                          width={400}
                          height={400}
                          loading="lazy"
                          decoding="async"
                          className={`h-full w-full object-cover transition-opacity duration-200 ${
                            selected ? 'opacity-100' : 'opacity-65 hover:opacity-85'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specifications column */}
              <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between gap-8">
                <div className="space-y-6">
                  {/* Brand, Name, Price, Status */}
                  <div className="pb-6 border-b border-charcoal space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-steel">
                        {product.brand}
                      </p>
                      <span
                        className={`text-[11px] uppercase tracking-[0.22em] font-medium ${
                          isSold
                            ? 'text-stone line-through'
                            : product.status === 'RESERVED'
                            ? 'text-steel'
                            : 'text-ivory'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <h2
                      id="product-modal-title"
                      className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-[-0.02em] leading-tight text-ivory"
                    >
                      {product.name}
                    </h2>
                    <p className="pt-2 text-xl font-medium text-ivory tabular-nums">
                      {product.price}
                    </p>
                    <p className="text-[11px] text-stone leading-relaxed">
                      Independent resale. Not affiliated with {product.brand}.
                    </p>
                  </div>

                  {/* Size & Condition */}
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

                  {/* Condition note */}
                  <div className="pb-6 border-b border-charcoal space-y-2">
                    <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone">
                      Condition Note
                    </h3>
                    <p className="text-sm text-steel leading-relaxed">
                      {product.conditionNote}
                    </p>
                  </div>

                  {/* Measurements table */}
                  <div className="space-y-3">
                    <h3 className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone">
                      Measurements
                    </h3>
                    <dl className="divide-y divide-charcoal border-t border-b border-charcoal">
                      <div className="py-2.5 flex items-center justify-between gap-4 text-sm">
                        <dt className="text-steel">Pit to pit</dt>
                        <dd className="text-ivory tabular-nums">
                          {product.measurements.pitToPit}
                        </dd>
                      </div>
                      <div className="py-2.5 flex items-center justify-between gap-4 text-sm">
                        <dt className="text-steel">Length</dt>
                        <dd className="text-ivory tabular-nums">
                          {product.measurements.length}
                        </dd>
                      </div>
                      <div className="py-2.5 flex items-center justify-between gap-4 text-sm">
                        <dt className="text-steel">Sleeve</dt>
                        <dd className="text-ivory tabular-nums">
                          {product.measurements.sleeve}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Inquiry action */}
                <div className="space-y-3 pt-2">
                  {siteConfig.previewMode ? (
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center px-7 py-4 text-[11px] font-medium uppercase tracking-[0.2em] border border-charcoal bg-charcoal/40 text-stone cursor-not-allowed select-none"
                    >
                      {siteConfig.home.latestDrop.modalPreviewCta}
                    </button>
                  ) : (
                    <Button
                      href={siteConfig.brand.facebookUrl}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <span>
                        {isSold
                          ? siteConfig.home.latestDrop.modalSoldCta
                          : siteConfig.home.latestDrop.modalInquiryCta}
                      </span>
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  )}
                  <p className="text-[11px] text-stone leading-relaxed text-center">
                    {siteConfig.home.latestDrop.modalFootnote}
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
