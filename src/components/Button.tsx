import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

interface ActionButtonProps extends BaseProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  href?: never;
  to?: never;
  external?: never;
}

interface InternalLinkProps extends BaseProps {
  to: string;
  href?: never;
  onClick?: () => void;
  external?: never;
  type?: never;
}

interface ExternalLinkProps extends BaseProps {
  href: string;
  external?: boolean;
  to?: never;
  onClick?: () => void;
  type?: never;
}

export type ButtonProps = ActionButtonProps | InternalLinkProps | ExternalLinkProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-ivory text-noir border border-ivory hover:bg-transparent hover:text-ivory',
  outline:
    'bg-transparent text-ivory border border-charcoal hover:border-ivory hover:text-ivory',
  text:
    'bg-transparent text-ivory border-b border-stone hover:border-ivory pb-1 px-0',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 text-[11px] tracking-[0.2em]',
  md: 'px-6 py-3.5 text-xs tracking-[0.2em]',
  lg: 'px-8 py-4 text-xs tracking-[0.22em]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ariaLabel,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2.5 uppercase font-medium whitespace-nowrap shrink-0 rounded-none transition-colors duration-200 cursor-pointer focus-visible:outline-1 focus-visible:outline-ivory focus-visible:outline-offset-3';

  const sizing = variant === 'text' ? 'text-xs tracking-[0.2em]' : sizeClasses[size];
  const combined = `${base} ${variantClasses[variant]} ${sizing} ${className}`.trim();

  if ('to' in rest && rest.to) {
    return (
      <Link to={rest.to} onClick={rest.onClick} aria-label={ariaLabel} className={combined}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const isExternal = rest.external ?? rest.href.startsWith('http');
    return (
      <a
        href={rest.href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={rest.onClick}
        aria-label={ariaLabel}
        className={combined}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={rest.type ?? 'button'}
      onClick={rest.onClick}
      aria-label={ariaLabel}
      className={combined}
    >
      {children}
    </button>
  );
}
