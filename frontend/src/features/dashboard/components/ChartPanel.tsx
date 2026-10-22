import type { UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { toApiError } from '@/shared/api/api-error';
import { Panel } from '@/shared/components/Panel';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { EmptyState, ErrorState } from '@/shared/components/States';

type View = 'chart' | 'table';

const VIEWS = [
  { value: 'chart', label: 'Grafik' },
  { value: 'table', label: 'Tabel' },
] as const;

interface ChartPanelProps<T> {
  title: string;
  description: string;
  query: UseQueryResult<T[]>;
  emptyMessage: string;
  legend?: ReactNode;
  renderChart: (data: T[]) => ReactNode;
  renderTable: (data: T[]) => ReactNode;
}

/**
 * A chart with its loading, error and empty states, and a table view of the
 * same data for readers who cannot use the chart.
 */
export function ChartPanel<T>({
  title,
  description,
  query,
  emptyMessage,
  legend,
  renderChart,
  renderTable,
}: ChartPanelProps<T>) {
  const [view, setView] = useState<View>('chart');

  return (
    <Panel
      title={title}
      description={description}
      actions={
        <SegmentedControl
          label="Tampilan"
          value={view}
          options={VIEWS}
          onChange={setView}
        />
      }
    >
      {query.isPending ? (
        <div className="bg-surface-muted h-80 animate-pulse rounded-lg motion-reduce:animate-none 2xl:h-96" />
      ) : query.isError ? (
        <ErrorState
          message={toApiError(query.error).message}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : view === 'chart' ? (
        <>
          {legend}
          <div className="relative h-80 2xl:h-96">
            {renderChart(query.data)}
          </div>
        </>
      ) : (
        renderTable(query.data)
      )}
    </Panel>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: { key: string; label: ReactNode; value: ReactNode }[];
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-line text-ink-muted border-b text-left text-[13px]">
          <th scope="col" className="py-2 font-semibold">
            {headers[0]}
          </th>
          <th scope="col" className="py-2 text-right font-semibold">
            {headers[1]}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-line border-b last:border-0">
            <td className="py-2.5">{row.label}</td>
            <td className="tabular py-2.5 text-right font-semibold">
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Legend({
  items,
}: {
  items: { label: string; className: string }[];
}) {
  return (
    <ul className="text-ink-muted mb-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-sm ${item.className}`}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
