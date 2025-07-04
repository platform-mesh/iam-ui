export interface ExtensionClass {
  name: string;
  instances: ExtensionInstance[];
}

export interface ExtensionInstance {
  isMandatoryExtension?: boolean;
  installationData?: InstallationData;
}

export type InstallationData = Record<string, string>;

export interface ExtensionClassFilter {
  withInstances?: boolean;
  installableIn?: string[];
}

export interface UpdateExtensionInput {
  extensionClass: ExtensionClassInput;
  instanceId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  installationData: Record<string, any>;
}
export interface WatchExtensionInstanceResponse {
  watchExtensionInstance: ExtensionInstance;
}

export interface UpdateExtensionInputResponse {
  updateExtensionInstanceInProject: string;
}
export interface GetExtensionClassForScopeResponse {
  getExtensionClassForScope: ExtensionClass;
}

export interface ExtensionClassInput {
  id: string;
  scope: ScopeType;
}

export enum ScopeType {
  PROJECT = 'PROJECT',
  TEAM = 'TEAM',
  COMPONENT = 'COMPONENT',
  TENANT = 'TENANT',
  GLOBAL = 'GLOBAL',
}
