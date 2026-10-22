import type { ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useChartTheme } from '@/shared/hooks/useChartTheme';
import { formatAmount, formatCompact } from '@/shared/lib/format';
import '@/shared/lib/chart';
import type { TopUser } from '../api/stats.api';
import { useTopUsers } from '../hooks/useStats';
import { ChartPanel, DataTable } from './ChartPanel';

function Chart({ data }: { data: TopUser[] }) {
  const { colors, tooltip } = useChartTheme();

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      tooltip: {
        ...tooltip,
        callbacks: {
          label: (item) => `Total keluar: ${formatAmount(item.parsed.x ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: colors.line },
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
      aria-label="Grafik batang top 10 pengguna berdasarkan total transfer keluar"
      role="img"
      options={options}
      data={{
        labels: data.map((user) => user.username),
        datasets: [
          {
            label: 'Total transfer keluar',
            data: data.map((user) => user.transacted_value),
            backgroundColor: colors.brand,
            borderRadius: 4,
            borderSkipped: 'start',
            maxBarThickness: 16,
          },
        ],
      }}
    />
  );
}

export function TopUsersChart() {
  const query = useTopUsers();

  return (
    <ChartPanel
      title="Top 10 pengguna"
      description="Total nilai transfer keluar per pengguna, dari semua pengguna."
      query={query}
      emptyMessage="Belum ada pengguna."
      renderChart={(data) => <Chart data={data} />}
      renderTable={(data) => (
        <DataTable
          headers={['Pengguna', 'Total keluar']}
          rows={data.map((user) => ({
            key: user.username,
            label: user.username,
            value: formatAmount(user.transacted_value),
          }))}
        />
      )}
    />
  );
}
