import { AccountSearchDoc } from './account-search.doc';
import { ComponentSearchDoc } from './component-search.doc';
import { Doc } from './doc';
import { Facet } from './facet';
import { PpmsSearchDoc } from './ppms-search.doc';
import { ResponsibilityAreaSearchDoc } from './responsability-area-search.doc';

export interface SearchResponse<T extends Doc> {
  docs: T[];
  facets: Facet[];
  numFound: number;
  responseSize: number;
  status: number;
}

export type AccountSearchResponse = SearchResponse<AccountSearchDoc>;
export type ComponentSearchResponse = SearchResponse<ComponentSearchDoc>;
export type PpmsSearchResponse = SearchResponse<PpmsSearchDoc>;
export type ResponsibilityAreaSearchResponse =
  SearchResponse<ResponsibilityAreaSearchDoc>;
