import { TestUtils } from '../../test';
import { DxpLuigiContextService } from '../luigi';
import { SearchBaseService } from './search-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

const luigiContext = {
  context: {
    frameContext: {
      accountSearchServiceApiUrl: 'https://endpointApiUrl/search',
    },
    token: 'token',
  },
};

const httpResponse = { items: [] };

describe('SearchService', () => {
  let httpClient: HttpClient;
  let searchService: SearchBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(HttpClient),
        MockProvider(DxpLuigiContextService, {
          contextObservable: jest.fn().mockReturnValue(of(luigiContext)),
        }),
        MockProvider(HttpClient),
      ],
    });

    searchService = TestBed.inject(SearchBaseService);
    httpClient = TestBed.inject(HttpClient);
    httpClient.get = jest.fn().mockReturnValue(of(httpResponse));
  });

  describe('search', () => {
    it('should return search results for accounts search', fakeAsync(() => {
      const actualResponse = TestUtils.getLastValue(
        searchService.search<object>('test', 1, 1, 'accountSearchAPIUrl'),
      );

      expect(actualResponse).toEqual(httpResponse);
      expect(httpClient.get).toHaveBeenCalledWith(
        luigiContext.context.frameContext.accountSearchServiceApiUrl,
        expect.objectContaining({}),
      );
    }));

    it('should use polling', fakeAsync(() => {
      const subscription = searchService
        .search<object>('test', 1, 1, 'accountSearchAPIUrl', 500)
        .subscribe();

      tick();
      expect(httpClient.get).toHaveBeenCalledTimes(1);
      tick(200);
      expect(httpClient.get).toHaveBeenCalledTimes(1);
      tick(301);
      expect(httpClient.get).toHaveBeenCalledTimes(2);
      subscription.unsubscribe();
      tick(1000);
      expect(httpClient.get).toHaveBeenCalledTimes(2);
    }));

    it('should use sorting and queryFields', fakeAsync(() => {
      searchService
        .search<object>(
          'test',
          1,
          1,
          'accountSearchAPIUrl',
          0,
          'name:asc',
          'displayName^2.3 description',
        )
        .subscribe();
      tick();

      expect(httpClient.get).toHaveBeenCalledWith(
        luigiContext.context.frameContext.accountSearchServiceApiUrl,
        expect.objectContaining({
          params: new HttpParams()
            .set('q', 'test')
            .set('start', 0)
            .set('limit', 1)
            .set('sort', 'name:asc')
            .set('qf', 'displayName^2.3 description')
            .set('hl', '')
            .set('hl.fl', '')
            .set('hl.fragsize', '')
            .set('hl.snippets', '')
            .set('hl.tag.pre', '')
            .set('hl.tag.post', '')
            .set('hl.encoder', '')
            .set('fuzzy', false)
            .set('fl', '')
            .set('fq', ''),
        }),
      );
    }));

    it('should use sorting, queryFields, highlighting, fuzzy, resultFields and filterQuery', fakeAsync(() => {
      searchService
        .search<object>(
          'test',
          1,
          1,
          'accountSearchAPIUrl',
          0,
          'name:asc',
          'displayName^2.3 description',
          'merge',
          'displayName,description',
          30,
          3,
          true,
          'displayName,description',
          'filterField:filterValue',
        )
        .subscribe();
      tick();

      expect(httpClient.get).toHaveBeenCalledWith(
        luigiContext.context.frameContext.accountSearchServiceApiUrl,
        expect.objectContaining({
          params: new HttpParams()
            .set('q', 'test')
            .set('start', 0)
            .set('limit', 1)
            .set('sort', 'name:asc')
            .set('qf', 'displayName^2.3 description')
            .set('hl', 'merge')
            .set('hl.fl', 'displayName,description')
            .set('hl.fragsize', 30)
            .set('hl.snippets', 3)
            .set('hl.tag.pre', '<span class="dxp-search-highlight">')
            .set('hl.tag.post', '</span>')
            .set('hl.encoder', 'html')
            .set('fuzzy', true)
            .set('fl', 'displayName,description')
            .set('fq', 'filterField:filterValue'),
        }),
      );
    }));
  });
});
