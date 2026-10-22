import { Link } from 'react-router';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Buat akun"
      description="Akun baru langsung bisa dipakai untuk topup dan transfer."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="text-brand font-semibold hover:underline"
          >
            Masuk
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
