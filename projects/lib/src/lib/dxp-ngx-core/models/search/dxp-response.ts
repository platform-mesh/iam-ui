import { AccountSearchDoc } from './account-search.doc';
import { ComponentSearchDoc } from './component-search.doc';
import { Doc } from './doc';
import { Facet } from './facet';
import { PpmsSearchDoc } from './ppms-search.doc';
import { ResponsibilityAreaSearchDoc } from './responsability-area-search.doc';

export interface DxpResponse<T extends Doc> {
  docs: T[];
  facets: Facet[];
  numFound: number;
  responseSize: number;
  status: number;
}

export type AccountSearchResponse = DxpResponse<AccountSearchDoc>;
export type ComponentSearchResponse = DxpResponse<ComponentSearchDoc>;
export type PpmsSearchResponse = DxpResponse<PpmsSearchDoc>;
export type ResponsibilityAreaSearchResponse =
  DxpResponse<ResponsibilityAreaSearchDoc>;
