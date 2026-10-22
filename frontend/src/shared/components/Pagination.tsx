import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '@/shared/config/pagination';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/format';
import { pageRange } from '@/shared/lib/page-range';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const PAGE_BUTTON =
  'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Navigasi halaman"
      className="text-ink-muted flex flex-wrap items-center justify-between gap-3 text-[13px]"
    >
      <div className="flex items-center gap-4">
        <p className="tabular">
          {formatAmount(first)}–{formatAmount(last)} dari {formatAmount(total)}{' '}
          transaksi
        </p>
        <label className="hidden items-center gap-2 sm:flex">
          Per halaman
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="border-line-strong bg-surface text-ink h-8 rounded-lg border px-2"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Sebelumnya"
          className={cn(PAGE_BUTTON, 'text-ink hover:bg-surface-muted')}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        {pageRange(page, Math.max(totalPages, 1)).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} aria-hidden="true" className="px-1">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Halaman ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                PAGE_BUTTON,
                'tabular',
                item === page
                  ? 'bg-brand text-brand-ink'
                  : 'text-ink hover:bg-surface-muted',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Berikutnya"
          className={cn(PAGE_BUTTON, 'text-ink hover:bg-surface-muted')}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </nav>
  );
}
