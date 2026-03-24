import { Member } from './member';
import { PageInfo } from './page-info';

export interface UserConnection {
  users: Member[];
  pageInfo: PageInfo;
  ownersCount: number;
}
