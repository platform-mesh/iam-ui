import { GrantedUsers, Member, Role } from '../dxp-ngx-core/authorization';
import { User } from '../dxp-ngx-core/models';
import {
  DxpLuigiContextService,
  IamApolloClientService,
  LuigiClient,
} from '../dxp-ngx-core/services';
import { TestUtils } from '../dxp-ngx-core/test';
import {
  ASSIGN_ROLE_BINDINGS,
  DELETE_INVITE,
  GET_AVAILABLE_ROLES_FOR_ENTITY_TYPE,
  LEAVE_ENTITY,
  REMOVE_FROM_ENTITY,
  USERS_OF_ENTITY,
} from '../queries/iam-queries';
import { MemberService } from './member.service';
import { TeamService } from './team.service';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

const mockContext = {
  parentNavigationContexts: ['project', 'projects'],

  token: 'some-token',
  tenantid: 'tenantId',
  projectId: 'projectId',
};

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(DxpLuigiContextService, {
          contextObservable: jest
            .fn()
            .mockReturnValue(of({ context: mockContext })),
        }),
        MockProvider(IamApolloClientService),
        MockProvider(LuigiClient),
        MockProvider(TeamService),
      ],
    });
    service = TestBed.inject(MemberService);
  });

  it('should add multiple members to project', fakeAsync(() => {
    const user = mock<User>({ userId: 'userId' });
    const roles = mock<Role[]>([{ technicalName: 'member' }]);
    const member: Member = { user, roles };
    const mutate = jest.fn().mockReturnValue(of({ foo: 'bar' }));
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ mutate }));

    TestUtils.getLastValue(service.addMembersWithFga([member, member, member]));

    expect(mutate).toHaveBeenCalledTimes(3);
    expect(mutate).toHaveBeenCalledWith({
      mutation: ASSIGN_ROLE_BINDINGS,
      variables: {
        tenantId: mockContext.tenantid,
        entityType: 'project',
        entityId: mockContext.projectId,
        input: [
          {
            userId: user.userId,
            roles: roles.map((role) => role.technicalName),
          },
        ],
      },
    });
  }));

  it('should remove member from project', fakeAsync(() => {
    const mockUser: User = {
      userId: 'user-a',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email@email.com',
    };

    const removeFromEntity = jest.fn().mockReturnValue(
      of({
        data: {
          removeFromEntity: true,
        },
      }),
    );
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ mutate: removeFromEntity }));

    const result = TestUtils.getLastValue(service.removeFromEntity(mockUser));

    expect(removeFromEntity).toHaveBeenCalledWith({
      mutation: REMOVE_FROM_ENTITY,
      variables: {
        tenantId: mockContext.tenantid,
        entityType: 'project',
        entityId: mockContext.projectId,
        userId: mockUser.userId,
      },
    });
    expect(result).toEqual(true);
  }));

  it('should remove users without id from invites', fakeAsync(() => {
    const deleteInvite = jest.fn().mockReturnValue(
      of({
        data: {
          deleteInvite: true,
        },
      }),
    );
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ mutate: deleteInvite }));
    const userWithoutId: User = {
      userId: undefined,
      email: 'user@sap.com',
    };
    const result = TestUtils.getLastValue(
      service.removeFromEntity(userWithoutId),
    );

    expect(deleteInvite).toHaveBeenCalledWith({
      mutation: DELETE_INVITE,
      variables: {
        tenantId: mockContext.tenantid,
        invite: {
          email: 'user@sap.com',
          entity: {
            entityType: 'project',
            entityId: mockContext.projectId,
          },
          roles: [],
        },
      },
    });
    expect(result).toEqual(true);
  }));

  it('should allow leaving', fakeAsync(() => {
    const mutate = jest.fn().mockReturnValue(of({ data: {} }));
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ mutate }));

    TestUtils.getLastValue(service.leaveEntity());

    expect(mutate).toHaveBeenCalledWith({
      mutation: LEAVE_ENTITY,
      variables: {
        tenantId: mockContext.tenantid,
        entityType: 'project',
        entityId: mockContext.projectId,
      },
    });
  }));

  describe('usersOfEntity', () => {
    let apolloClientServiceMock: IamApolloClientService;

    beforeEach(() => {
      apolloClientServiceMock = TestBed.inject(IamApolloClientService);
    });

    it('should fetch users with default parameters', fakeAsync(() => {
      const mockGrantedUsers: GrantedUsers = {
        users: [],
        pageInfo: {
          totalCount: 0,
          ownerCount: 0,
        },
      };

      const query = jest.fn().mockReturnValue(
        of({
          data: {
            usersOfEntity: mockGrantedUsers,
          },
        }),
      );

      apolloClientServiceMock.apollo = jest.fn().mockReturnValue(of({ query }));

      const result = TestUtils.getLastValue(service.usersOfEntity());

      expect(query).toHaveBeenCalledWith({
        query: USERS_OF_ENTITY,
        variables: {
          tenantId: mockContext.tenantid,
          entity: {
            entityType: 'project',
            entityId: mockContext.projectId,
          },
          limit: 10,
          page: 1,
          showInvitees: false,
          searchTerm: undefined,
          roles: [],
        },
        fetchPolicy: 'no-cache',
      });
      expect(result).toEqual(mockGrantedUsers);
    }));

    it('should fetch users with custom parameters', fakeAsync(() => {
      const mockGrantedUsers: GrantedUsers = {
        users: [],
        pageInfo: {
          totalCount: 0,
          ownerCount: 0,
        },
      };

      const mockRoles: Role[] = [
        {
          technicalName: 'admin',
          displayName: 'Administrator',
        },
      ];

      const query = jest.fn().mockReturnValue(
        of({
          data: {
            usersOfEntity: mockGrantedUsers,
          },
        }),
      );

      apolloClientServiceMock.apollo = jest.fn().mockReturnValue(of({ query }));

      const result = TestUtils.getLastValue(
        service.usersOfEntity({
          limit: 20,
          page: 2,
          showInvitees: true,
          searchTerm: 'john',
          roles: mockRoles,
        }),
      );

      expect(query).toHaveBeenCalledWith({
        query: USERS_OF_ENTITY,
        variables: {
          tenantId: mockContext.tenantid,
          entity: {
            entityType: 'project',
            entityId: mockContext.projectId,
          },
          limit: 20,
          page: 2,
          showInvitees: true,
          searchTerm: 'john',
          roles: [
            {
              technicalName: 'admin',
              displayName: 'Administrator',
            },
          ],
        },
        fetchPolicy: 'no-cache',
      });
      expect(result).toEqual(mockGrantedUsers);
    }));

    it('should handle empty roles array correctly', fakeAsync(() => {
      const mockGrantedUsers: GrantedUsers = {
        users: [],
        pageInfo: {
          totalCount: 0,
          ownerCount: 0,
        },
      };

      const query = jest.fn().mockReturnValue(
        of({
          data: {
            usersOfEntity: mockGrantedUsers,
          },
        }),
      );

      apolloClientServiceMock.apollo = jest.fn().mockReturnValue(of({ query }));

      const result = TestUtils.getLastValue(
        service.usersOfEntity({
          roles: [],
        }),
      );

      expect(query).toHaveBeenCalledWith({
        query: USERS_OF_ENTITY,
        variables: {
          tenantId: mockContext.tenantid,
          entity: {
            entityType: 'project',
            entityId: mockContext.projectId,
          },
          limit: 10,
          page: 1,
          showInvitees: false,
          searchTerm: undefined,
          roles: [],
        },
        fetchPolicy: 'no-cache',
      });
      expect(result).toEqual(mockGrantedUsers);
    }));
  });

  describe('navigateToList', () => {
    let navigate: jest.Mock;
    beforeEach(() => {
      navigate = jest.fn();
      TestBed.inject(LuigiClient).linkManager = jest
        .fn()
        .mockReturnValue({ navigate });
    });

    it('should work for teams', fakeAsync(() => {
      // @ts-ignore
      service['entity'] = of('team');
      service.navigateToList();
      expect(navigate).toHaveBeenCalledWith('/teams');
    }));

    it('should work for projects', fakeAsync(() => {
      // @ts-ignore
      service['entity'] = of('project');
      service.navigateToList();
      expect(navigate).toHaveBeenCalledWith('/projects');
    }));
  });

  it('should get roles for an entity', fakeAsync(() => {
    const availableRolesForEntityType = mock<Role[]>();
    const query = jest.fn().mockReturnValue(
      of({
        data: { availableRolesForEntityType },
      }),
    );
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ query }));

    const result = TestUtils.getLastValue(
      service.getAvailableRolesForEntityType(),
    );

    expect(query).toHaveBeenCalledWith({
      query: GET_AVAILABLE_ROLES_FOR_ENTITY_TYPE,
      variables: {
        tenantId: mockContext.tenantid,
        entityType: 'project',
      },
      fetchPolicy: 'no-cache',
    });
    expect(result).toEqual(availableRolesForEntityType);
  }));

  it('should set the roles of a member', fakeAsync(() => {
    const user = mock<User>({ userId: 'foo' });
    const roles = mock<Role[]>([{ technicalName: 'bar' }]);
    const mutate = jest.fn().mockReturnValue(of({ foo: 'bar' }));
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ mutate }));

    TestUtils.getLastValue(service.setMemberRoles(user, roles, false));

    expect(mutate).toHaveBeenCalledWith({
      mutation: ASSIGN_ROLE_BINDINGS,
      variables: {
        tenantId: mockContext.tenantid,
        entityType: 'project',
        entityId: mockContext.projectId,
        input: [
          {
            userId: user.userId,
            roles: roles.map((role) => role.technicalName),
          },
        ],
      },
    });
  }));
});
