import { gql } from 'apollo-angular';

export const USERS_OF_ENTITY = gql`
  query usersOfEntity(
    $tenantId: ID!
    $entity: EntityInput!
    $limit: Int
    $page: Int
    $showInvitees: Boolean
    $searchTerm: String
    $roles: [RoleInput]
    $sortBy: SortByInput
  ) {
    usersOfEntity(
      tenantId: $tenantId
      entity: $entity
      limit: $limit
      page: $page
      showInvitees: $showInvitees
      searchTerm: $searchTerm
      roles: $roles
      sortBy: $sortBy
    ) {
      users {
        user {
          userId
          email
          firstName
          lastName
          invitationOutstanding
        }
        roles {
          displayName
          technicalName
        }
      }
      pageInfo {
        ownerCount
        totalCount
      }
    }
  }
`;

export const REMOVE_FROM_ENTITY = gql`
  mutation (
    $tenantId: ID!
    $entityType: String!
    $userId: ID!
    $entityId: ID!
  ) {
    removeFromEntity(
      tenantId: $tenantId
      entityType: $entityType
      userId: $userId
      entityId: $entityId
    )
  }
`;

export const LEAVE_ENTITY = gql`
  mutation ($tenantId: ID!, $entityType: String!, $entityId: ID!) {
    leaveEntity(
      tenantId: $tenantId
      entityType: $entityType
      entityId: $entityId
    )
  }
`;

export const ASSIGN_ROLE_BINDINGS = gql`
  mutation (
    $tenantId: ID!
    $entityType: String!
    $entityId: ID!
    $input: [Change]!
  ) {
    assignRoleBindings(
      tenantId: $tenantId
      entityType: $entityType
      entityId: $entityId
      input: $input
    )
  }
`;

export const INVITE_USER = gql`
  mutation ($tenantId: String!, $invite: Invite!, $notifyByEmail: Boolean!) {
    inviteUser(
      tenantId: $tenantId
      invite: $invite
      notifyByEmail: $notifyByEmail
    )
  }
`;

export const DELETE_INVITE = gql`
  mutation ($tenantId: String!, $invite: Invite!) {
    deleteInvite(tenantId: $tenantId, invite: $invite)
  }
`;

export const GET_USERS = gql`
  query ($tenantId: String!, $limit: Int, $page: Int) {
    usersConnection(tenantId: $tenantId, limit: $limit, page: $page) {
      pageInfo {
        totalCount
      }
      user {
        userId
        firstName
        lastName
        email
        invitationOutstanding
        groupAssignments {
          scope
        }
      }
    }
  }
`;

export const GET_TENANT_INFO = gql`
  query ($tenantId: String!) {
    tenantInfo(tenantId: $tenantId) {
      emailDomains
    }
  }
`;

export const GET_AVAILABLE_ROLES_FOR_ENTITY_TYPE = gql`
  query ($tenantId: ID!, $entityType: String!) {
    availableRolesForEntityType(tenantId: $tenantId, entityType: $entityType) {
      displayName
      technicalName
    }
  }
`;
