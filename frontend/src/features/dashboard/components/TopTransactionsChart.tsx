import type { ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useChartTheme } from '@/shared/hooks/useChartTheme';
import { cn } from '@/shared/lib/cn';
import { formatCompact, formatSignedAmount } from '@/shared/lib/format';
import '@/shared/lib/chart';
import type { TopTransaction } from '../api/stats.api';
import { useTopTransactions } from '../hooks/useStats';
import { ChartPanel, DataTable, Legend } from './ChartPanel';

const describe = (amount: number) => (amount < 0 ? 'Keluar ke' : 'Masuk dari');

function Chart({ data }: { data: TopTransaction[] }) {
  const { colors, tooltip } = useChartTheme();

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      tooltip: {
        ...tooltip,
        callbacks: {
          title: (items) => {
            const transaction = items[0] && data[items[0].dataIndex];
            return transaction
              ? `${describe(transaction.amount)} ${transaction.username}`
              : '';
          },
          label: (item) => formatSignedAmount(item.parsed.x ?? 0),
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        // The zero line separates money in from money out, so it is drawn darker.
        grid: {
          color: (context) =>
            context.tick.value === 0 ? colors['ink-subtle'] : colors.line,
        },
        ticks: {
          color: colors['ink-subtle'],
          callback: (value) => formatCompact(Number(value)),
        },
      },
      y: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: colors.ink, font: { weight: 600 } },
      },
    },
  };

  return (
    <Bar
      aria-label="Grafik batang 10 transaksi terbesar Anda, masuk dan keluar"
      role="img"
      options={options}
      data={{
        labels: data.map((transaction) => transaction.username),
        datasets: [
          {
            label: 'Nilai transaksi',
            data: data.map((transaction) => transaction.amount),
            backgroundColor: data.map((transaction) =>
              transaction.amount < 0 ? colors.debit : colors.credit,
            ),
            borderRadius: 4,
            borderSkipped: 'start',
            maxBarThickness: 16,
          },
        ],
      }}
    />
  );
}

export function TopTransactionsChart() {
  const query = useTopTransactions();

  return (
    <ChartPanel
      title="10 transaksi terbesar Anda"
      description="Transfer masuk dan keluar dengan nilai terbesar, per lawan transaksi."
      query={query}
      emptyMessage="Belum ada transfer. Transaksi akan muncul di sini setelah Anda mengirim atau menerima transfer."
      legend={
        <Legend
          items={[
            { label: 'Masuk (credit)', className: 'bg-credit' },
            { label: 'Keluar (debit)', className: 'bg-debit' },
          ]}
        />
      }
      renderChart={(data) => <Chart data={data} />}
      renderTable={(data) => (
        <DataTable
          headers={['Lawan transaksi', 'Nominal']}
          rows={data.map((transaction, index) => ({
            key: String(index),
            label: `${describe(transaction.amount)} ${transaction.username}`,
            value: (
              <span
                className={cn(
                  transaction.amount < 0
                    ? 'text-debit-text'
                    : 'text-credit-text',
                )}
              >
                {formatSignedAmount(transaction.amount)}
              </span>
            ),
          }))}
        />
      )}
    />
  );
}
