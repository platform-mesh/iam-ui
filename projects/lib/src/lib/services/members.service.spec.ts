import {
  ASSIGN_ROLES_TO_USERS,
  KNOWN_USERS,
  ME,
  REMOVE_ROLE,
  ROLES,
  USER,
  USERS,
} from '../queries/iam-queries';
import { IamApolloClientService } from './apollo';
import { IamLuigiContextService } from './luigi';
import { MemberService } from './member.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

describe('MemberService', () => {
  let service: MemberService;

  const mockApollo = {
    query: jest.fn(),
    mutate: jest.fn(),
  };

  const mockApolloClientService = {
    apollo: jest.fn(() => of(mockApollo)),
  };

  const mockLuigiContextService = {
    contextObservable: jest.fn(() =>
      of({
        context: {
          resourceDefinition: {
            group: 'core.platform-mesh.io',
            kind: 'Account',
            scope: 'Namespaced',
          },
          entityName: 'account1',
          namespaceId: 'test-ns',
          kcpPath: 'root:account1',
        },
      }),
    ),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MemberService,
        { provide: IamApolloClientService, useValue: mockApolloClientService },
        { provide: IamLuigiContextService, useValue: mockLuigiContextService },
      ],
    });

    service = TestBed.inject(MemberService);
    jest.clearAllMocks();
  });

  it('users() should call apollo.query with correct variables', (done) => {
    mockApollo.query.mockReturnValue(
      of({ data: { users: { items: [], total: 0 } } }),
    );

    service.users().subscribe((result) => {
      expect(result).toEqual({ items: [], total: 0 });
      expect(mockApollo.query).toHaveBeenCalledWith({
        query: USERS,
        variables: {
          context: {
            group: 'core.platform-mesh.io',
            kind: 'Account',
            resource: { name: 'account1', namespace: 'test-ns' },
            accountPath: 'root',
          },
          roleFilters: undefined,
          sortBy: undefined,
          page: undefined,
        },
        fetchPolicy: 'no-cache',
      });
      done();
    });
  });

  it('knownUsers() should query known users', (done) => {
    mockApollo.query.mockReturnValue(
      of({ data: { knownUsers: { items: [], total: 0 } } }),
    );

    service.knownUsers().subscribe((result) => {
      expect(result).toEqual({ items: [], total: 0 });
      expect(mockApollo.query).toHaveBeenCalledWith({
        query: KNOWN_USERS,
        variables: {
          sortBy: undefined,
          page: undefined,
        },
        fetchPolicy: 'no-cache',
      });
      done();
    });
  });

  it('user() should query user by id', (done) => {
    mockApollo.query.mockReturnValue(of({ data: { user: { userId: 'u1' } } }));

    service.user('u1').subscribe((result) => {
      expect(result).toEqual({ userId: 'u1' });
      expect(mockApollo.query).toHaveBeenCalledWith({
        query: USER,
        variables: { userId: 'u1' },
        fetchPolicy: 'no-cache',
      });
      done();
    });
  });

  it('me() should query current user', (done) => {
    mockApollo.query.mockReturnValue(of({ data: { me: { userId: 'me' } } }));

    service.me().subscribe((result) => {
      expect(result).toEqual({ userId: 'me' });
      expect(mockApollo.query).toHaveBeenCalledWith({
        query: ME,
        fetchPolicy: 'no-cache',
      });
      done();
    });
  });

  it('roles() should query roles with context', (done) => {
    mockApollo.query.mockReturnValue(of({ data: { roles: [] } }));

    service.roles().subscribe((result) => {
      expect(result).toEqual([]);
      expect(mockApollo.query).toHaveBeenCalledWith({
        query: ROLES,
        variables: {
          context: {
            group: 'core.platform-mesh.io',
            kind: 'Account',
            resource: { name: 'account1', namespace: 'test-ns' },
            accountPath: 'root',
          },
        },
        fetchPolicy: 'no-cache',
      });
      done();
    });
  });

  it('assignRolesToUser() should call mutation', (done) => {
    mockApollo.mutate.mockReturnValue(
      of({ data: { assignRolesToUsers: { success: true } } }),
    );

    service
      .assignRolesToUser([{ roles: ['r1'], userId: 'u1' }])
      .subscribe((response) => {
        expect(response).toEqual({ success: true });
        expect(mockApollo.mutate).toHaveBeenCalledWith({
          mutation: ASSIGN_ROLES_TO_USERS,
          variables: {
            context: {
              group: 'core.platform-mesh.io',
              kind: 'Account',
              resource: { name: 'account1', namespace: 'test-ns' },
              accountPath: 'root',
            },
            changes: [{ userId: 'u1', roles: ['r1'] }],
          },
        });
        done();
      });
  });

  it('removeRole() should call mutation', (done) => {
    mockApollo.mutate.mockReturnValue(
      of({ data: { removeRole: { success: true } } }),
    );

    service.removeRole('u1', 'r1').subscribe((result) => {
      expect(result).toEqual({ success: true });
      expect(mockApollo.mutate).toHaveBeenCalledWith({
        mutation: REMOVE_ROLE,
        variables: {
          context: {
            group: 'core.platform-mesh.io',
            kind: 'Account',
            resource: { name: 'account1', namespace: 'test-ns' },
            accountPath: 'root',
          },
          input: { userId: 'u1', role: 'r1' },
        },
      });
      done();
    });
  });

  it('getResourceContext() should build correct context object', () => {
    const ctx: any = {
      resourceDefinition: {
        group: 'core.platform-mesh.io',
        kind: 'Account',
        scope: 'Namespaced',
      },
      entityName: 'abc',
      namespaceId: 'ns1',
      kcpPath: 'root:abc',
    };

    const result = (service as any).getResourceContext(ctx);

    expect(result).toEqual({
      group: 'core.platform-mesh.io',
      kind: 'Account',
      resource: { name: 'abc', namespace: 'ns1' },
      accountPath: 'root',
    });
  });
});
