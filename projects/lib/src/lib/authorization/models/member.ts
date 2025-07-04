import { User } from '../../models';
import { Role } from './role';

export interface Member {
  user: User;
  roles: Role[];
}
