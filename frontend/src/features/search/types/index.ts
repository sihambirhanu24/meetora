export interface SearchResult {
  type: 'meeting' | 'workspace' | 'person';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  metadata?: any;
}
