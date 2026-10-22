import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toApiError } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/Field';
import { useLogin } from '../hooks/useAuthMutations';
import { loginSchema, type LoginValues } from '../schemas';

export function LoginForm() {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
      className="flex flex-col gap-4"
    >
      {loginMutation.isError && (
        <Alert tone="error">{toApiError(loginMutation.error).message}</Alert>
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button
        type="submit"
        loading={loginMutation.isPending}
        className="mt-2 w-full"
      >
        Masuk
      </Button>
    </form>
  );
}
