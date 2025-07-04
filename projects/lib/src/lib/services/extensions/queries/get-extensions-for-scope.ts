import gql from 'graphql-tag';

export const EXTENSION_CLASS_FOR_SCOPE_QUERY = gql`
  query getExtensionClassForScope(
    $tenantId: String!
    $type: ScopeType!
    $context: ScopeContext!
    $extClassName: String!
    $filter: ExtensionClassFilter
  ) {
    getExtensionClassForScope(
      tenantId: $tenantId
      type: $type
      context: $context
      extClassName: $extClassName
      filter: $filter
    ) {
      name
      instances {
        name
        installationData
      }
    }
  }
`;
