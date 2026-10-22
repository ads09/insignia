import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { toApiError } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/Field';
import { formatAmount } from '@/shared/lib/format';
import { useTopUp } from '../hooks/useWallet';
import { topUpSchema } from '../schemas';

const QUICK_AMOUNTS = [50_000, 100_000, 500_000, 1_000_000];

export function TopUpForm() {
  const topUp = useTopUp();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof topUpSchema>,
    unknown,
    z.output<typeof topUpSchema>
  >({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ amount }) =>
        topUp.mutate(amount, { onSuccess: () => reset() }),
      )}
      className="@container flex flex-col gap-4"
    >
      {topUp.isError && (
        <Alert tone="error">{toApiError(topUp.error).message}</Alert>
      )}
      {topUp.isSuccess && (
        <Alert tone="success">
          Topup {formatAmount(topUp.variables)} berhasil.
        </Alert>
      )}
      <TextField
        label="Nominal"
        inputMode="decimal"
        autoComplete="off"
        hint="Lebih dari 0 dan kurang dari 10.000.000."
        error={errors.amount?.message}
        {...register('amount')}
      />
      <div
        role="group"
        aria-label="Nominal cepat"
        className="grid grid-cols-2 gap-2 @md:grid-cols-4"
      >
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() =>
              setValue('amount', String(amount), { shouldValidate: true })
            }
            className="tabular border-line-strong bg-surface text-ink hover:border-brand hover:text-brand h-9 rounded-lg border text-[13px] font-semibold transition-colors"
          >
            {formatAmount(amount)}
          </button>
        ))}
      </div>
      <Button type="submit" loading={topUp.isPending} className="w-full">
        Topup saldo
      </Button>
    </form>
  );
}
