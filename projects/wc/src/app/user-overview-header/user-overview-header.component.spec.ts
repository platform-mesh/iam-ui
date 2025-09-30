import { UserOverviewHeaderComponent } from './user-overview-header.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ILuigiContextTypes,
  LuigiContextService,
} from '@luigi-project/client-support-angular';
import {
  IContextMessage,
  NodeContext,
  User,
  UserService,
} from '@platform-mesh/iam-lib';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';

const mockContext = {
  token: 'some-token',
  tenantid: 'tenantId',
  userid: 'userId',
  entityContext: {
    project: {
      policies: [],
    },
  },
} as unknown as NodeContext;

let dxpLuigiContextService: LuigiContextService;
let fixture: ComponentFixture<UserOverviewHeaderComponent>;
const luigiContext = new BehaviorSubject<IContextMessage>({
  context: mockContext,
  contextType: ILuigiContextTypes.INIT,
});
let mockUserService: Partial<UserService>;

describe('UserOverviewHeaderComponent', () => {
  let component: UserOverviewHeaderComponent;

  beforeEach(() => {
    mockUserService = {
      getUser: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UserOverviewHeaderComponent,
        { provide: UserService, useValue: mockUserService },
        MockProvider(LuigiContextService, {
          contextObservable: () => luigiContext,
        }),
      ],
    });

    fixture = TestBed.createComponent(UserOverviewHeaderComponent);
    component = fixture.componentInstance;
    dxpLuigiContextService = TestBed.inject(LuigiContextService);
  });

  it('should call dxpLuigiContextService.setContext when context is set', () => {
    const dxpLuigiContextServiceSpy = dxpLuigiContextService as unknown as {
      setContext: jest.Mock;
    };
    dxpLuigiContextServiceSpy.setContext = jest.fn();

    component.context = mockContext;

    expect(dxpLuigiContextServiceSpy.setContext).toHaveBeenCalledWith(
      mockContext,
    );
  });

  describe('When ngOnInit should call userService.getUser', () => {
    it('should fetch user with profileUserId from ctx and update user', () => {
      const user = { userId: 'D123456', firstName: 'John' } as User;
      component.ctx = { profileUserId: 'D123456' } as NodeContext;
      (mockUserService.getUser as jest.Mock).mockReturnValue(of(user));

      fixture.detectChanges();

      expect(mockUserService.getUser).toHaveBeenCalledWith('D123456');
      expect(component.user).toBe(user);
    });

    it('should fetch user with empty string if ctx or profileUserId is missing', () => {
      const user = { userId: 'D000000', firstName: 'Jane' } as User;
      component.ctx = undefined;
      (mockUserService.getUser as jest.Mock).mockReturnValue(of(user));

      fixture.detectChanges();

      expect(mockUserService.getUser).toHaveBeenCalledWith('');
      expect(component.user).toBe(user);
    });
  });

  describe('When calling getFirstLastNameOrUserId', () => {
    it('should return the user name and id if the user name is available', () => {
      const user = {
        userId: 'D123456',
        firstName: 'John',
        lastName: 'Doe',
      };

      const name = component.getFirstLastNameOrUserId(user);

      expect(name).toBe('John Doe (D123456)');
    });

    it('should return the user id if the user name is not available', () => {
      const user = {
        userId: 'D123456',
      };

      const name = component.getFirstLastNameOrUserId(user);

      expect(name).toBe('D123456');
    });
  });

  describe('When calling chatWithUserViaTeams', () => {
    it('should open correct the window', () => {
      const openNewWindowSpy = jest
        .spyOn(window, 'open')
        .mockImplementation(() => null);

      component.chatWithUserViaTeams('user@sap.com');

      expect(openNewWindowSpy).toHaveBeenCalledWith(
        'msteams:/l/chat/0/0?users=user@sap.com',
        '_blank',
      );
      openNewWindowSpy.mockRestore();
    });
  });

  describe('When calling callUserViaTeams', () => {
    it('should open correct the window without video by default', () => {
      const windowOpenSpy = jest
        .spyOn(window, 'open')
        .mockImplementation(() => null);

      component.callUserViaTeams('user@sap.com');
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=user@sap.com&withVideo=false',
        '_blank',
      );
      windowOpenSpy.mockRestore();
    });

    it('should open correct the window with video', () => {
      const windowOpenSpy = jest
        .spyOn(window, 'open')
        .mockImplementation(() => null);

      component.callUserViaTeams('user@sap.com', true);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=user@sap.com&withVideo=true',
        '_blank',
      );
      windowOpenSpy.mockRestore();
    });
  });

  describe('When mailing the user', () => {
    it('should set the correct mail link', () => {
      const originalLocation = window.location;
      // @ts-expect-error for testing purposes
      delete window.location;
      // @ts-expect-error for testing purposes
      window.location = { assign: jest.fn() };

      component.emailUser('john.doe@sap.com');

      expect(window.location.assign).toHaveBeenCalledWith(
        'mailto:john.doe@sap.com',
      );
      // Restore original location
      // @ts-expect-error for testing purposes
      window.location = originalLocation;
    });
  });

  describe('When calling getUserContactsHeaderText', () => {
    it("should include the user's first name in the see on text", () => {
      component.user = {
        userId: 'D123456',
        firstName: 'John',
      } as User;

      const seeOnText = component.getUserContactsHeaderText();

      expect(seeOnText).toBe('See John on:');
    });

    it('should say "Check on:" in the see on text if the user\'s first name is not available', () => {
      component.user = {
        userId: 'D123456',
      } as User;

      const seeOnText = component.getUserContactsHeaderText();

      expect(seeOnText).toBe('Check on:');
    });
  });
});
