import gql from 'graphql-tag';

export const UPDATE_EXTENSION_INSTANCE_IN_PROJECT = gql`
  mutation updateExtensionInstanceInProject(
    $tenantId: String!
    $projectId: String!
    $input: UpdateExtensionInput!
  ) {
    updateExtensionInstanceInProject(
      tenantId: $tenantId
      projectId: $projectId
      input: $input
    )
  }
`;
