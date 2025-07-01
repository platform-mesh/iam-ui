import { Doc } from './doc';

export interface PpmsSearchDoc extends Doc {
  id: string;
  name: string;
  officialName: string;
  technicalName: string;
  url: string;
}
