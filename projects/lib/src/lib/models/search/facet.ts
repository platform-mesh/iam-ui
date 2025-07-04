import { Bucket } from './bucket';

export interface Facet {
  buckets: Bucket[];
  name: string;
  param: string;
}
