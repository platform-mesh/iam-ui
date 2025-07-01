import { UserOverviewHeaderComponent } from './user-overview-header.component';
import { ChangeDetectorRef } from '@angular/core';
import { DxpLuigiContextService, UserService } from '@dxp/iam-lib';
import { MockService } from 'ng-mocks';

describe('UserOverviewHeaderComponent', () => {
  let component: UserOverviewHeaderComponent;

  beforeEach(() => {
    component = new UserOverviewHeaderComponent(
      MockService(DxpLuigiContextService),
      MockService(UserService),
      MockService(ChangeDetectorRef),
    );
  });

  describe('When calling getFirstLastNameOrUserId', () => {
    it('should return the user name and id if the user name is available', () => {
      const user = {
        userId: 'D123456',
        firstName: 'John',
        lastName: 'Doe',
      };

      const name = component.getFirsLastNameOrUserId(user);

      expect(name).toBe('John Doe (D123456)');
    });

    it('should return the user id if the user name is not available', () => {
      const user = {
        userId: 'D123456',
      };

      const name = component.getFirsLastNameOrUserId(user);

      expect(name).toBe('D123456');
    });
  });

  describe('When calling chatWithUserViaTeams', () => {
    it('should open correct the window', () => {
      const openNewWindowSpy = jest
        .spyOn<UserOverviewHeaderComponent, any>(component, 'openNewWindow')
        .mockReturnValue(null);

      component.chatWithUserViaTeams('user@sap.com');

      expect(openNewWindowSpy).toHaveBeenCalledWith(
        'msteams:/l/chat/0/0?users=user@sap.com',
      );
    });
  });

  describe('When calling callUserViaTeams', () => {
    it('should open correct the window without video', () => {
      const openNewWindowSpy = jest
        .spyOn<UserOverviewHeaderComponent, any>(component, 'openNewWindow')
        .mockReturnValue(null);

      component.callUserViaTeams('user@sap.com', false);

      expect(openNewWindowSpy).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=user@sap.com&withVideo=false',
      );
    });
  });

  describe('When mailing the user', () => {
    it('should set the correct mail link', () => {
      const location = window.location;
      // @ts-ignore
      delete window.location;
      window.location = { href: '' } as Location;

      component.emailUser('john.doe@sap.com');

      expect(window.location.href).toBe('mailto:john.doe@sap.com');
      window.location = location;
    });
  });

  describe('When calling getUserContactsHeaderText', () => {
    it("should include the user's first name in the see on text", () => {
      component.user = {
        userId: 'D123456',
        firstName: 'John',
      };

      const seeOnText = component.getUserContactsHeaderText();

      expect(seeOnText).toBe('See John on:');
    });

    it('should say "Check on:" in the see on text if the user\'s first name is not available', () => {
      component.user = {
        userId: 'D123456',
      };

      const seeOnText = component.getUserContactsHeaderText();

      expect(seeOnText).toBe('Check on:');
    });
  });
});
