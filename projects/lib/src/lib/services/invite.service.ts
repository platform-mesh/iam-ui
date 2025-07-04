import { NodeContext, User } from '../models';
import { DELETE_INVITE, INVITE_USER } from '../queries/iam-queries';
import { getEntityId } from './entity-id';
import { Injectable } from '@angular/core';
import { ApolloBase } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DeleteInviteResponse {
  deleteInvite: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class InviteService {
  invite(
    apollo: ApolloBase,
    context: NodeContext,
    entity: string,
    user: User,
    roles: string[],
    notifyByEmail: boolean,
  ): Observable<void> {
    return apollo
      .mutate<boolean>({
        mutation: INVITE_USER,
        variables: {
          tenantId: context.tenantid || context.organizationId,
          invite: {
            email: user.email,
            entity: {
              entityType: entity,
              entityId: getEntityId(entity, context),
            },
            roles: roles,
          },
          notifyByEmail,
        },
      })
      .pipe(map(() => undefined));
  }

  deleteInvite(
    apollo: ApolloBase,
    context: NodeContext,
    entity: string,
    user: User,
  ): Observable<boolean> {
    return apollo
      .mutate<DeleteInviteResponse>({
        mutation: DELETE_INVITE,
        variables: {
          tenantId: context.tenantid || context.organizationId,
          invite: {
            email: user.email,
            entity: {
              entityType: entity,
              entityId: getEntityId(entity, context),
            },
            roles: [],
          },
        },
      })
      .pipe(
        map((apolloResponse) => apolloResponse.data?.deleteInvite ?? false),
      );
  }
}
