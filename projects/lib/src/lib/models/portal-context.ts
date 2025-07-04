/**
 * The PortalContext is provided by the DXP application frame and offers the URLs to the various DXP services.
 * It can be retrieved from the luigi context data by using the property 'portalContext'.
 */
export interface PortalContext extends Record<string, string> {
  accountSearchServiceApiUrl: string;
  accountsServiceApiUrl: string;
  automaticDServiceApiUrl: string;
  componentSearchServiceApiUrl: string;
  dynatraceRumConfig: string;
  dynatraceRumScript: string;
  extensionManagerMissingMandatoryDataUrl: string;
  extensionManagerServiceApiUrl: string;
  githubCCServiceApiUrl: string;
  githubGoServiceApiUrl: string;
  githubServiceApiUrl: string;
  iamServiceApiUrl: string;
  iamEntityConfig: string;
  metadataServiceApiUrl: string;
  organizationServiceApiUrl: string;
  pipelineBackendUrl: string;
  ppmsSearchServiceApiUrl: string;
  ppmsSuggestSearchServiceApiUrl: string;
  responsibilityAreaSearchServiceApiUrl: string;
  responsibilityAreaSuggestServiceApiUrl: string;
  searchGraphqlServiceApiUrl: string;
  stackSearchServiceApiUrl: string;
  suggestSearchServiceApiUrl: string;
  userSuggestSearchServiceApiUrl: string;
  environment: 'dev' | 'int' | 'prod';
}
