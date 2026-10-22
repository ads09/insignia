import { ShieldAlert, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { buttonClasses } from '@/shared/lib/button-classes';

function StatusPage({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <span className="bg-surface text-ink-muted shadow-card grid size-12 place-items-center rounded-full [&_svg]:size-6">
        {icon}
      </span>
      <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-ink-muted max-w-sm">{message}</p>
      <Link to="/" className={buttonClasses('secondary', 'sm')}>
        Kembali ke dashboard
      </Link>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <StatusPage
      icon={<ShieldAlert aria-hidden="true" />}
      title="Akses ditolak"
      message="Halaman ini hanya bisa dibuka oleh administrator."
    />
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      icon={<SearchX aria-hidden="true" />}
      title="Halaman tidak ditemukan"
      message="Alamat yang Anda buka tidak ada."
    />
  );
}
