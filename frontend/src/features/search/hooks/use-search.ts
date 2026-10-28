import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search-api';

export function useSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}
