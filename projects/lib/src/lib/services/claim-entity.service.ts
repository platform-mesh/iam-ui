import { IamLuigiContextService } from '../services/luigi';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClaimEntityService {
  constructor(private luigiContextService: IamLuigiContextService) {}

  public async claim(): Promise<void> {
    let iamClaimEntityUrl =
      this.luigiContextService.getContext().portalContext.iamClaimEntityUrl;
    const entityId = this.luigiContextService.getContext().entityId;
    const portalBaseUrl = this.luigiContextService.getContext().portalBaseUrl;

    iamClaimEntityUrl = iamClaimEntityUrl
      .replaceAll('${entityId}', entityId)
      .replaceAll('${portalBaseUrl}', portalBaseUrl);

    const url = new URL(iamClaimEntityUrl);
    window.open(url.href, '_blank');
  }
}
