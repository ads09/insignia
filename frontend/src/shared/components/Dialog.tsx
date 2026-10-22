import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * A modal dialog on the native <dialog> element, which provides the focus
 * trap, Escape to close and the inert background.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    // Closing on a backdrop click is a mouse shortcut; the keyboard has Escape
    // and the close button.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className="border-line bg-surface text-ink shadow-overlay m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border p-0"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2
                id="dialog-title"
                className="text-lg font-bold tracking-tight"
              >
                {title}
              </h2>
              {description && (
                <p className="text-ink-muted mt-1">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="text-ink-subtle hover:bg-surface-muted hover:text-ink -mt-1 -mr-2 grid size-8 place-items-center rounded-lg"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
