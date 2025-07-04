import gql from 'graphql-tag';

export const WATCH_EXTENSION_INSTANCE = gql`
  subscription watchExtensionInstance(
    $tenantId: String!
    $scope: String!
    $entity: String!
    $extInstanceName: String!
  ) {
    watchExtensionInstance(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      extInstanceName: $extInstanceName
    ) {
      id
      installationData
    }
  }
`;
