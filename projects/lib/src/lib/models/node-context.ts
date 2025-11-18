import { PortalContext } from './portal-context';

export interface EntityConfig {
  contextProperty: string;
}

export interface ResourceDefinition {
  group: string;
  kind: string;
  scope: string;
  namespace?: string;
}

export interface NodeContext extends Record<string, any> {
  token: string;
  userId: string;
  tenantId: string;
  // organization: string;
  // organizationId: string; // to be removed once migrated to the organizationId
  entityType: string;
  portalBaseUrl: string;
  portalContext: PortalContext;
  serviceProviderConfig: Record<string, string>;
  entityId: string;
  entity: any;
  componentId?: string;
  profileUserId?: string;
  analyticsTrackerConfig: AnalyzerTrackingConfig;
  entityName: string;
  kcpPath: string;
  namespaceId: string;
  resourceDefinition: ResourceDefinition;
  dashboard?: {
    sections: any;
    sidebar: any;
  };

  goBackContext?: any;
  parentNavigationContexts: string[];
}

export interface AnalyzerTrackingConfig {
  siteUrl?: string;
  jukeboxMatomoContainerId?: string;
  tenantIds?: string[];
}
