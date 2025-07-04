import { NodeContext } from '../../models';
import { BaseApolloClientService } from './base-apollo-client.service';
import { Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExtensionApolloClientService extends BaseApolloClientService {
  constructor(injector: Injector) {
    super(injector, 'extension');
  }

  protected getApiUrl(luigiContext: NodeContext): string {
    return luigiContext.portalContext.extensionManagerServiceApiUrl;
  }
}
