import {
  ArrowLeftRight,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth, type Role } from '@/features/auth';
import { Avatar } from '@/shared/components/Avatar';
import { Logo } from '@/shared/components/Logo';
import { PageSpinner } from '@/shared/components/Spinner';
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher';
import { cn } from '@/shared/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { label: string; role?: Role; items: NavItem[] }[] = [
  {
    label: 'Menu',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/wallet', label: 'Dompet', icon: Wallet },
      { to: '/transactions', label: 'Transaksi saya', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Administrator',
    role: 'ADMIN',
    items: [
      { to: '/admin/transactions', label: 'Semua transaksi', icon: ListChecks },
    ],
  },
];

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' });

const ROLE_LABELS: Record<Role, string> = {
  USER: 'Pengguna',
  ADMIN: 'Administrator',
};

export function AppLayout() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [today] = useState(() => dateFormat.format(new Date()));
  const groups = NAV_GROUPS.filter(
    (group) => !group.role || group.role === user?.role,
  );

  return (
    <div className="min-h-svh lg:pl-64">
      <a
        href="#main"
        className="bg-surface sr-only z-[60] rounded-lg px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Langsung ke konten
      </a>

      {/* Sidebar: always visible on large screens, a drawer on small ones. */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        id="main-nav"
        className={cn(
          'border-line bg-surface fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform motion-reduce:transition-none lg:translate-x-0',
          // `invisible` keeps the closed drawer out of the tab order.
          menuOpen ? 'translate-x-0' : '-translate-x-full max-lg:invisible',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMenuOpen(false)}
            className="text-ink-muted hover:bg-surface-muted grid size-8 place-items-center rounded-lg lg:hidden"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <nav
          aria-label="Menu utama"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-4"
        >
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-ink-subtle px-3 pb-2 text-xs font-semibold">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 font-semibold transition-colors',
                          isActive
                            ? 'bg-brand-soft text-brand'
                            : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                        )
                      }
                    >
                      <Icon aria-hidden="true" className="size-[18px]" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {user && (
          <div className="border-line m-3 flex items-center gap-3 rounded-xl border p-3">
            <Avatar name={user.username} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{user.username}</p>
              <p className="text-ink-muted text-xs">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Keluar"
              aria-label="Keluar"
              className="text-ink-subtle hover:bg-surface-muted hover:text-ink grid size-8 place-items-center rounded-lg"
            >
              <LogOut aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </aside>

      <header className="border-line bg-canvas/85 sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen(true)}
            className="border-line bg-surface text-ink grid size-9 place-items-center rounded-lg border"
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>
          <Logo />
        </div>
        <p className="text-ink-muted hidden text-[13px] font-medium lg:block">
          {today}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </header>

      <main
        id="main"
        className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10"
      >
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
