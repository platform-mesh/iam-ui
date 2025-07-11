import { IamLuigiContextService } from '../services/luigi';
import { MemberService } from './member.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, first, of, take } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface SuggestedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
}

export interface SuggestedUserResponse {
  docs: SuggestedUser[];
  numFound: number;
  responseSize: number;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private authToken?: string;
  private userSuggestUrl?: URL;

  constructor(
    private httpClient: HttpClient,
    private luigiContextService: IamLuigiContextService,
    private memberService: MemberService,
  ) {
    this.luigiContextService
      .contextObservable()
      .pipe(
        map((c) => c.context),
        filter((c) => !!c.portalContext.userSuggestSearchServiceApiUrl),
        filter((c) => !!c.token),
        take(1),
      )
      .subscribe((luigiContext) => {
        this.authToken = luigiContext.token;
        this.userSuggestUrl = new URL(
          luigiContext.portalContext.userSuggestSearchServiceApiUrl,
        );
        this.userSuggestUrl.searchParams.append('fuzzy', 'true');
        this.userSuggestUrl.searchParams.append(
          'fq',
          `tenant:${luigiContext.tenantId || luigiContext.organizationId}`,
        );
      });
  }

  /**
   * Performs a search for users against the "suggest" endpoint of the user search service.
   */
  getSuggestedUsers(
    search: string,
    limit = 10,
  ): Observable<SuggestedUserResponse | null> {
    if (!this.userSuggestUrl) {
      return of(null);
    }

    const searchQuery = new URL(this.userSuggestUrl ?? '');
    searchQuery.searchParams.append('limit', limit.toString());
    searchQuery.searchParams.append('q', search);

    return this.httpClient.get<SuggestedUserResponse>(searchQuery.href, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
  }

  /**
   * Performs a search for users and filters out users that are already members of the account.
   * As a result only the users that are not members of the account are returned.
   */
  getSuggestedUsersForAccountWithFga(
    search: string,
    limit = 10,
  ): Observable<SuggestedUserResponse> {
    return combineLatest([
      this.memberService.usersOfEntity({ limit: 100 }),
      this.getSuggestedUsers(search, limit),
    ]).pipe(
      first(),
      map(([accountMembers, suggestedUsers]) => {
        if (!suggestedUsers) {
          return { responseSize: 0, numFound: 0, docs: [], status: 200 };
        }

        suggestedUsers.docs = suggestedUsers.docs?.filter(
          (user) =>
            !accountMembers.users
              ?.map((ga) => ga.user.userId)
              .includes(user.userId),
        );
        suggestedUsers.numFound =
          suggestedUsers.numFound -
          (suggestedUsers.responseSize - suggestedUsers.docs.length);
        suggestedUsers.responseSize = suggestedUsers.docs.length;
        return suggestedUsers;
      }),
    );
  }
}
