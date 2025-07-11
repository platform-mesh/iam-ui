import { TenantInfo } from '../models/tenant-info';
import { GET_TENANT_INFO } from '../queries/iam-queries';
import { IamApolloClientService } from '../services/apollo';
import { IamLuigiContextService } from '../services/luigi';
import { Injectable } from '@angular/core';
import { Observable, combineLatest, first, map, mergeMap } from 'rxjs';

interface TenantInfoResponse {
  tenantInfo: TenantInfo;
}

@Injectable({
  providedIn: 'root',
})
export class TenantInfoService {
  constructor(
    private apolloClientService: IamApolloClientService,
    private luigiContextService: IamLuigiContextService,
  ) {}

  tenantInfo(): Observable<TenantInfo> {
    return combineLatest([
      this.apolloClientService.apollo(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      first(),
      map(([apollo, ctx]) =>
        apollo.query<TenantInfoResponse>({
          query: GET_TENANT_INFO,
          variables: {
            tenantId: ctx.context.tenantId || ctx.context.organizationId,
          },
        }),
      ),
      mergeMap((query) =>
        query.pipe(map((apolloResponse) => apolloResponse.data.tenantInfo)),
      ),
    );
  }
}
