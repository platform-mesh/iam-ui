import { Member } from './member';
import { PageInfo } from './page-info';

export interface RoleCount {
  roleId: string;
  count: number;
}

export interface UserConnection {
  users: Member[];
  pageInfo: PageInfo;
  roleCounts: RoleCount[];
}
