import { DxpContext } from '../../models';
import { BaseApolloClientService } from './base-apollo-client.service';
import { Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IamApolloClientService extends BaseApolloClientService {
  constructor(injector: Injector) {
    super(injector, 'iam');
  }

  protected getApiUrl(luigiContext: DxpContext): string {
    return luigiContext.portalContext.iamServiceApiUrl;
  }
}
