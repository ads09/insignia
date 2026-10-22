import { cn } from '@/shared/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none',
        className,
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div
      role="status"
      className="text-ink-subtle flex min-h-[50vh] items-center justify-center"
    >
      <Spinner className="size-7" />
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
