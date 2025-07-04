import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from './confirmation.service';
import { LuigiClient, MemberService, User } from '@platform-mesh/iam-lib';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';

describe('ConfirmationService', () => {
  const luigiClientMock = mock<LuigiClient>({
    uxManager: jest.fn().mockReturnValue({
      showConfirmationModal: jest
        .fn()
        .mockResolvedValue(ConfirmationDialogDecision.CONFIRMED),
    }),
  });

  const memberServiceMock = mock<MemberService>({
    currentEntity: jest.fn().mockReturnValue(of('project')),
  });

  const confirmationService: ConfirmationService = new ConfirmationService(
    luigiClientMock,
    memberServiceMock,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(confirmationService).toBeTruthy();
  });

  it('should provide a remove member from project confirmation dialog', async () => {
    const confirmationModalSpy = jest.spyOn(
      luigiClientMock.uxManager(),
      'showConfirmationModal',
    );

    await confirmationService.showRemoveMemberDialog(
      mock<User>({ firstName: 'Mr', lastName: 'Bob' }),
      'aProject',
    );
    expect(confirmationModalSpy).toHaveBeenCalledTimes(1);
    expect(confirmationModalSpy).toHaveBeenCalledWith({
      type: 'warning',
      header: 'Remove Member',
      body:
        'Are you sure you want to remove the member <b>Mr Bob</b>?<br/><br/>' +
        'The member will no longer have access to the project <b>aProject</b>.',
      buttonDismiss: 'Cancel',
      buttonConfirm: 'Remove',
    });
  });

  it('should provide a leave project confirmation dialog', async () => {
    const confirmationModalSpy = jest.spyOn(
      luigiClientMock.uxManager(),
      'showConfirmationModal',
    );

    await confirmationService.showLeaveScopeDialog('aProject');

    expect(confirmationModalSpy).toHaveBeenCalledTimes(1);
    expect(confirmationModalSpy).toHaveBeenCalledWith({
      type: 'warning',
      header: 'Leave',
      body:
        'Are you sure you want to leave?<br/><br/>' +
        'You will no longer have access to the project <b>aProject</b>.',
      buttonDismiss: 'Cancel',
      buttonConfirm: 'Leave',
    });
  });
});
