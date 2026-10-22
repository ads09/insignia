import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/shared/api/query-keys';
import { getActivity } from '../api/activity.api';
import { activityStart } from '../lib/activity';

/** The signed-in user's transactions of the last 30 days. */
export function useActivity() {
  // Fixed for the lifetime of the page, so the query key stays stable.
  const [since] = useState(() => activityStart(new Date()));
  const query = useQuery({
    queryKey: queryKeys.activity(since),
    queryFn: () => getActivity(since),
  });
  return { ...query, since };
}
