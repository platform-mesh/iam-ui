import { User } from '../../models';

export interface UserWithProjectId {
  user: User;
  projectId: string;
}
