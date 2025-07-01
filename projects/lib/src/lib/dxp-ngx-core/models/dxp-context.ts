import { PortalContext } from './portal-context';

export interface EntityConfig {
  contextProperty: string;
}

// eslint-disable-line @typescript-eslint/no-explicit-any
export interface DxpContext extends Record<string, any> {
  token: string;
  userid: string;
  tenantid: string;
  organization: string;
  organizationId: string; // to be removed once migrated to the organizationId
  entityType: string;
  portalContext: PortalContext;
  serviceProviderConfig: Record<string, string>;
  projectId?: string;
  teamId?: string;
  accountId?: string;
  entityId: string;
  entity: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  componentId?: string;
  profileUserId?: string;
  analyticsTrackerConfig: AnalyzerTrackingConfig;
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
