export enum AccountRole {
  TEAM = 'team',
  PROJECT = 'project',
}

export enum ProjectType {
  EXPERIMENT = 'experiment',
  PRODUCT = 'product',
}

export type AccountType = ProjectType | undefined;
