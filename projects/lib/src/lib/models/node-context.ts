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

// eslint-disable-line @typescript-eslint/no-explicit-any
export interface NodeContext extends Record<string, any> {
  token: string;
  userId: string;
  tenantId: string;
  organization: string;
  organizationId: string; // to be removed once migrated to the organizationId
  entityType: string;
  portalBaseUrl: string;
  portalContext: PortalContext;
  serviceProviderConfig: Record<string, string>;
  entityId: string;
  entity: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  componentId?: string;
  profileUserId?: string;
  analyticsTrackerConfig: AnalyzerTrackingConfig;
  entityName: string;
  kcpPath: string;
  namespaceId: string;
  resourceDefinition: ResourceDefinition;
  dashboard?: {
    sections: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    sidebar: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  entityContext: {
    [key: string]: {
      id: string;
      displayName: string;
      description?: string;
      policies: string[];
      automaticdNamespace?: string;
      type?: string;
      extensions?: {
        dora?: {
          identifier: string;
        };
        piper?: {
          enabled: boolean;
        };
      };
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goBackContext?: any;
  parentNavigationContexts: string[];

  extClassName?: string;
}

export interface AnalyzerTrackingConfig {
  siteUrl?: string;
  jukeboxMatomoContainerId?: string;
  tenantIds?: string[];
}
