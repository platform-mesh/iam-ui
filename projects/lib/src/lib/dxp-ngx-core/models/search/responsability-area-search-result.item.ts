import { SearchResultItem } from './search-result.item';

export interface ResponsibilityAreaSearchResultItem extends SearchResultItem {
  id: string;
  owner: string;
  tenant: string;
}
