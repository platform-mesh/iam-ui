import { Member } from './member';
import { PageInfo } from './page-info';
import { Role } from './role';

export interface RoleCount {
  role: Role;
  count: number;
}

export interface UserConnection {
  users: Member[];
  pageInfo: PageInfo;
  roleCounts: RoleCount[];
}
