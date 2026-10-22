import { cn } from './cn';

/** `onHero*` are for buttons on the dark balance card. */
export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'onHero' | 'onHeroOutline';
export type ButtonSize = 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-ink shadow-card hover:bg-brand-hover',
  secondary:
    'border border-line-strong bg-surface text-ink shadow-card hover:bg-surface-muted',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  onHero: 'bg-hero-ink text-hero hover:bg-hero-ink/90',
  onHeroOutline: 'border border-hero-line text-hero-ink hover:bg-hero-line',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
};

/** Classes of a button, for links that look like one. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4',
    VARIANTS[variant],
    SIZES[size],
  );
}
