import { gql } from 'apollo-angular';

export const ROLES = gql`
  query ($context: ResourceContext!) {
    roles(context: $context) {
      id
      displayName
      description
    }
  }
`;

export const USERS = gql`
  query users(
    $context: ResourceContext!
    $roleFilters: [String!]
    $sortBy: SortByInput
    $page: PageInput
  ) {
    users(
      context: $context
      roleFilters: $roleFilters
      sortBy: $sortBy
      page: $page
    ) {
      users {
        user {
          userId
          email
          firstName
          lastName
        }
        roles {
          id
          displayName
          description
        }
      }
      pageInfo {
        count
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const KNOWN_USERS = gql`
  query knownUsers($sortBy: SortByInput, $page: PageInput) {
    knownUsers(sortBy: $sortBy, page: $page) {
      users {
        user {
          userId
          email
          firstName
          lastName
        }
        roles {
          id
          displayName
          description
        }
      }
      pageInfo {
        count
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const USER = gql`
  query user($userId: String!) {
    user(userId: $userId) {
      userId
      email
      firstName
      lastName
    }
  }
`;

export const ME = gql`
  query me {
    userId
    email
    firstName
    lastName
  }
`;

export const ASSIGN_ROLES_TO_USERS = gql`
  mutation ($context: ResourceContext!, $changes: [UserRoleChange!]!) {
    assignRolesToUsers(context: $context, changes: $changes) {
      success
      errors
      assignedCount
    }
  }
`;

export const REMOVE_ROLE = gql`
  mutation ($context: ResourceContext!, $input: RemoveRoleInput!) {
    removeRole(context: $context, input: $input) {
      success
      error
      wasAssigned
    }
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
