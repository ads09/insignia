import { Avatar } from '@/shared/components/Avatar';

/** A username with its avatar, or a dash when there is none (topups). */
export function Party({ username }: { username: string | null }) {
  if (!username) {
    return <span className="text-ink-subtle">–</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={username} className="hidden size-7 text-[11px] sm:grid" />
      <span className="text-ink truncate font-semibold">{username}</span>
    </span>
  );
}
