import { User } from './user';

export interface UserWithProjectId {
  user: User;
  projectId: string;
}
