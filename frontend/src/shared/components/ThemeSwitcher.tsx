import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from '@/shared/lib/theme';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Tema terang', Icon: Sun },
  { value: 'dark', label: 'Tema gelap', Icon: Moon },
  { value: 'system', label: 'Ikuti sistem', Icon: Monitor },
];

export function ThemeSwitcher() {
  const preference = useThemePreference();

  return (
    <div
      role="group"
      aria-label="Tema"
      className="border-line bg-surface inline-flex rounded-lg border p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={preference === value}
          onClick={() => setThemePreference(value)}
          className={cn(
            'grid size-7 place-items-center rounded-md transition-colors',
            preference === value
              ? 'bg-brand-soft text-brand'
              : 'text-ink-subtle hover:text-ink',
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </button>
      ))}
    </div>
  );
}
