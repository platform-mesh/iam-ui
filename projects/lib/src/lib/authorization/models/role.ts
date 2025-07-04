import { Permission } from './permission';

export interface Role {
  displayName: string;
  technicalName: string;
  permissions?: Permission[];
}
