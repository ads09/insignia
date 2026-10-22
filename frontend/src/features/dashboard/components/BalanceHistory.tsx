import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { toApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/components/Button';
import { useChartTheme } from '@/shared/hooks/useChartTheme';
import { formatAmount, formatCompact } from '@/shared/lib/format';
import '@/shared/lib/chart';
import { useBalance } from '@/features/wallet';
import { useActivity } from '../hooks/useActivity';
import {
  ACTIVITY_DAYS,
  balanceHistory,
  type BalancePoint,
} from '../lib/activity';

const dayFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
});
const tooltipFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Drawn on the dark balance card, so it uses the card's colours. */
function Chart({ points }: { points: BalancePoint[] }) {
  const { colors, tooltip } = useChartTheme();

  const options: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    plugins: {
      tooltip: {
        ...tooltip,
        callbacks: {
          title: (items) => tooltipFormat.format(items[0]?.parsed.x ?? 0),
          label: (item) => `Saldo: ${formatAmount(item.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        min: points[0]?.time,
        max: points.at(-1)?.time,
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: colors['hero-muted'],
          maxTicksLimit: 7,
          callback: (value) => dayFormat.format(Number(value)),
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: colors['hero-line'] },
        ticks: {
          color: colors['hero-muted'],
          maxTicksLimit: 4,
          callback: (value) => formatCompact(Number(value)),
        },
      },
    },
  };

  return (
    <Line
      aria-label={`Grafik garis saldo Anda selama ${ACTIVITY_DAYS} hari terakhir`}
      role="img"
      options={options}
      data={{
        datasets: [
          {
            label: 'Saldo',
            data: points.map((point) => ({ x: point.time, y: point.balance })),
            // The balance only changes at a transaction, so the line is
            // stepped: level until the next point, then up or down to it.
            stepped: 'before',
            borderColor: colors['hero-accent'],
            borderWidth: 2,
            backgroundColor: `${colors['hero-accent']}26`,
            fill: 'origin',
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: colors['hero-accent'],
            pointHoverBorderColor: colors.hero,
            pointHoverBorderWidth: 2,
          },
        ],
      }}
    />
  );
}

/** The balance over the last 30 days, rebuilt from the transactions. */
export function BalanceHistory() {
  const activity = useActivity();
  const balance = useBalance();

  const error = activity.error ?? balance.error;
  const complete = activity.data
    ? activity.data.total <= activity.data.transactions.length
    : true;

  return (
    <figure>
      <figcaption className="mb-3 text-xs font-semibold">
        {complete
          ? `Pergerakan saldo ${ACTIVITY_DAYS} hari terakhir`
          : `Pergerakan saldo dari ${activity.data?.transactions.length} transaksi terakhir`}
      </figcaption>
      {activity.isPending || balance.isPending ? (
        <div className="bg-hero-line h-52 animate-pulse rounded-lg motion-reduce:animate-none 2xl:h-64" />
      ) : error || !activity.data || balance.data === undefined ? (
        <div
          role="alert"
          className="flex h-52 flex-col items-start justify-center gap-3"
        >
          <p className="text-hero-ink">{toApiError(error).message}</p>
          <Button
            variant="onHeroOutline"
            size="sm"
            onClick={() => {
              void activity.refetch();
              void balance.refetch();
            }}
          >
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="relative h-52 2xl:h-64">
          <Chart
            points={balanceHistory(balance.data, activity.data.transactions, {
              from: new Date(`${activity.since}T00:00:00Z`).getTime(),
              now: activity.dataUpdatedAt,
              complete,
            })}
          />
        </div>
      )}
    </figure>
  );
}
