import {
  ArrowLeftRight,
  ChartNoAxesColumn,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/shared/components/Logo';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';

interface AuthLayoutProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ArrowLeftRight,
    title: 'Topup dan transfer',
    text: 'Saldo berubah seketika, dan transfer tidak pernah membuat saldo minus.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Aktivitas dalam grafik',
    text: 'Pergerakan saldo, transaksi terbesar, dan pengguna paling aktif.',
  },
  {
    icon: ShieldCheck,
    title: 'Riwayat yang bisa ditelusuri',
    text: 'Cari, filter, dan urutkan setiap transaksi.',
  },
];

export function AuthLayout({
  title,
  description,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="bg-hero text-hero-muted hidden flex-col justify-between p-12 lg:flex">
        <Logo inverted />
        <div className="max-w-md">
          <h2 className="text-hero-ink text-3xl leading-tight font-extrabold tracking-tight">
            Dompet crypto Anda, lengkap dengan dashboard admin.
          </h2>
          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title: featureTitle, text }) => (
              <li key={featureTitle} className="flex gap-4">
                <span className="bg-hero-line text-hero-accent grid size-10 shrink-0 place-items-center rounded-xl">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-hero-ink font-bold">{featureTitle}</p>
                  <p className="mt-0.5">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs">Insignia Full Stack Technical Test</p>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <ThemeSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-ink-muted mt-1.5 mb-8">{description}</p>
            {children}
            <p className="text-ink-muted mt-6 text-center">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
