import { CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Tone = 'error' | 'success';

const TONES: Record<Tone, string> = {
  error: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium',
        TONES[tone],
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
