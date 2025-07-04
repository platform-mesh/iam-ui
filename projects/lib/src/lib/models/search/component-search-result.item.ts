import { SearchResultItem } from './search-result.item';

export interface ComponentType {
  name?: string;
  lifecycle?: string;
}

export interface ComponentSearchResultItem extends SearchResultItem {
  projectId: string;
  componentId: string;
  contributors?: string[];
  repositoryUrl: string[];
  teamName?: string;
  teamProductOwner?: string;
  teamTechnicalOwner?: string;
  description?: string;
  projectName?: string;
  status?: string;
  componentAutomationError?: string;
  tags?: string[];
  type?: ComponentType;
  activityScore?: number;
  kind?: string;
  logo?: string;
  labels?: Record<string, string>;
  boundedContext?: string;
  commitStatus?: string;
}
