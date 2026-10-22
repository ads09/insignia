import { Link } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout
      title="Masuk"
      description="Gunakan username dan password akun Anda."
      footer={
        <>
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-brand font-semibold hover:underline"
          >
            Daftar
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
