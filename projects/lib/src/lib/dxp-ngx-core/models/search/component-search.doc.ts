import { Doc } from './doc';

export interface ComponentSearchDoc extends Doc {
  account: string;
  contributors?: string[];
  repositoryUrl: string[];
  teamName?: string[];
  teamProductOwner?: string[];
  teamTechnicalOwner?: string[];
  status?: string;
  description?: string[];
  projectName?: string[];
  componentAutomationError?: string;
  tag?: string[];
  typeName?: string;
  typeLifecycle?: string;
  activityScore?: number;
  logoData?: string;
  logoUrl?: string;
  labels?: Record<string, string>;
  boundedContext?: string;
  commitStatus?: string;
}
