import { useMutation } from '@tanstack/react-query';
import { login, register } from '../api/auth.api';
import { useAuth } from '../context/useAuth';

export function useLogin() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => signIn(token),
  });
}

export function useRegister() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: register,
    onSuccess: ({ token }) => signIn(token),
  });
}
