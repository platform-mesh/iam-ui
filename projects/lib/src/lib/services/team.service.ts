import { AccountRole } from '../models/search/account';
import { AccountSearchResultItem } from '../models/search/account-search-result.item';
import { Team } from '../models/team';
import { AccountSearchService } from '../services/search/account-search.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TeamResponse {
  team: Team;
}

export interface SearchParams {
  searchTerm?: string;
  itemsPerPage?: number;
  currentPage?: number;
}
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(private accountSearchService: AccountSearchService) {}
  public searchTeams(
    sp: SearchParams = { searchTerm: '', currentPage: 1, itemsPerPage: 100 },
  ): Observable<AccountSearchResultItem[]> {
    return this.accountSearchService
      .search(
        sp.searchTerm ?? '',
        sp.currentPage ?? 1,
        sp.itemsPerPage ?? 100,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        AccountRole.TEAM,
        undefined,
      )
      .pipe(map((result) => result.items));
  }
}
