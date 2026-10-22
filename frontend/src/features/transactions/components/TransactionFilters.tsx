import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/Field';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { cn } from '@/shared/lib/cn';
import { hasActiveFilters } from '../lib/filters';
import type { TransactionFilters as Filters } from '../types';
import { DebouncedTextField } from './DebouncedTextField';

interface TransactionFiltersProps<Type extends string> {
  filters: Filters<Type>;
  typeOptions: readonly { value: Type; label: string }[];
  searchLabel: string;
  /** Shows the exact username filter of the administrator list. */
  showUsername?: boolean;
  onChange: (patch: Partial<Filters<Type>>) => void;
  onReset: () => void;
}

const toAmount = (value: string) => {
  const number = Number(value.replace(',', '.'));
  return value.trim() === '' || !Number.isFinite(number) || number < 0
    ? undefined
    : number;
};

/** Filters shown behind the "Filter" button. */
function countAdvanced(filters: Filters): number {
  const { start_date, end_date, min_amount, max_amount, username } = filters;
  return [start_date, end_date, min_amount, max_amount, username].filter(
    (value) => value !== undefined,
  ).length;
}

export function TransactionFilters<Type extends string>({
  filters,
  typeOptions,
  searchLabel,
  showUsername = false,
  onChange,
  onReset,
}: TransactionFiltersProps<Type>) {
  const advancedCount = countAdvanced(filters);
  // Open when the page is loaded with such filters, e.g. from a shared link.
  const [advancedOpen, setAdvancedOpen] = useState(advancedCount > 0);

  const invalidDates =
    filters.start_date &&
    filters.end_date &&
    filters.start_date > filters.end_date;
  const invalidAmounts =
    filters.min_amount !== undefined &&
    filters.max_amount !== undefined &&
    filters.min_amount > filters.max_amount;

  return (
    <form
      role="search"
      aria-label="Filter transaksi"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <DebouncedTextField
          type="search"
          label={searchLabel}
          hideLabel
          icon={<Search />}
          placeholder={searchLabel}
          value={filters.search ?? ''}
          onCommit={(search) =>
            onChange({ search: search.trim() || undefined })
          }
          className="min-w-56 flex-1"
        />
        <SegmentedControl
          label="Tipe"
          value={filters.type ?? 'all'}
          options={[{ value: 'all', label: 'Semua' }, ...typeOptions]}
          onChange={(type) =>
            onChange({ type: type === 'all' ? undefined : (type as Type) })
          }
        />
        <Button
          variant="secondary"
          aria-expanded={advancedOpen}
          aria-controls="advanced-filters"
          onClick={() => setAdvancedOpen((open) => !open)}
        >
          <SlidersHorizontal aria-hidden="true" />
          Filter
          {advancedCount > 0 && (
            <span className="bg-brand text-brand-ink grid size-5 place-items-center rounded-full text-[11px]">
              {advancedCount}
            </span>
          )}
        </Button>
        {hasActiveFilters(filters) && (
          <Button variant="ghost" onClick={onReset}>
            <X aria-hidden="true" />
            Hapus filter
          </Button>
        )}
      </div>
      <div
        id="advanced-filters"
        hidden={!advancedOpen}
        className={cn(
          'border-line grid grid-cols-2 gap-4 border-t pt-4',
          showUsername ? 'lg:grid-cols-5' : 'lg:grid-cols-4',
        )}
      >
        {showUsername && (
          <DebouncedTextField
            label="Username terlibat"
            placeholder="Username persis"
            value={filters.username ?? ''}
            onCommit={(username) =>
              onChange({ username: username.trim() || undefined })
            }
            className="col-span-2 lg:col-span-1"
          />
        )}
        <TextField
          type="date"
          label="Dari tanggal"
          value={filters.start_date ?? ''}
          max={filters.end_date}
          onChange={(event) =>
            onChange({ start_date: event.target.value || undefined })
          }
        />
        <TextField
          type="date"
          label="Sampai tanggal"
          value={filters.end_date ?? ''}
          min={filters.start_date}
          error={invalidDates ? 'Harus setelah tanggal awal.' : undefined}
          onChange={(event) =>
            onChange({ end_date: event.target.value || undefined })
          }
        />
        <DebouncedTextField
          label="Nominal minimal"
          inputMode="decimal"
          placeholder="0"
          value={filters.min_amount?.toString() ?? ''}
          onCommit={(value) => onChange({ min_amount: toAmount(value) })}
        />
        <DebouncedTextField
          label="Nominal maksimal"
          inputMode="decimal"
          placeholder="Tanpa batas"
          value={filters.max_amount?.toString() ?? ''}
          error={
            invalidAmounts
              ? 'Harus lebih besar dari nominal minimal.'
              : undefined
          }
          onCommit={(value) => onChange({ max_amount: toAmount(value) })}
        />
      </div>
    </form>
  );
}
