import { SearchResultItem } from './search-result.item';

export interface PpmsSearchResultItem extends SearchResultItem {
  id: string;
  name: string;
  officialName: string;
  technicalName: string;
  url: string;
  tenant: string;
}
