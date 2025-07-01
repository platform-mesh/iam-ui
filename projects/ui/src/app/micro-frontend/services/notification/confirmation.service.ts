import { Injectable } from '@angular/core';
import { LuigiClient, MemberService, User, UserUtils } from '@dxp/iam-lib';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { firstValueFrom } from 'rxjs';

export enum ConfirmationDialogDecision {
  CONFIRMED,
  DISMISSED,
}

@Injectable()
export class ConfirmationService {
  constructor(
    private luigiClient: LuigiClient,
    private memberService: MemberService,
  ) {}

  public async showRemoveMemberDialog(
    member: User,
    scopeDisplayName: string,
  ): Promise<ConfirmationDialogDecision> {
    const entity = await firstValueFrom(this.memberService.currentEntity());
    const settings = {
      type: 'warning',
      header: $localize`Remove Member`,
      body:
        $localize`Are you sure you want to remove the member` +
        ` <b>${UserUtils.getNameOrId(member)}</b>?<br/><br/>` +
        $localize`The member will no longer have access to the ${entity}` +
        ` <b>${scopeDisplayName}</b>.`,
      buttonConfirm: $localize`Remove`,
      buttonDismiss: $localize`Cancel`,
    };
    return this.showConfirmationModal(settings);
  }

  public async showLeaveScopeDialog(
    scopeDisplayName: string,
  ): Promise<ConfirmationDialogDecision> {
    const entity = await firstValueFrom(this.memberService.currentEntity());
    const settings = {
      type: 'warning',
      header: $localize`Leave`,
      body:
        $localize`Are you sure you want to leave?` +
        '<br/><br/>' +
        $localize`You will no longer have access to the ${entity}` +
        ` <b>${scopeDisplayName}</b>.`,
      buttonConfirm: $localize`Leave`,
      buttonDismiss: $localize`Cancel`,
    };
    return this.showConfirmationModal(settings);
  }

  private async showConfirmationModal(
    settings: ConfirmationModalSettings,
  ): Promise<ConfirmationDialogDecision> {
    return this.luigiClient
      .uxManager()
      .showConfirmationModal(settings)
      .then(() => Promise.resolve(ConfirmationDialogDecision.CONFIRMED))
      .catch(() => Promise.resolve(ConfirmationDialogDecision.DISMISSED));
  }
}
