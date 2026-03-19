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
});
