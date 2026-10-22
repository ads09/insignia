import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/format';
import { useActivity } from '../hooks/useActivity';
import {
  ACTIVITY_DAYS,
  summarize,
  type ActivitySummary as Summary,
} from '../lib/activity';

interface Figure {
  key: keyof Omit<Summary, 'count'>;
  label: string;
  icon: LucideIcon;
  className: string;
}

const FIGURES: Figure[] = [
  {
    key: 'incoming',
    label: 'Transfer masuk',
    icon: ArrowDownLeft,
    className: 'bg-credit-soft text-credit-text',
  },
  {
    key: 'outgoing',
    label: 'Transfer keluar',
    icon: ArrowUpRight,
    className: 'bg-debit-soft text-debit-text',
  },
  {
    key: 'topups',
    label: 'Topup',
    icon: Plus,
    className: 'bg-topup-soft text-topup-text',
  },
];

/** Money in, out and topped up over the last 30 days, one card each. */
export function ActivitySummary({ className }: { className?: string }) {
  const activity = useActivity();
  const summary = activity.data
    ? summarize(activity.data.transactions)
    : undefined;

  return (
    <dl className={cn('grid gap-4 sm:grid-cols-3 xl:grid-cols-1', className)}>
      {FIGURES.map(({ key, label, icon: Icon, className: iconClass }) => (
        <div
          key={key}
          className="border-line bg-surface shadow-card flex min-w-0 items-center gap-4 rounded-xl border p-5"
        >
          <span
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-full',
              iconClass,
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <dt className="text-ink-muted text-[13px] font-semibold">
              {label}
            </dt>
            <dd className="tabular truncate text-2xl font-extrabold tracking-tight">
              {summary ? (
                formatAmount(summary[key])
              ) : (
                <span className="bg-surface-muted mt-1 block h-7 w-28 animate-pulse rounded motion-reduce:animate-none" />
              )}
            </dd>
            <dd className="text-ink-subtle text-xs">
              {ACTIVITY_DAYS} hari terakhir
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
