import { SearchService } from '../../../services/search.service';
import { AccountRole, ProjectType } from '../../models/search/account';
import { AccountSearchResponse } from '../../models/search/dxp-response';
import { TestUtils } from '../../test';
import { AccountSearchService } from './account-search.service';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('ProjectSearchService', () => {
  let searchService: SearchService;
  let accountSearchService: AccountSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(SearchService)],
    });

    searchService = TestBed.inject(SearchService);
    accountSearchService = TestBed.inject(AccountSearchService);
  });

  describe('search', () => {
    it('should return results', fakeAsync(() => {
      const query = 'abc';
      const currentPage = 1;
      const itemsPerPage = 10;
      const highlightMode = 'merge';
      const highlightFields = 'displayName,description';
      const highlightFragmentSize = 30;
      const highlightSnippets = 3;
      const fuzzy = true;
      const resultFields = 'id,displayName,description';
      const filterQuery = 'member:me';

      const searchResponse: AccountSearchResponse = {
        docs: [
          {
            _version_: 1,
            displayName: ['ABC'],
            id: 'id',
            kind: 'kind',
            name: 'project-id',
            namespace: [],
            tenant: 'tenant',
            uid: 'uid',
            suggest: [],
            accountRole: '',
            description: ['This is description'],
            tag: ['blob'],
            numberOfComponents: 3,
            extendedBy: [],
            frozen: false,
            owner: 'I12345',
            member: ['I1', 'I2'],
            numberOfMembers: 2,
            ppmsProductId: 'ppmsProductId',
            ppmsProductName: 'ppmsProductName',
            ppmsProductOfficialName: 'ppmsProductOfficialName',
            activityScore: 0,
          },
        ],
        facets: [],
        numFound: 1,
        responseSize: 0,
        status: 0,
      };

      accountSearchService.search = jest
        .fn()
        .mockReturnValue(of(searchResponse));

      const searchResult = TestUtils.getLastValue(
        accountSearchService.search(
          query,
          currentPage,
          itemsPerPage,
          undefined,
          undefined,
          undefined,
          highlightMode,
          highlightFields,
          highlightFragmentSize,
          highlightSnippets,
          fuzzy,
          resultFields,
          filterQuery,
          AccountRole.PROJECT,
          ProjectType.EXPERIMENT,
        ),
      );

      expect(accountSearchService.search).toHaveBeenCalledWith(
        query,
        currentPage,
        itemsPerPage,
        'accountSearchAPIUrl',
        0,
        undefined,
        undefined,
        highlightMode,
        highlightFields,
        highlightFragmentSize,
        highlightSnippets,
        fuzzy,
        resultFields,
        `(${filterQuery}) AND accountRole:"Project" AND accountType:"experiment"`,
      );

      expect(searchResult).toEqual({
        items: [
          {
            description: 'This is description',
            id: 'project-id',
            displayName: 'ABC',
            link: {
              external: false,
              url: '/projects/project-id',
            },
            owner: 'I12345',
            member: ['I1', 'I2'],
            tags: ['blob'],
            numberOfComponents: 3,
            numberOfMembers: 2,
            ppmsProductId: 'ppmsProductId',
            ppmsProductName: 'ppmsProductName',
            ppmsProductOfficialName: 'ppmsProductOfficialName',
            activityScore: 0,
          },
        ],
        numFound: 1,
      });
    }));
  });
});
