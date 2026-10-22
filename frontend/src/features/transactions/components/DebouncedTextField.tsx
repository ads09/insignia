import {
  useEffect,
  useEffectEvent,
  useState,
  type ComponentProps,
} from 'react';
import { TextField } from '@/shared/components/Field';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

interface DebouncedTextFieldProps extends Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChange'
> {
  value: string;
  /** Called with the new value once the user stops typing. */
  onCommit: (value: string) => void;
}

/** A text field that reports its value only after the user stops typing. */
export function DebouncedTextField({
  value,
  onCommit,
  ...props
}: DebouncedTextFieldProps) {
  const [draft, setDraft] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const debounced = useDebouncedValue(draft);

  // The value changed from outside (filters reset, back button): show it.
  if (value !== previousValue) {
    setPreviousValue(value);
    setDraft(value);
  }

  const commit = useEffectEvent((next: string) => {
    if (next !== value) {
      onCommit(next);
    }
  });

  useEffect(() => {
    // Skip a stale debounced value left over from before an outside change.
    if (debounced === draft) {
      commit(debounced);
    }
  }, [debounced, draft]);

  return (
    <TextField
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      {...props}
    />
  );
}
