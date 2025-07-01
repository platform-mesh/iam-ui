import { AccountType } from './account';
import { SearchResultItem } from './search-result.item';

export interface AccountSearchResultItem extends SearchResultItem {
  id: string;
  description?: string;
  owner: string;
  member: string[];
  tags: string[];
  numberOfComponents: number;
  numberOfMembers: number;
  ppmsProductId: string;
  ppmsProductName: string;
  ppmsProductOfficialName: string;
  accountType: AccountType;
  activityScore?: number;
}
