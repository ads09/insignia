import { Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';
import { TopUpForm } from './TopUpForm';
import { TransferForm } from './TransferForm';

type Action = 'topup' | 'transfer';

/** Topup and transfer buttons that open their form in a dialog. */
export function WalletActions({
  tone = 'default',
}: {
  tone?: 'default' | 'hero';
}) {
  const [open, setOpen] = useState<Action | null>(null);
  const close = () => setOpen(null);

  return (
    <>
      <Button
        variant={tone === 'hero' ? 'onHero' : 'primary'}
        onClick={() => setOpen('topup')}
      >
        <Plus aria-hidden="true" />
        Topup
      </Button>
      <Button
        variant={tone === 'hero' ? 'onHeroOutline' : 'secondary'}
        onClick={() => setOpen('transfer')}
      >
        <Send aria-hidden="true" />
        Transfer
      </Button>
      <Dialog
        open={open === 'topup'}
        onClose={close}
        title="Topup saldo"
        description="Saldo langsung bertambah setelah topup."
      >
        <TopUpForm />
      </Dialog>
      <Dialog
        open={open === 'transfer'}
        onClose={close}
        title="Transfer"
        description="Kirim saldo ke pengguna lain dengan username-nya."
      >
        <TransferForm />
      </Dialog>
    </>
  );
}
