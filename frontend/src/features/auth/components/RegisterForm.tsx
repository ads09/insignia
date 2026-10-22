import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toApiError } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/Field';
import { useRegister } from '../hooks/useAuthMutations';
import {
  PASSWORD_MIN_LENGTH,
  registerSchema,
  type RegisterValues,
} from '../schemas';

export function RegisterForm() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ username, password }) =>
        registerMutation.mutate({ username, password }),
      )}
      className="flex flex-col gap-4"
    >
      {registerMutation.isError && (
        <Alert tone="error">{toApiError(registerMutation.error).message}</Alert>
      )}
      <TextField
        label="Username"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        hint={`Minimal ${PASSWORD_MIN_LENGTH} karakter.`}
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Ulangi password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button
        type="submit"
        loading={registerMutation.isPending}
        className="mt-2 w-full"
      >
        Buat akun
      </Button>
    </form>
  );
}
