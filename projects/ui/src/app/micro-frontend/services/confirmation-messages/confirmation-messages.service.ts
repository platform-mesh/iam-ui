import { AddMembersData } from '../../pages/members-page/members-page.component';
import { Injectable } from '@angular/core';
import { UserUtils } from '@platform-mesh/iam-lib';

@Injectable()
export class ConfirmationMessagesService {
  public getAddedMembersMessage(
    { addedMembers = [] }: AddMembersData,
    entity?: string,
  ): string {
    if (addedMembers.length === 1) {
      return (
        UserUtils.getNameOrId(addedMembers[0]) +
        (entity
          ? $localize` has been added to the ${entity}.`
          : $localize` has been added.`)
      );
    }

    return (
      addedMembers?.length.toString() +
      (entity
        ? $localize` members have been added to the ${entity}.`
        : $localize` members have been added.`)
    );
  }
}
