import { Role } from './role';
import { User } from './user';

export interface Member {
  user: User;
  roles: Role[];
}
