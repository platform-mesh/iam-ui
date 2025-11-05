import { Injectable } from '@angular/core';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { LuigiClient, User, UserUtils } from '@platform-mesh/iam-lib';

export enum ConfirmationDialogDecision {
  CONFIRMED,
  DISMISSED,
}

@Injectable()
export class ConfirmationService {
  constructor(private luigiClient: LuigiClient) {}

  public async showRemoveMemberDialog(
    member: User,
  ): Promise<ConfirmationDialogDecision> {
    const settings = {
      type: 'warning',
      header: $localize`Remove Member`,
      body:
        $localize`Are you sure you want to remove the member:` +
        ` </br><b>${UserUtils.getNameOrId(member)}</b>?<br/><br/>`,
      buttonConfirm: $localize`Remove`,
      buttonDismiss: $localize`Cancel`,
    };
    return this.showConfirmationModal(settings);
  }

  public async showLeaveScopeDialog(
    scopeDisplayName: string,
  ): Promise<ConfirmationDialogDecision> {
    const settings = {
      type: 'warning',
      header: $localize`Leave`,
      body: $localize`Are you sure you want to leave?`,
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
