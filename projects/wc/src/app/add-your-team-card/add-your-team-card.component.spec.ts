import { AddYourTeamCardComponent } from './add-your-team-card.component';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  ExtensionService,
  IamLuigiContextService,
  ScopeType,
} from '@platform-mesh/iam-lib';
import { mock } from 'jest-mock-extended';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';

describe('AddYourTeamCardComponent', () => {
  let component: AddYourTeamCardComponent;
  let extensionService: ExtensionService;
  beforeEach(() => {
    extensionService = MockService(ExtensionService);
    component = new AddYourTeamCardComponent(
      MockService(IamLuigiContextService),
      extensionService,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call add-members dialog', () => {
    component.LuigiClient = mock<LuigiClient>({
      linkManager: jest.fn().mockReturnValue({
        fromClosestContext: jest.fn().mockReturnValue({
          openAsModal: jest.fn(),
        }),
      }),
    });

    component.addNewTeam();
    expect(component.LuigiClient.linkManager).toHaveBeenCalled();
    expect(
      component.LuigiClient.linkManager().fromClosestContext().openAsModal,
    ).toHaveBeenCalledWith('add-members', {
      width: '60rem',
      height: '40rem',
    });
  });

  it('should call updateExtensionInstanceInProject', () => {
    extensionService.updateExtensionInstanceInProject = jest
      .fn()
      .mockReturnValue(of({}));
    window.postMessage = jest.fn();

    component.skipCard();
    expect(
      extensionService.updateExtensionInstanceInProject,
    ).toHaveBeenCalledWith({
      installationData: {
        skipOnboardingCard: 'true',
      },
      instanceId: 'app-iam-ui',
      extensionClass: {
        id: 'app-iam-ui',
        scope: ScopeType.PROJECT,
      },
    });
    expect(window.postMessage).toHaveBeenCalledWith({
      msg: 'custom',
      data: { id: 'general.frame-entity-changed' },
    });
  });
});
