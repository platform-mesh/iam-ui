import { User } from '../../models';
import { LuigiClient } from '../../services/luigi';
import { UserQuickViewComponent } from './user-quick-view.component';

describe('UserQuickViewComponent', () => {
  const luigiClient: LuigiClient = {} as LuigiClient;
  let component: UserQuickViewComponent;

  beforeEach(async () => {
    component = new UserQuickViewComponent(luigiClient);
  });

  describe('getUserAvatarImgUrl', () => {
    it('should provide user avatar url', () => {
      // given
      component.user = { userId: 'C776' } as User;

      // then
      expect(component.getUserAvatarImgUrl()).toEqual(
        'https://avatars.wdf.sap.corp/avatar/C776',
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
