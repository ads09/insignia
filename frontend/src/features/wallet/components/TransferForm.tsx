import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { toApiError } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/Field';
import { formatAmount } from '@/shared/lib/format';
import { useTransfer } from '../hooks/useWallet';
import { transferSchema } from '../schemas';

export function TransferForm() {
  const transfer = useTransfer();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof transferSchema>,
    unknown,
    z.output<typeof transferSchema>
  >({
    resolver: zodResolver(transferSchema),
    defaultValues: { to_username: '', amount: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        transfer.mutate(values, { onSuccess: () => reset() }),
      )}
      className="@container flex flex-col gap-4"
    >
      {transfer.isError && (
        <Alert tone="error">{toApiError(transfer.error).message}</Alert>
      )}
      {transfer.isSuccess && (
        <Alert tone="success">
          Transfer {formatAmount(transfer.variables.amount)} ke{' '}
          {transfer.variables.to_username} berhasil.
        </Alert>
      )}
      {/* Side by side when the form is wide enough, e.g. on the wallet page. */}
      <div className="grid gap-4 @md:grid-cols-2">
        <TextField
          label="Username tujuan"
          autoComplete="off"
          error={errors.to_username?.message}
          {...register('to_username')}
        />
        <TextField
          label="Nominal"
          inputMode="decimal"
          autoComplete="off"
          error={errors.amount?.message}
          {...register('amount')}
        />
      </div>
      <Button type="submit" loading={transfer.isPending} className="w-full">
        Kirim transfer
      </Button>
    </form>
  );
}
