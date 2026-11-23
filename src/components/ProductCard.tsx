import { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import {
  getFallbackPlaceholder,
  getProductImageAlt,
  type Product,
} from '../data/products';
import { getTheme } from '../ui/theme';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const [showBackTouch, setShowBackTouch] = useState(false);
  const [frontError, setFrontError] = useState(false);
  const [backError, setBackError] = useState(false);

  const isSold = product.status === 'SOLD';

  const frontSrc = frontError
    ? getFallbackPlaceholder('Front', getTheme())
    : product.frontImage;
  const backSrc = backError
    ? getFallbackPlaceholder('Back', getTheme())
    : product.backImage;

  const statusTone =
    product.status === 'AVAILABLE'
      ? 'text-ivory'
      : product.status === 'RESERVED'
      ? 'text-steel'
      : 'text-stone line-through';

  return (
    <article className="group relative flex flex-col bg-noir border border-charcoal hover:border-ivory has-[.card-trigger:focus-visible]:outline-1 has-[.card-trigger:focus-visible]:outline-ivory has-[.card-trigger:focus-visible]:outline-offset-2 transition-colors duration-200">
      {/* Square photo container */}
      <div className="relative aspect-square w-full overflow-hidden bg-charcoal border-b border-charcoal">
        {/* Front image */}
        <img
          src={frontSrc}
          alt={getProductImageAlt(product, 'front')}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          onError={() => setFrontError(true)}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.03] [@media(hover:hover)]:group-hover:opacity-0 ${
            showBackTouch ? 'opacity-0' : isSold ? 'opacity-60' : 'opacity-100'
          }`}
        />

        {/* Back image */}
        <img
          src={backSrc}
          alt={getProductImageAlt(product, 'back')}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          aria-hidden="true"
          onError={() => setBackError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.03] ${
            isSold
              ? '[@media(hover:hover)]:group-hover:opacity-60'
              : '[@media(hover:hover)]:group-hover:opacity-100'
          } ${
            showBackTouch
              ? isSold
                ? 'opacity-60'
                : 'opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* Preview mode SAMPLE label (disappears when previewMode is false) */}
        {siteConfig.previewMode && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] bg-noir/85 text-ivory border border-ivory/60">
            SAMPLE
          </span>
        )}

        {/* Touch-only FRONT / BACK toggle button on bottom-right of image */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowBackTouch((prev) => !prev);
          }}
          aria-pressed={showBackTouch}
          aria-label={`Show ${showBackTouch ? 'front' : 'back'} view of ${product.name}`}
          className="[@media(hover:hover)]:hidden absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] bg-noir/90 text-ivory border border-ivory/60 cursor-pointer focus-visible:outline-1 focus-visible:outline-ivory focus-visible:outline-offset-2"
        >
          {showBackTouch ? 'FRONT' : 'BACK'}
        </button>
      </div>

      {/* Editorial product metadata */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
            <span className="text-steel truncate">{product.brand}</span>
            <span className={`whitespace-nowrap shrink-0 font-medium ${statusTone}`}>
              {product.status}
            </span>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-semibold tracking-[-0.01em] text-ivory leading-snug">
            <button
              type="button"
              onClick={() => onSelect(product)}
              aria-label={`Inspect ${product.name}, ${product.size}, ${product.price}, ${product.status}`}
              className="card-trigger text-left cursor-pointer focus-visible:outline-none after:content-[''] after:absolute after:inset-0 after:z-10"
            >
              {product.name}
            </button>
          </h3>
        </div>

        <div className="pt-3 border-t border-charcoal/80 flex items-end justify-between gap-2">
          <div className="space-y-0.5 text-[11px] text-steel">
            <p className="uppercase tracking-[0.14em]">
              Size: <span className="text-ivory/85">{product.size}</span>
            </p>
            <p className="uppercase tracking-[0.14em]">
              Condition: <span className="text-ivory/85">{product.condition}</span>
            </p>
          </div>

          <p className="text-sm sm:text-base font-medium text-ivory tabular-nums whitespace-nowrap shrink-0">
            {product.price}
          </p>
        </div>
      </div>
    </article>
  );
}
