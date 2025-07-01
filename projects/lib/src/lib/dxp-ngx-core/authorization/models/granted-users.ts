import { Member } from './member';
import { PageInfo } from './page-info';

export interface GrantedUsers {
  users: Member[];
  pageInfo: PageInfo;
}
