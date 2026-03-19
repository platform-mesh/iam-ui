import { UserOverviewHeaderComponent } from './user-overview-header.component';
import { Mock } from 'vitest';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ILuigiContextTypes } from '@luigi-project/client-support-angular';
import {
  AvatarProviderService,
  IContextMessage,
  IamLuigiContextService,
  MemberService,
  NodeContext,
  User,
} from '@platform-mesh/iam-lib';
import { provideNamedApollo } from 'apollo-angular';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';

const mockContext = {
  token: 'some-token',
  userId: 'userId',
  entityContext: {
    project: {
      policies: [],
    },
  },
  portalContext: {
    avatarImgUrl: 'https://avatar.url',
  },
} as unknown as NodeContext;

let iamLuigiContextService: IamLuigiContextService;
let fixture: ComponentFixture<UserOverviewHeaderComponent>;
const luigiContext = new BehaviorSubject<IContextMessage>({
  context: mockContext,
  contextType: ILuigiContextTypes.INIT,
});
let mockUserService: Partial<MemberService>;

describe('UserOverviewHeaderComponent', () => {
  let component: UserOverviewHeaderComponent;

  beforeEach(() => {
    mockUserService = {
      user: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [UserOverviewHeaderComponent, HttpClientTestingModule],
      providers: [
        provideNamedApollo(() => ({})),
        { provide: MemberService, useValue: mockUserService },
        MockProvider(IamLuigiContextService, {
          contextObservable: () => luigiContext,
          setContext: vi.fn(),
        }),
        MockProvider(AvatarProviderService, {
          getAvatarImageUrl: vi.fn().mockResolvedValue(undefined),
        }),
      ],
    });

    fixture = TestBed.createComponent(UserOverviewHeaderComponent);
    component = fixture.componentInstance;
    iamLuigiContextService = TestBed.inject(IamLuigiContextService);
  });

  it('should call iamLuigiContextService.setContext when context is set', () => {
    const iamLuigiContextServiceSpy = iamLuigiContextService as unknown as {
      setContext: Mock;
    };
    iamLuigiContextServiceSpy.setContext = vi.fn();

    component.context = mockContext;

    expect(iamLuigiContextServiceSpy.setContext).toHaveBeenCalledWith(
      mockContext,
    );
  });

  describe('When ngOnInit should call memberService me - reading the user', () => {
    it('should fetch user', () => {
      const user = { userId: 'userId', firstName: 'John' } as User;
      (mockUserService.user as Mock).mockReturnValue(of(user));
      component.context = mockContext;

      component.ngOnInit();

      expect(mockUserService.user).toHaveBeenCalledWith('userId');
      expect(component.user()).toBe(user);
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
      const openNewWindowSpy = vi
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
      const windowOpenSpy = vi
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
      const windowOpenSpy = vi
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
    it('should attempt to navigate to mailto link', () => {
      expect(() => component.emailUser('john.doe@sap.com')).not.toThrow();
    });
  });

  describe('When calling getUserContactsHeaderText', () => {
    it("should include the user's first name in the see on text", () => {
      component.user.set({
        userId: 'D123456',
        firstName: 'John',
      } as User);

      const seeOnText = component.getUserContactsHeaderText();

      expect(seeOnText).toBe('See John on:');
    });

    it('should say "Check on:" in the see on text if the user\'s first name is not available', () => {
      component.user.set({
        userId: 'D123456',
      } as User);

      const seeOnText = component.getUserContactsHeaderText();

      expect(seeOnText).toBe('Check on:');
    });
  });
});
