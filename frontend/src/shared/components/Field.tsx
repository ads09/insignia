import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const CONTROL =
  'h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink shadow-card transition-colors placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-brand focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/20 aria-invalid:border-danger';

interface FieldShellProps {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

function FieldShell({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn(
          'text-ink text-[13px] font-semibold',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-message`} className="text-danger text-[13px]">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-message`} className="text-ink-muted text-[13px]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Keeps the label for screen readers only, e.g. in a toolbar. */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  /** An icon inside the field, before the text. */
  icon?: ReactNode;
  /** Text after the value, e.g. a unit. */
  suffix?: string;
}

export function TextField({
  label,
  hideLabel,
  hint,
  error,
  icon,
  suffix,
  className,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      className={className}
    >
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="text-ink-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 [&_svg]:size-4"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-message` : undefined}
          className={cn(CONTROL, icon ? 'pl-9' : undefined, suffix && 'pr-14')}
          {...props}
        />
        {suffix && (
          <span className="text-ink-subtle pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px] font-medium">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}
