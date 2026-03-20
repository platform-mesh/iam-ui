import { User } from '../../models';
import { MockedObject } from 'vitest';
import {
  AvatarProviderService,
  IamLuigiContextService,
  LuigiClient,
} from '../../services';
import { UserQuickViewComponent } from './user-quick-view.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

describe('UserQuickViewComponent', () => {
  const luigiClient: LuigiClient = {} as LuigiClient;
  let component: UserQuickViewComponent;
  let mockAvatarProviderService: MockedObject<AvatarProviderService>;
  let fixture: ComponentFixture<UserQuickViewComponent>;
  beforeEach(async () => {
    const mockService = {
      getAvatarImageUrl: vi.fn(),
    };

    const mockIamLuigiContextService = {
      contextObservable: vi.fn().mockReturnValue(
        of({
          context: {
            portalContext: {
              avatarImgUrl: 'https://avatar.url',
            },
          },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: AvatarProviderService, useValue: mockService },
        { provide: LuigiClient, useValue: luigiClient },
        {
          provide: IamLuigiContextService,
          useValue: mockIamLuigiContextService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserQuickViewComponent);
    component = fixture.componentInstance;
    mockAvatarProviderService = TestBed.inject(
      AvatarProviderService,
    ) as MockedObject<AvatarProviderService>;
  });

  describe('getUserAvatarImgUrl', () => {
    it('should provide user avatar url', async () => {
      // given
      const expectedUrl = 'stab';
      fixture.componentRef.setInput('user', { userId: 'C776' } as User);
      mockAvatarProviderService.getAvatarImageUrl.mockResolvedValue(
        expectedUrl,
      );

      // when
      const result = await component.getUserAvatarImgUrl();

      // then
      expect(result).toEqual(expectedUrl);
      expect(mockAvatarProviderService.getAvatarImageUrl).toHaveBeenCalledWith(
        component.user(),
        'https://avatar.url',
      );
    });
  });

  describe('getUserFullName', () => {
    it('should provide user full name', () => {
      // given
      fixture.componentRef.setInput('user', {
        firstName: 'John',
        lastName: 'Doe',
      } as User);

      // then
      expect(component.getUserFullName()).toEqual('John Doe');
    });
  });

  describe('navigateToUserProfile', () => {
    it('should navigate to users profile', () => {
      // given
      const navigate = vi.fn();
      luigiClient.linkManager = vi.fn().mockReturnValue({ navigate });

      // when
      component.navigateToUserProfile('userId');

      // then
      expect(navigate).toHaveBeenCalledWith('/users/userId/overview');
    });
  });

  describe('getGithubURL', () => {
    it('should return github url for user', () => {
      fixture.componentRef.setInput('user', { userId: 'testUser' } as User);
      expect(component.getGithubURL()).toBe('https://github.tools.sap/testUser');
    });
  });

  describe('callUserViaTeams', () => {
    it('should open teams call url in new window', () => {
      window.open = vi.fn();
      component.callUserViaTeams('user@test.com');
      expect(window.open).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=user@test.com&withVideo=false',
        '_blank',
      );
    });

    it('should open teams call url with video', () => {
      window.open = vi.fn();
      component.callUserViaTeams('user@test.com', true);
      expect(window.open).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=user@test.com&withVideo=true',
        '_blank',
      );
    });
  });

  describe('chatWithUserViaTeams', () => {
    it('should open teams chat url in new window', () => {
      window.open = vi.fn();
      component.chatWithUserViaTeams('user@test.com');
      expect(window.open).toHaveBeenCalledWith(
        'msteams:/l/chat/0/0?users=user@test.com',
        '_blank',
      );
    });
  });

  describe('emailUser', () => {
    it('should set location href to mailto', () => {
      const hrefSetter = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        set href(value: string) { hrefSetter(value); },
      } as unknown as Location);
      component.emailUser('user@test.com');
      expect(hrefSetter).toHaveBeenCalledWith('mailto:user@test.com');
    });
  });

  describe('isOpenChange', () => {
    it('should focus first tabbable element when opened', () => {
      vi.useFakeTimers();
      const focusFn = vi.fn();
      const popoverBody = { _focusFirstTabbableElement: focusFn } as any;
      vi.spyOn(component, 'popover').mockReturnValue(popoverBody);

      component.isOpenChange(true);
      vi.runAllTimers();

      expect(focusFn).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should do nothing when closed', () => {
      vi.useFakeTimers();
      const focusFn = vi.fn();
      const popoverBody = { _focusFirstTabbableElement: focusFn } as any;
      vi.spyOn(component, 'popover').mockReturnValue(popoverBody);

      component.isOpenChange(false);
      vi.runAllTimers();

      expect(focusFn).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
