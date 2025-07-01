import { DxpContext } from '../dxp-ngx-core/models';
import { AccountSearchResultItem } from '../dxp-ngx-core/models/search/account-search-result.item';
import { SearchResult } from '../dxp-ngx-core/models/search/search.result';
import {
  DxpIContextMessage,
  DxpLuigiContextService,
  IamApolloClientService,
} from '../dxp-ngx-core/services';
import { AccountSearchService } from '../dxp-ngx-core/services/search/account-search.service';
import { TeamService } from './team.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';
import { ApolloBase } from 'apollo-angular';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { AsyncSubject, BehaviorSubject } from 'rxjs';

const mockContext = {
  token: 'some-token',
  tenantid: 'tenantid',
  teamId: 'teamId',
  projectId: 'projectId',
} as DxpContext;

describe('TeamService', () => {
  let teamService: TeamService;
  let luigiContextSubject: BehaviorSubject<DxpIContextMessage>;
  let apolloSubject: AsyncSubject<ApolloBase>;
  let iamApolloSubject: AsyncSubject<ApolloBase>;
  let accountSearchSubject: AsyncSubject<SearchResult<AccountSearchResultItem>>;
  let accSearchMock: AccountSearchService;

  beforeEach(() => {
    luigiContextSubject = new BehaviorSubject<DxpIContextMessage>({
      context: mockContext,
      contextType: ILuigiContextTypes.INIT,
    });
    apolloSubject = new AsyncSubject();
    iamApolloSubject = new AsyncSubject();
    accountSearchSubject = new AsyncSubject();
    accSearchMock = mock<AccountSearchService>({
      search: jest.fn().mockReturnValue(accountSearchSubject),
    });

    TestBed.configureTestingModule({
      providers: [
        MockProvider(AccountSearchService, accSearchMock),
        MockProvider(IamApolloClientService, {
          apollo: () => iamApolloSubject,
        }),
        MockProvider(DxpLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
      ],
    });
    teamService = TestBed.inject(TeamService);
  });

  afterEach(() => {
    apolloSubject.complete();
    luigiContextSubject.complete();
    iamApolloSubject.complete();
    accountSearchSubject.complete();
  });

  describe('when searchTeams is called', () => {
    it('should query data using provided search params', fakeAsync(() => {
      // Arrange
      const searchTeamsResult: Partial<AccountSearchResultItem> = {
        id: 'teamId',
        displayName: 'team name',
      };
      const query = { items: [searchTeamsResult] };
      let searchResponse: AccountSearchResultItem[] = [];

      // Act
      teamService
        .searchTeams({ searchTerm: '', currentPage: 2, itemsPerPage: 500 })
        .subscribe((response) => (searchResponse = response));
      accountSearchSubject.next(query as never);
      accountSearchSubject.complete();
      tick();

      // Assert
      expect(accSearchMock.search).toHaveBeenCalledTimes(1);
      expect(accSearchMock.search).toHaveBeenCalledWith(
        '',
        2,
        500,
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
        'team',
        undefined,
      );
      expect(searchResponse).toEqual([searchTeamsResult]);
    }));
  });
});
