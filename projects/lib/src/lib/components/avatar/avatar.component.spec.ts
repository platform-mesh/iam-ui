import { User } from '../../models';
import { AvatarProviderService, IamLuigiContextService } from '../../services';
import { UserQuickViewComponent } from '../user-quick-view';
import { AvatarComponent } from './avatar.component';
import { AvatarMode } from './avatar.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarModule } from '@fundamental-ngx/core';
import { MockComponent, MockModule } from 'ng-mocks';
import { of } from 'rxjs';

jest.mock('../../services', () => ({
  AvatarProviderService: jest.fn(),
  IamLuigiContextService: jest.fn(),
}));

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;
  let mockAvatarProviderService: jest.Mocked<AvatarProviderService>;

  beforeEach(() => {
    const mockService = {
      getAvatarImageUrl: jest.fn(),
    };

    const mockIamLuigiContextService = {
      contextObservable: jest.fn().mockReturnValue(
        of({
          context: {
            portalContext: {
              avatarImgUrl: 'https://avatar.url',
            },
          },
        }),
      ),
    };

    void TestBed.configureTestingModule({
      providers: [
        { provide: AvatarProviderService, useValue: mockService },
        {
          provide: IamLuigiContextService,
          useValue: mockIamLuigiContextService,
        },
      ],
      imports: [
        AvatarComponent,
        MockComponent(UserQuickViewComponent),
        MockModule(AvatarModule),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('size', 's');
    fixture.componentRef.setInput('user', {
      firstName: 'John',
      userId: 'ICOS',
      lastName: 'Doe',
    });

    mockAvatarProviderService = TestBed.inject(
      AvatarProviderService,
    ) as jest.Mocked<AvatarProviderService>;
    fixture.detectChanges();
  });

  it('should set avatar mode as image and image url when Image fetch resolves', async () => {
    const expectedUrl = 'stab';

    mockAvatarProviderService.getAvatarImageUrl.mockResolvedValue(expectedUrl);

    await component.setupUserAvatar();

    expect(component.avatarMode).toBe(AvatarMode.Image);
    expect(component.imageUrl).toBe(expectedUrl);
  });

  it.each([
    [
      'fetch to get avatar image resolves',
      AvatarMode.Image,
      { firstName: 'John', userId: 'ICOS', lastName: 'Doe' },
      'stab',
    ],
    [
      'fetch to get avatar image rejects and user has firstName',
      AvatarMode.Name,
      { firstName: 'John', userId: 'ICOS', lastName: '' },
      undefined,
    ],
    [
      'fetch to get avatar image rejects and user has lastName',
      AvatarMode.Name,
      { firstName: '', userId: 'ICOS', lastName: 'Doe' },
      undefined,
    ],
    [
      'fetch to get avatar image rejects and user has firstName and lastName',
      AvatarMode.Name,
      { firstName: 'John', userId: 'ICOS', lastName: 'Doe' },
      undefined,
    ],
    [
      'fetch to get avatar image rejects and user does not have firstName or lastName',
      AvatarMode.GlyphIcon,
      { firstName: '', userId: 'ICOS', lastName: '' },
      undefined,
    ],
    [
      'user does not have id but has firstName or lastName',
      AvatarMode.Name,
      { firstName: 'John', userId: '', lastName: 'Doe' },
      undefined,
    ],
    [
      'user does not have id neither firstName or lastName',
      AvatarMode.GlyphIcon,
      { firstName: '', userId: '', lastName: '' },
      undefined,
    ],
  ])(
    'when %, sets avatar mode as %s',
    async (
      testDesc: string,
      expectedAvatarMode: AvatarMode,
      user: User,
      serviceResponse: string | undefined,
    ): Promise<void> => {
      fixture.componentRef.setInput('user', user);

      mockAvatarProviderService.getAvatarImageUrl.mockResolvedValue(
        serviceResponse,
      );

      await component.setupUserAvatar();

      expect(component.avatarMode).toBe(expectedAvatarMode);
    },
  );
});
