import { AccountRole, AccountType } from '../../models/search/account';
import { AccountSearchResultItem } from '../../models/search/account-search-result.item';
import { AccountSearchResponse } from '../../models/search/search-response';
import { SearchResult } from '../../models/search/search.result';
import { valueOf, valueOrEmptyString } from '../../utils/response-type-helpers';
import { SearchBaseService } from './search-base.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AccountSearchService {
  constructor(private searchService: SearchBaseService) {}

  search(
    query: string,
    currentPage: number,
    itemsPerPage: number,
    pollingInterval = 0,
    sort?: string,
    queryFields?: string,
    highlightMode?: string,
    highlightFields?: string,
    highlightFragmentSize?: number,
    highlightSnippets?: number,
    fuzzy?: boolean,
    resultFields?: string,
    filterQuery?: string,
    accountRole?: AccountRole,
    accountType?: AccountType,
  ): Observable<SearchResult<AccountSearchResultItem>> {
    return this.searchService
      .search<AccountSearchResponse>(
        query,
        currentPage,
        itemsPerPage,
        'accountSearchAPIUrl',
        pollingInterval,
        sort,
        queryFields,
        highlightMode,
        highlightFields,
        highlightFragmentSize,
        highlightSnippets,
        fuzzy,
        resultFields,
        this.getFilterQuery(filterQuery, accountRole, accountType),
      )
      .pipe(
        map(
          (resp): SearchResult<AccountSearchResultItem> => ({
            numFound: resp.numFound,
            items: resp.docs.map(
              (x): AccountSearchResultItem => ({
                displayName: valueOrEmptyString(valueOf(x.displayName)),
                id: x.name,
                owner: x.owner,
                description: valueOf(x.description),
                member: x.member,
                tags: x.tag,
                numberOfComponents: x.numberOfComponents,
                numberOfMembers: x.numberOfMembers,
                accountType: x.accountType as AccountType,
                link: {
                  url: `/${accountRole}s/${x.name}`, //todo: intent based
                  external: false,
                },
                ppmsProductId: x.ppmsProductId,
                ppmsProductName: x.ppmsProductName,
                ppmsProductOfficialName: x.ppmsProductOfficialName,
                activityScore: x.activityScore,
              }),
            ),
          }),
        ),
      );
  }

  private getFilterQuery(
    filterQuery?: string,
    accountRole?: AccountRole,
    accountType?: AccountType,
  ): string {
    const accountRoleMap = {
      team: 'Team',
      project: 'Project',
    };

    const formattedFilterQuery = filterQuery ? `(${filterQuery})` : undefined;
    const accountRoleFQ = accountRole
      ? `accountRole:"${accountRoleMap[accountRole]}"`
      : undefined;
    const accountTypeFQ = accountType
      ? `accountType:"${accountType}"`
      : undefined;

    return [formattedFilterQuery, accountRoleFQ, accountTypeFQ]
      .filter((filter) => !!filter)
      .join(' AND ');
  }
}
