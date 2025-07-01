import { Doc } from './doc';

export interface AccountSearchDoc extends Doc {
  accountRole: string;
  accountType?: string;
  activityScore?: number;
  description: string[];
  extendedBy: string[];
  frozen: boolean;
  owner: string;
  member: string[];
  tag: string[];
  numberOfComponents: number;
  numberOfMembers: number;
  ppmsProductId: string;
  ppmsProductName: string;
  ppmsProductOfficialName: string;
}
