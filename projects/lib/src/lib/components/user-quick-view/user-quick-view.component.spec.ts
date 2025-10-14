import { User } from '../../models';
import { AvatarProviderService, LuigiClient } from '../../services';
import { UserQuickViewComponent } from './user-quick-view.component';
import { TestBed } from '@angular/core/testing';

describe('UserQuickViewComponent', () => {
  const luigiClient: LuigiClient = {} as LuigiClient;
  let component: UserQuickViewComponent;
  let mockAvatarProviderService: jest.Mocked<AvatarProviderService>;

  beforeEach(async () => {
    const mockService = {
      getAvatarImageUrl: jest.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: AvatarProviderService, useValue: mockService },
        { provide: LuigiClient, useValue: luigiClient },
      ],
    }).compileComponents();

    component = TestBed.createComponent(
      UserQuickViewComponent,
    ).componentInstance;
    mockAvatarProviderService = TestBed.inject(
      AvatarProviderService,
    ) as jest.Mocked<AvatarProviderService>;
  });

  describe('getUserAvatarImgUrl', () => {
    it('should provide user avatar url', async () => {
      // given
      const expectedUrl = 'stab';
      component.user = { userId: 'C776' } as User;
      mockAvatarProviderService.getAvatarImageUrl.mockResolvedValue(
        expectedUrl,
      );

      // when
      const result = await component.getUserAvatarImgUrl();

      // then
      expect(result).toEqual(expectedUrl);
      expect(mockAvatarProviderService.getAvatarImageUrl).toHaveBeenCalledWith(
        component.user,
      );
    });
  });

  describe('getUserFullName', () => {
    it('should provide user full name', () => {
      // given
      component.user = { firstName: 'John', lastName: 'Doe' } as User;

      // then
      expect(component.getUserFullName()).toEqual('John Doe');
    });
  });

  describe('navigateToUserProfile', () => {
    it('should navigate to users profile', () => {
      // given
      const navigate = jest.fn();
      luigiClient.linkManager = jest.fn().mockReturnValue({ navigate });

      // when
      component.navigateToUserProfile('userId');

      // then
      expect(navigate).toHaveBeenCalledWith('/users/userId/overview');
    });
  });
});
