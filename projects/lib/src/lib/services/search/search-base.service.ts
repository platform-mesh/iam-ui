import { PortalContext } from '../../models';
import { IamLuigiContextService } from '../luigi';
import { URIComponentCodec } from './codecs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SearchBaseService {
  constructor(
    private httpClient: HttpClient,
    private luigiContextService: IamLuigiContextService,
  ) {}

  /**
   *
   * @param query
   * @param currentPage
   * @param itemsPerPage
   * @param endpoint
   * @param pollingInterval a pollingInterval>0 will poll the endpoint every pollingInterval ms, when pollingInterval<=0, it will only query the endpoint once
   * @param sort
   * @param queryFields
   * @param highlightMode
   * @param highlightFields
   * @param highlightFragmentSize
   * @param highlightSnippets
   * @param fuzzy
   * @param resultFields
   * @param filterQuery
   */
  search<T>(
    query: string,
    currentPage: number,
    itemsPerPage: number,
    endpoint: string,
    pollingInterval = 0,
    sort?: string,
    queryFields?: string,
    highlightMode?: string,
    highlightFields?: string,
    highlightFragmentSize?: number,
    highlightSnippets?: number,
    fuzzy = false,
    resultFields?: string,
    filterQuery?: string,
  ): Observable<T> {
    return this.luigiContextService.contextObservable().pipe(
      take(1),
      switchMap((context) => {
        const url: string = SearchBaseService.urlForEndpoint(
          endpoint,
          context.context.portalContext,
        );
        const token: string = context.context.token;
        const httpHeaders = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`,
        );

        const from = (currentPage - 1) * itemsPerPage;

        const reqParams = new HttpParams({ encoder: new URIComponentCodec() })
          .set('q', query ? query : '')
          .set('start', from)
          .set('limit', itemsPerPage)
          .set('sort', sort || '')
          .set('qf', queryFields || '')
          .set('hl', highlightMode || '')
          .set('hl.fl', (highlightMode && highlightFields) || '')
          .set('hl.fragsize', highlightMode ? highlightFragmentSize || 0 : '')
          .set('hl.snippets', highlightMode ? highlightSnippets || 100 : '')
          .set(
            'hl.tag.pre',
            highlightMode ? '<span class="app-search-highlight">' : '',
          )
          .set('hl.tag.post', highlightMode ? '</span>' : '')
          .set('hl.encoder', highlightMode ? 'html' : '')
          .set('fuzzy', fuzzy)
          .set('fl', resultFields || '')
          .set('fq', filterQuery || '');

        const pollingObservable =
          pollingInterval > 0 ? timer(0, pollingInterval) : of(1);

        return pollingObservable.pipe(
          switchMap(() =>
            this.httpClient.get<T>(url, {
              headers: httpHeaders,
              params: reqParams,
            }),
          ),
        );
      }),
    );
  }

  private static urlForEndpoint(
    endpoint: string,
    portalContext: PortalContext,
  ): string {
    switch (endpoint) {
      case 'accountSearchAPIUrl':
        return portalContext.accountSearchServiceApiUrl;
      case 'componentSearchAPIUrl':
        return portalContext.componentSearchServiceApiUrl;
      case 'ppmsSearchAPIUrl':
        return portalContext.ppmsSearchServiceApiUrl;
      case 'responsibilityAreaSearchAPIUrl':
        return portalContext.responsibilityAreaSearchServiceApiUrl;
      default:
        return 'endpoint url not found';
    }
  }
}
