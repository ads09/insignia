import { CircleAlert, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 px-5 py-12 text-center"
    >
      <span className="bg-danger-soft text-danger grid size-10 place-items-center rounded-full">
        <CircleAlert aria-hidden="true" className="size-5" />
      </span>
      <p className="text-ink max-w-sm text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span className="bg-surface-muted text-ink-subtle grid size-10 place-items-center rounded-full">
        <Inbox aria-hidden="true" className="size-5" />
      </span>
      <p className="text-ink-muted max-w-sm text-sm">{message}</p>
      {action}
    </div>
  );
}
