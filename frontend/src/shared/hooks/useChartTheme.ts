import type { TooltipOptions } from 'chart.js';
import { useTheme } from '@/shared/lib/theme';

const TOKENS = [
  'brand',
  'credit',
  'debit',
  'ink',
  'ink-muted',
  'ink-subtle',
  'line',
  'line-strong',
  'surface',
  'hero',
  'hero-accent',
  'hero-line',
  'hero-muted',
] as const;

type Token = (typeof TOKENS)[number];

/**
 * Colours and tooltip styling for the canvas charts, read from the design
 * tokens (CSS custom properties). Subscribing to the theme re-renders the
 * chart, and so re-reads the tokens, when the theme changes.
 */
export function useChartTheme() {
  useTheme();
  const style = getComputedStyle(document.documentElement);
  const colors = Object.fromEntries(
    TOKENS.map((name) => [name, style.getPropertyValue(`--${name}`).trim()]),
  ) as Record<Token, string>;

  const tooltip: Partial<TooltipOptions> = {
    backgroundColor: colors.surface,
    titleColor: colors.ink,
    bodyColor: colors['ink-muted'],
    borderColor: colors['line-strong'],
    borderWidth: 1,
    padding: 10,
    cornerRadius: 8,
    displayColors: false,
    titleFont: { weight: 'bold' },
  };
  return { colors, tooltip };
}
