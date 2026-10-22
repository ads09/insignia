import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  /** Removes the body padding, for content that runs to the edges (tables). */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export function Panel({
  title,
  description,
  actions,
  flush = false,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        'border-line bg-surface shadow-card flex min-w-0 flex-col rounded-xl border',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-ink-muted mt-0.5 text-[13px]">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div
        className={cn(
          'flex-1',
          !flush && 'p-5',
          flush && Boolean(title || actions) && 'pt-4',
        )}
      >
        {children}
      </div>
    </section>
  );
}
