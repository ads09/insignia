import { CircleAlert, Clock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { RecentTransactions } from '@/features/transactions';
import { PageHeader } from '@/shared/components/PageHeader';
import { BalanceCard } from '../components/BalanceCard';
import { WalletForms } from '../components/WalletForms';

const RULES: { icon: LucideIcon; text: string }[] = [
  {
    icon: CircleAlert,
    text: 'Satu topup harus lebih dari 0 dan kurang dari 10.000.000.',
  },
  { icon: ShieldCheck, text: 'Transfer ditolak jika saldo tidak mencukupi.' },
  { icon: Clock, text: 'Saldo langsung berubah setelah transaksi berhasil.' },
];

export function WalletPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title="Dompet"
        description="Isi saldo atau kirim ke pengguna lain."
      />
      <div className="grid gap-6 xl:grid-cols-12">
        {user && (
          <BalanceCard username={user.username} className="xl:col-span-5">
            <ul className="border-hero-line space-y-3 border-t pt-5 text-[13px]">
              {RULES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-2.5">
                  <Icon
                    aria-hidden="true"
                    className="text-hero-accent mt-0.5 size-4 shrink-0"
                  />
                  {text}
                </li>
              ))}
            </ul>
          </BalanceCard>
        )}
        <WalletForms className="xl:col-span-7" />
        <RecentTransactions className="xl:col-span-12" />
      </div>
    </>
  );
}
