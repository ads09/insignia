import { useState } from 'react';
import { Panel } from '@/shared/components/Panel';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { TopUpForm } from './TopUpForm';
import { TransferForm } from './TransferForm';

type Action = 'topup' | 'transfer';

const ACTIONS = [
  { value: 'topup', label: 'Topup' },
  { value: 'transfer', label: 'Transfer' },
] as const;

const DESCRIPTIONS: Record<Action, string> = {
  topup: 'Tambahkan saldo ke dompet Anda.',
  transfer: 'Kirim saldo ke pengguna lain dengan username-nya.',
};

/** Topup and transfer in one card, one at a time. */
export function WalletForms({ className }: { className?: string }) {
  const [action, setAction] = useState<Action>('topup');

  return (
    <Panel
      title={action === 'topup' ? 'Topup saldo' : 'Transfer'}
      description={DESCRIPTIONS[action]}
      actions={
        <SegmentedControl
          label="Aksi"
          value={action}
          options={ACTIONS}
          onChange={setAction}
        />
      }
      className={className}
    >
      {action === 'topup' ? <TopUpForm /> : <TransferForm />}
    </Panel>
  );
}
