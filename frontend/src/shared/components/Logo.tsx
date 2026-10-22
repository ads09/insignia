import { cn } from '@/shared/lib/cn';

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-brand text-brand-ink grid size-8 place-items-center rounded-lg">
        <svg viewBox="0 0 32 32" aria-hidden="true" className="size-6">
          <path
            d="M9 10.5h11.5a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5H11.5A2.5 2.5 0 0 1 9 21z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M9 10.5 18 8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="19" cy="17" r="1.7" fill="currentColor" />
        </svg>
      </span>
      <span
        className={cn(
          'text-[15px] font-extrabold tracking-tight',
          inverted ? 'text-hero-ink' : 'text-ink',
        )}
      >
        Insignia Wallet
      </span>
    </span>
  );
}
