import gql from 'graphql-tag';

export const GET_USER = gql`
  query ($tenantId: String!, $userId: String!) {
    user(tenantId: $tenantId, userId: $userId) {
      userId
      firstName
      lastName
      email
    }
  }
`;
