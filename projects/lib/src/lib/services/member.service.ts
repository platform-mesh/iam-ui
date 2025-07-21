import { GrantedUsers, Member, Role } from '../authorization';
import { User } from '../models';
import {
  ASSIGN_ROLE_BINDINGS,
  GET_AVAILABLE_ROLES_FOR_ENTITY_TYPE,
  LEAVE_ENTITY,
  REMOVE_FROM_ENTITY,
  USERS_OF_ENTITY,
} from '../queries/iam-queries';
import { IamApolloClientService } from '../services/apollo';
import {
  IContextMessage,
  IamLuigiContextService,
  LuigiClient,
} from '../services/luigi';
import { getEntityId } from './entity-id';
import { InviteService } from './invite.service';
import { Injectable } from '@angular/core';
import { CollectionSort } from '@fundamental-ngx/platform';
import { Observable, combineLatest, first, forkJoin, mergeMap } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

interface RemoveFromEntityResponse {
  removeFromEntity: boolean;
}

interface LeaveEntityResponse {
  leaveEntity: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly entity: Observable<string>;

  constructor(
    private apolloClientService: IamApolloClientService,
    private luigiClient: LuigiClient,
    private luigiContextService: IamLuigiContextService,
    private inviteService: InviteService,
  ) {
    this.entity = this.luigiContextService.contextObservable().pipe(
      filter(
        (ctx: IContextMessage) =>
          ctx.context?.parentNavigationContexts !== undefined ||
          !!ctx.context?.entityType,
      ),
      map((ctx: IContextMessage) => {
        const parentNavigationContexts = ctx.context.parentNavigationContexts;
        return ctx.context.entityType || parentNavigationContexts[0];
      }),
    );
  }

  usersOfEntity(
    cfg: {
      limit?: number;
      page?: number;
      showInvitees?: boolean;
      searchTerm?: string;
      roles?: Role[];
      sortBy?: CollectionSort;
    } = {},
  ): Observable<GrantedUsers> {
    cfg = { limit: 10, page: 1, showInvitees: false, ...cfg };
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
      this.entity,
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx, entity]) =>
        apollo.query<{ usersOfEntity: GrantedUsers }>({
          query: USERS_OF_ENTITY,
          variables: {
            tenantId: ctx.context.tenantId || ctx.context.organizationId,
            entity: {
              entityType: entity,
              entityId: getEntityId(entity, ctx.context),
            },
            limit: cfg.limit,
            page: cfg.page,
            showInvitees: cfg.showInvitees,
            searchTerm: cfg.searchTerm,
            roles: (cfg.roles || []).map((role) => ({
              displayName: role.displayName,
              technicalName: role.technicalName,
            })),
            sortBy: cfg.sortBy,
          },
          fetchPolicy: 'no-cache',
        }),
      ),
      map((apolloResponse) => {
        return apolloResponse.data.usersOfEntity;
      }),
    );
  }

  getAvailableRolesForEntityType(): Observable<Role[]> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
      this.entity,
    ]).pipe(
      take(1),
      mergeMap(([apollo, ctx, entity]) => {
        return apollo.query<{ availableRolesForEntityType: Role[] }>({
          query: GET_AVAILABLE_ROLES_FOR_ENTITY_TYPE,
          variables: {
            tenantId: ctx.context.tenantId || ctx.context.organizationId,
            entityType: entity,
          },
          fetchPolicy: 'no-cache',
        });
      }),
      map((apolloResponse) => {
        return apolloResponse.data.availableRolesForEntityType;
      }),
    );
  }

  addMembersWithFga(members: Member[]): Observable<void> {
    const roleSettingObservables = members.map((member) =>
      this.setMemberRoles(member.user, member.roles, true),
    );

    return forkJoin(roleSettingObservables).pipe(map(() => undefined));
  }

  /**
   * Removes the given user from the current entity (project or team).
   * The current entity is determined by the Luigi context.
   */
  removeFromEntity(user: User): Observable<boolean> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
      this.entity,
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx, entity]) => {
        if (user.userId) {
          return apollo
            .mutate<RemoveFromEntityResponse>({
              mutation: REMOVE_FROM_ENTITY,
              variables: {
                tenantId: ctx.context.tenantId || ctx.context.organizationId,
                entityType: entity,
                entityId: getEntityId(entity, ctx.context),
                userId: user.userId,
              },
            })
            .pipe(
              map(
                (apolloResponse) =>
                  apolloResponse.data?.removeFromEntity ?? false,
              ),
            );
        }
        return this.inviteService.deleteInvite(
          apollo,
          ctx.context,
          entity,
          user,
        );
      }),
    );
  }

  /**
   * Initiates a leave request for the current user of the current entity (project or team).
   * The current entity is determined by the Luigi context.
   * The current user is determined by the subject of the Jwt WebToken  send with the request to iam-service.
   */
  leaveEntity(): Observable<void> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
      this.entity,
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx, entity]) =>
        apollo.mutate<LeaveEntityResponse>({
          mutation: LEAVE_ENTITY,
          variables: {
            tenantId: ctx.context.tenantId || ctx.context.organizationId,
            entityType: entity,
            entityId: getEntityId(entity, ctx.context),
          },
        }),
      ),
      map(() => undefined),
    );
  }

  /**
   * Assigns the given roles to the given user for the current entity (project or team).
   * @param user
   * @param roles
   * @param notifyInvitedMember
   */
  setMemberRoles(
    user: User,
    roles: Role[],
    notifyInvitedMember: boolean,
  ): Observable<void> {
    const rolesTechnicalNames = roles.map((role) => role.technicalName);
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
      this.entity,
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx, entity]) => {
        if (user.userId) {
          return apollo.mutate<boolean>({
            mutation: ASSIGN_ROLE_BINDINGS,
            variables: {
              tenantId: ctx.context.tenantId || ctx.context.organizationId,
              entityId: getEntityId(entity, ctx.context),
              entityType: entity,
              input: [
                {
                  userId: user.userId,
                  roles: rolesTechnicalNames,
                },
              ],
            },
          });
        } else {
          return this.inviteService.invite(
            apollo,
            ctx.context,
            entity,
            user,
            rolesTechnicalNames,
            notifyInvitedMember,
          );
        }
      }),
      map(() => undefined),
    );
  }

  /**
   * Returns the current entity type (project or team).
   * The current entity type is determined by the Luigi context.
   */
  currentEntity(): Observable<string> {
    return this.entity;
  }

  /**
   * Navigates to the list of projects or teams depending on the current entity type.
   * The current entity type is determined by the Luigi context.
   */
  navigateToList() {
    this.entity.pipe(first()).subscribe((entity) => {
      const routePath = entity === 'project' ? 'projects' : 'teams';
      this.luigiClient.linkManager().navigate(`/${routePath}`);
    });
  }
}
