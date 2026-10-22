import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { TYPE_LABELS, type TransactionType } from '../lib/labels';

const STYLES: Record<TransactionType, { icon: LucideIcon; className: string }> =
  {
    credit: {
      icon: ArrowDownLeft,
      className: 'bg-credit-soft text-credit-text',
    },
    debit: { icon: ArrowUpRight, className: 'bg-debit-soft text-debit-text' },
    topup: { icon: Plus, className: 'bg-topup-soft text-topup-text' },
    transfer: {
      icon: ArrowLeftRight,
      className: 'bg-surface-muted text-ink-muted',
    },
  };

export function TypeBadge({ type }: { type: TransactionType }) {
  const { icon: Icon, className } = STYLES[type];
  return (
    <span
      title={TYPE_LABELS[type]}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full p-1 text-xs font-semibold whitespace-nowrap sm:py-0.5 sm:pr-2.5 sm:pl-2',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {/* On narrow screens only the icon is shown; the label stays for screen readers. */}
      <span className="sr-only sm:not-sr-only">{TYPE_LABELS[type]}</span>
    </span>
  );
}
