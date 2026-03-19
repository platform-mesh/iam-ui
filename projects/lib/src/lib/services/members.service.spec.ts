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
import { firstValueFrom, of } from 'rxjs';

describe('MemberService', () => {
  let service: MemberService;

  const mockApollo = {
    query: vi.fn(),
    mutate: vi.fn(),
  };

  const mockApolloClientService = {
    apollo: vi.fn(() => of(mockApollo)),
  };

  const mockLuigiContextService = {
    contextObservable: vi.fn(() =>
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
    vi.clearAllMocks();
  });

  it('users() should call apollo.query with correct variables', async () => {
    mockApollo.query.mockReturnValue(
      of({ data: { users: { items: [], total: 0 } } }),
    );

    const result = await firstValueFrom(service.users());
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
  });

  it('knownUsers() should query known users', async () => {
    mockApollo.query.mockReturnValue(
      of({ data: { knownUsers: { items: [], total: 0 } } }),
    );

    const result = await firstValueFrom(service.knownUsers());
    expect(result).toEqual({ items: [], total: 0 });
    expect(mockApollo.query).toHaveBeenCalledWith({
      query: KNOWN_USERS,
      variables: {
        sortBy: undefined,
        page: undefined,
      },
      fetchPolicy: 'no-cache',
    });
  });

  it('user() should query user by id', async () => {
    mockApollo.query.mockReturnValue(of({ data: { user: { userId: 'u1' } } }));

    const result = await firstValueFrom(service.user('u1'));
    expect(result).toEqual({ userId: 'u1' });
    expect(mockApollo.query).toHaveBeenCalledWith({
      query: USER,
      variables: { userId: 'u1' },
      fetchPolicy: 'no-cache',
    });
  });

  it('me() should query current user', async () => {
    mockApollo.query.mockReturnValue(of({ data: { me: { userId: 'me' } } }));

    const result = await firstValueFrom(service.me());
    expect(result).toEqual({ userId: 'me' });
    expect(mockApollo.query).toHaveBeenCalledWith({
      query: ME,
      fetchPolicy: 'no-cache',
    });
  });

  it('roles() should query roles with context', async () => {
    mockApollo.query.mockReturnValue(of({ data: { roles: [] } }));

    const result = await firstValueFrom(service.roles());
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
  });

  it('assignRolesToUser() should call mutation', async () => {
    mockApollo.mutate.mockReturnValue(
      of({ data: { assignRolesToUsers: { success: true } } }),
    );

    const response = await firstValueFrom(
      service.assignRolesToUser({ changes: [{ roles: ['r1'], userId: 'u1' }] }),
    );
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
  });

  it('removeRole() should call mutation', async () => {
    mockApollo.mutate.mockReturnValue(
      of({ data: { removeRole: { success: true } } }),
    );

    const result = await firstValueFrom(service.removeRole('u1', 'r1'));
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
