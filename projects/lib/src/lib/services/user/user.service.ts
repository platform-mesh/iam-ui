import { User } from '../../models';
import { GET_USERS } from '../../queries/iam-queries';
import { IamApolloClientService } from '../apollo';
import { IamLuigiContextService } from '../luigi';
import { GET_USER } from './queries/iam-queries';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, first } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  usersConnection: {
    user: User[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private apolloClientService: IamApolloClientService,
    private luigiContextService: IamLuigiContextService,
  ) {}

  getUser(userId: string): Observable<User> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx]) =>
        apollo.query<UserResponse>({
          query: GET_USER,
          variables: {
            tenantId: ctx.context.tenantId || ctx.context.organizationId,
            userId,
          },
        }),
      ),
      map((apolloResponse) => apolloResponse.data.user),
    );
  }

  getUsers(limit = 100): Observable<User[]> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      mergeMap(([apollo, ctx]) =>
        apollo.query<UsersResponse>({
          query: GET_USERS,
          variables: {
            tenantId: ctx.context.tenantId || ctx.context.organizationId,
            limit,
          },
        }),
      ),
      map((apolloResponse) => {
        if (
          apolloResponse &&
          apolloResponse.data &&
          apolloResponse.data.usersConnection &&
          Array.isArray(apolloResponse.data.usersConnection.user)
        ) {
          return apolloResponse.data.usersConnection.user;
        }
        return [];
      }),
    );
  }
}
