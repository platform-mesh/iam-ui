import {
  NodeContext,
  Role,
  RoleAssignmentResult,
  RoleRemovalResult,
  User,
  UserConnection,
} from '../models';
import { PageInput, ResourceContext, SortByInput } from '../models/resource';
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
import { Injectable } from '@angular/core';
import { Observable, combineLatest, first, forkJoin, mergeMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  constructor(
    private apolloClientService: IamApolloClientService,
    private luigiContextService: IamLuigiContextService,
  ) {}

  users(
    cfg: {
      roleFilters?: string[];
      sortBy?: SortByInput;
      page?: PageInput;
    } = {},
  ): Observable<UserConnection> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      mergeMap(([apollo, ctx]) =>
        apollo.query<{ users: UserConnection }>({
          query: USERS,
          variables: {
            context: this.getResourceContext(ctx.context),
            roleFilters: cfg.roleFilters,
            sortBy: cfg.sortBy,
            page: cfg.page,
          },
          fetchPolicy: 'no-cache',
        }),
      ),
      map((apolloResponse) => {
        return apolloResponse.data.users;
      }),
    );
  }

  knownUsers(
    cfg: {
      roleFilters?: string[];
      sortBy?: SortByInput;
      page?: PageInput;
    } = {},
  ): Observable<UserConnection> {
    return this.apolloClientService.apollo().pipe(
      mergeMap((apollo) =>
        apollo.query<{ knownUsers: UserConnection }>({
          query: KNOWN_USERS,
          variables: {
            sortBy: cfg.sortBy,
            page: cfg.page,
          },
          fetchPolicy: 'no-cache',
        }),
      ),
      map((apolloResponse) => {
        return apolloResponse.data.knownUsers;
      }),
    );
  }

  user(userId: string): Observable<User> {
    return this.apolloClientService.apollo().pipe(
      mergeMap((apollo) =>
        apollo.query<{ user: User }>({
          query: USER,
          variables: {
            userId,
          },
          fetchPolicy: 'no-cache',
        }),
      ),
      map((apolloResponse) => {
        return apolloResponse.data.user;
      }),
    );
  }

  me(): Observable<User> {
    return this.apolloClientService.apollo().pipe(
      mergeMap((apollo) =>
        apollo.query<{ me: User }>({
          query: ME,
          fetchPolicy: 'no-cache',
        }),
      ),
      map((apolloResponse) => {
        return apolloResponse.data.me;
      }),
    );
  }

  roles(): Observable<Role[]> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      mergeMap(([apollo, ctx]) => {
        return apollo.query<{ roles: Role[] }>({
          query: ROLES,
          variables: {
            context: this.getResourceContext(ctx.context),
          },
          fetchPolicy: 'no-cache',
        });
      }),
      map((apolloResponse) => {
        return apolloResponse.data.roles;
      }),
    );
  }

  assignRolesToUser(
    user: User,
    roles: Role[],
  ): Observable<RoleAssignmentResult | undefined> {
    const rolesTechnicalNames = roles.map((role) => role.id);
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx]) => {
        return apollo.mutate<{ assignRolesToUsers: RoleAssignmentResult }>({
          mutation: ASSIGN_ROLES_TO_USERS,
          variables: {
            context: this.getResourceContext(ctx.context),
            changes: [
              {
                userId: user.userId,
                roles: rolesTechnicalNames,
              },
            ],
          },
        });
      }),
      map((response) => {
        return response.data?.assignRolesToUsers;
      }),
    );
  }

  removeRole(
    user: User,
    roleId: string,
  ): Observable<RoleRemovalResult | undefined> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx]) => {
        return apollo
          .mutate<{ removeRole: RoleRemovalResult }>({
            mutation: REMOVE_ROLE,
            variables: {
              context: this.getResourceContext(ctx.context),
              input: { userId: user.userId, role: roleId },
            },
          })
          .pipe(map((response) => response.data?.removeRole));
      }),
    );
  }

  private getResourceContext(context: NodeContext): ResourceContext {
    const group =
      context.resourceDefinition.group !== 'core.platform-mesh.io'
        ? ''
        : context.resourceDefinition.group;

    const accountPath =
      context.resourceDefinition.kind === 'Account'
        ? context.kcpPath?.replace(`:${context.entityName}`, '')
        : context.kcpPath;

    const namespace =
      context.resourceDefinition.scope === 'Namespaced'
        ? context.namespaceId
        : undefined;

    return {
      group,
      kind: context.resourceDefinition.kind,
      resource: {
        name: context.entityName,
        namespace,
      },
      accountPath,
    };
  }
}
