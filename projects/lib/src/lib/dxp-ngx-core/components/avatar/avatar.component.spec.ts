import { User } from '../../models';
import { imageLoadable } from '../image-loadable';
import { UserQuickViewComponent } from '../user-quick-view';
import { AvatarComponent } from './avatar.component';
import { AvatarMode } from './avatar.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarModule } from '@fundamental-ngx/core';
import { MockComponent, MockModule } from 'ng-mocks';

jest.mock('../image-loadable', () => ({
  imageLoadable: jest.fn(),
}));

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(() => {
    void TestBed.configureTestingModule({
      providers: [],
      imports: [
        AvatarComponent,
        MockComponent(UserQuickViewComponent),
        MockModule(AvatarModule),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set avatar mode as image and image url when Image fetch resolves', async () => {
    const expectedUrl = 'https://avatars.wdf.sap.corp/avatar/ICOS';
    component.user = { firstName: 'John', userId: 'ICOS', lastName: 'Doe' };

    (imageLoadable as jest.Mock).mockResolvedValue(true);

    await component.setupUserAvatar();

    expect(component.avatarMode).toBe(AvatarMode.Image);
    expect(component.imageUrl).toBe(expectedUrl);
  });

  it.each([
    [
      'fetch to get avatar image resolves',
      AvatarMode.Image,
      { firstName: 'John', userId: 'ICOS', lastName: 'Doe' },
      true,
    ],
    [
      'fetch to get avatar image rejects and user has firstName',
      AvatarMode.Name,
      { firstName: 'John', userId: 'ICOS', lastName: '' },
      false,
    ],
    [
      'fetch to get avatar image rejects and user has lastName',
      AvatarMode.Name,
      { firstName: '', userId: 'ICOS', lastName: 'Doe' },
      false,
    ],
    [
      'fetch to get avatar image rejects and user has firstName and lastName',
      AvatarMode.Name,
      { firstName: 'John', userId: 'ICOS', lastName: 'Doe' },
      false,
    ],
    [
      'fetch to get avatar image rejects and user does not have firstName or lastName',
      AvatarMode.GlyphIcon,
      { firstName: '', userId: 'ICOS', lastName: '' },
      false,
    ],
    [
      'user does not have id but has firstName or lastName',
      AvatarMode.Name,
      { firstName: 'John', userId: '', lastName: 'Doe' },
      true,
    ],
    [
      'user does not have id neither firstName or lastName',
      AvatarMode.GlyphIcon,
      { firstName: '', userId: '', lastName: '' },
      true,
    ],
  ])(
    'when %, sets avatar mode as %s',
    async (
      testDesc: string,
      expectedAvatarMode: AvatarMode,
      user: User,
      fetchResponse: boolean,
    ): Promise<void> => {
      component.user = user;

      (imageLoadable as jest.Mock).mockResolvedValue(fetchResponse);

      await component.setupUserAvatar();

      expect(component.avatarMode).toBe(expectedAvatarMode);
    },
  );
});
