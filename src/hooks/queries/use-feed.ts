import { useInfiniteQuery } from '@tanstack/react-query';

import { getFeed } from '@/lib/supabase/feed';

const PAGE_SIZE = 10;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }: { pageParam?: string }) => getFeed({ cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1].createdAt : undefined,
  });
}
