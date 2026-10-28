import axios from '@/lib/api/axios';
import type { SearchResult } from '../types';

export const searchApi = {
  search: async (query: string): Promise<SearchResult[]> => {
    const { data } = await axios.get(`/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};
