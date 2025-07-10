import { IamLuigiContextService } from '../services/luigi';
import { getEntityIdFromEntityContext } from './entity-id';
import { MemberService } from './member.service';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClaimEntityService {
  constructor(
    private luigiContextService: IamLuigiContextService,
    private memberService: MemberService,
  ) {}

  public async claim(): Promise<void> {
    let iamClaimEntityUrl =
      this.luigiContextService.getContext().portalContext.iamClaimEntityUrl;
    const entity = await firstValueFrom(this.memberService.currentEntity());
    const entityId = getEntityIdFromEntityContext(
      entity,
      this.luigiContextService.getContext(),
    );
    const portalBaseUrl = this.luigiContextService.getContext().portalBaseUrl;

    iamClaimEntityUrl = iamClaimEntityUrl
      .replaceAll('${entityId}', entityId)
      .replaceAll('${portalBaseUrl}', portalBaseUrl);

    const url = new URL(iamClaimEntityUrl);
    window.open(url.href, '_blank');
  }
}
