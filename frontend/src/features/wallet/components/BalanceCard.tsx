import type { ReactNode } from 'react';
import { toApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/format';
import { useBalance } from '../hooks/useWallet';

interface BalanceCardProps {
  username: string;
  /** Buttons beside the balance, e.g. topup and transfer. */
  actions?: ReactNode;
  /** Content at the bottom of the card. */
  children?: ReactNode;
  className?: string;
}

export function BalanceCard({
  username,
  actions,
  children,
  className,
}: BalanceCardProps) {
  const balance = useBalance();

  return (
    <section
      aria-labelledby="balance-heading"
      className={cn(
        'bg-hero text-hero-muted shadow-card flex min-w-0 flex-col gap-8 rounded-2xl p-6 sm:p-7',
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="min-w-0">
          <h2 id="balance-heading" className="text-[13px] font-semibold">
            Saldo dompet <span className="text-hero-ink">{username}</span>
          </h2>
          {balance.isPending ? (
            <div className="bg-hero-line mt-3 h-12 w-56 animate-pulse rounded-lg motion-reduce:animate-none" />
          ) : balance.isError ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p role="alert" className="text-hero-ink">
                {toApiError(balance.error).message}
              </p>
              <Button
                variant="onHeroOutline"
                size="sm"
                onClick={() => void balance.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : (
            <p className="tabular text-hero-ink mt-2 text-4xl font-extrabold tracking-tight break-all sm:text-5xl">
              {formatAmount(balance.data)}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </section>
  );
}
