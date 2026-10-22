const amountFormat = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
});

const signedAmountFormat = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
  signDisplay: 'exceptZero',
});

const compactFormat = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

const timeFormat = new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' });

export function formatAmount(value: number): string {
  return amountFormat.format(value);
}

/** `+1.000` / `-80`, for amounts whose sign carries meaning. */
export function formatSignedAmount(value: number): string {
  return signedAmountFormat.format(value);
}

/** Short form for chart axes: `12,5 rb`, `1,2 jt`. */
export function formatCompact(value: number): string {
  return compactFormat.format(value);
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}
