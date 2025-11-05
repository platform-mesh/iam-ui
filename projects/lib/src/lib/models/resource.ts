export interface PageInput {
  limit?: number;
  page?: number;
}

export interface UserRoleChange {
  userId: string;
  roles: string[];
}

export interface RemoveRoleInput {
  userId: string;
  role: string;
}

export interface RoleAssignmentResult {
  success: boolean;
  errors: String[];
  assignedCount: number;
}

export interface RoleRemovalResult {
  success: boolean;
  errors: String[];
  wasAssigned: boolean;
}

export enum UserSortField {
  userId = 'userId',
  email = 'email',
  firstName = 'firstName',
  lastName = 'lastName',
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export interface SortByInput {
  field: UserSortField;
  direction: SortDirection;
}

export interface Resource {
  name: string;
  namespace?: string;
}

export interface ResourceContext {
  group: string;
  kind: string;
  resource: Resource;
  accountPath: string;
}
