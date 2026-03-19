import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from './confirmation.service';
import { LuigiClient, User } from '@platform-mesh/iam-lib';
import { mock } from 'vitest-mock-extended';

describe('ConfirmationService', () => {
  const luigiClientMock = mock<LuigiClient>({
    uxManager: vi.fn().mockReturnValue({
      showConfirmationModal: vi
        .fn()
        .mockResolvedValue(ConfirmationDialogDecision.CONFIRMED),
    }),
  });

  const confirmationService: ConfirmationService = new ConfirmationService(
    luigiClientMock,
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(confirmationService).toBeTruthy();
  });

  it('should provide a remove member from project confirmation dialog', async () => {
    const confirmationModalSpy = vi.spyOn(
      luigiClientMock.uxManager(),
      'showConfirmationModal',
    );

    await confirmationService.showRemoveMemberDialog(
      mock<User>({ firstName: 'Mr', lastName: 'Bob' }),
    );
    expect(confirmationModalSpy).toHaveBeenCalledTimes(1);
    expect(confirmationModalSpy).toHaveBeenCalledWith({
      type: 'warning',
      header: 'Remove Member',
      body: 'Are you sure you want to remove the member: </br><b>Mr Bob</b>?<br/><br/>',
      buttonDismiss: 'Cancel',
      buttonConfirm: 'Remove',
    });
  });

  it('should provide a leave confirmation dialog', async () => {
    const confirmationModalSpy = vi.spyOn(
      luigiClientMock.uxManager(),
      'showConfirmationModal',
    );

    await confirmationService.showLeaveScopeDialog('aProject');

    expect(confirmationModalSpy).toHaveBeenCalledTimes(1);
    expect(confirmationModalSpy).toHaveBeenCalledWith({
      type: 'warning',
      header: 'Leave',
      body: 'Are you sure you want to leave?',
      buttonDismiss: 'Cancel',
      buttonConfirm: 'Leave',
    });
  });
});
