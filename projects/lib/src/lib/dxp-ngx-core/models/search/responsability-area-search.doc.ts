import { Doc } from './doc';

export interface ResponsibilityAreaSearchDoc extends Doc {
  id: string;
  name: string;
  owner: string;
}
