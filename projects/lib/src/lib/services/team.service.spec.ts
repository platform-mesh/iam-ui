import { NodeContext } from '../models';
import { AccountSearchResultItem } from '../models/search/account-search-result.item';
import { SearchResult } from '../models/search/search.result';
import {
  IContextMessage,
  IamApolloClientService,
  IamLuigiContextService,
} from '../services';
import { AccountSearchService } from '../services/search/account-search.service';
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
} as NodeContext;

describe('TeamService', () => {
  let teamService: TeamService;
  let luigiContextSubject: BehaviorSubject<IContextMessage>;
  let apolloSubject: AsyncSubject<ApolloBase>;
  let iamApolloSubject: AsyncSubject<ApolloBase>;
  let accountSearchSubject: AsyncSubject<SearchResult<AccountSearchResultItem>>;
  let accSearchMock: AccountSearchService;

  beforeEach(() => {
    luigiContextSubject = new BehaviorSubject<IContextMessage>({
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
        MockProvider(IamLuigiContextService, {
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
