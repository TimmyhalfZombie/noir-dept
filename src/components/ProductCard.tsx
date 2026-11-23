import type { ProductItem } from '../config/siteConfig';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const { theme } = useTheme();
  const isSold = product.status === 'SOLD';
  const primaryPhoto = product.gallery[0];
  const secondaryPhoto = product.gallery[1] ?? product.gallery[0];
  const primarySrc =
    theme === 'light' && primaryPhoto.lightSrc ? primaryPhoto.lightSrc : primaryPhoto.src;
  const secondarySrc =
    theme === 'light' && secondaryPhoto.lightSrc ? secondaryPhoto.lightSrc : secondaryPhoto.src;

  const statusTone =
    product.status === 'AVAILABLE'
      ? 'text-ivory'
      : product.status === 'RESERVED'
      ? 'text-steel'
      : 'text-stone line-through';

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      aria-label={`Inspect ${product.brand} ${product.name} (${product.slotCode})`}
      className={`group text-left w-full flex flex-col bg-noir border border-charcoal hover:border-ivory transition-colors duration-200 cursor-pointer focus-visible:outline-1 focus-visible:outline-ivory focus-visible:outline-offset-2 ${
        isSold ? 'opacity-65 hover:opacity-85' : ''
      }`}
    >
      {/* Square photo container on charcoal surface */}
      <div className="relative aspect-square w-full overflow-hidden bg-charcoal border-b border-charcoal">
        <img
          src={primarySrc}
          alt={primaryPhoto.alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isSold ? 'grayscale' : ''
          } group-hover:opacity-0`}
        />
        <img
          src={secondarySrc}
          alt={secondaryPhoto.alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
            isSold ? 'grayscale' : ''
          }`}
        />
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
            {product.name}
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
    </button>
  );
}
