import { IamApolloClientService } from '../dxp-ngx-core/services/apollo';
import { DxpLuigiContextService } from '../dxp-ngx-core/services/luigi';
import { TenantInfo } from '../models/tenant-info';
import { GET_TENANT_INFO } from '../queries/iam-queries';
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
    private luigiContextService: DxpLuigiContextService,
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
            tenantId: ctx.context.tenantid || ctx.context.organizationId,
          },
        }),
      ),
      mergeMap((query) =>
        query.pipe(map((apolloResponse) => apolloResponse.data.tenantInfo)),
      ),
    );
  }
}
