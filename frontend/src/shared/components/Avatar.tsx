import { cn } from '@/shared/lib/cn';

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-brand-soft text-brand grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold uppercase',
        className,
      )}
    >
      {name.slice(0, 2)}
    </span>
  );
}
