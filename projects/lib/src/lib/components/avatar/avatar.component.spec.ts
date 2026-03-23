import { User } from '../../models';
import { MockedObject } from 'vitest';
import {
  AvatarProviderService,
  IamLuigiContextService,
  LuigiClient,
} from '../../services';
import { AvatarComponent } from './avatar.component';
import { AvatarMode } from './avatar.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarModule } from '@fundamental-ngx/core';
import { MockModule } from 'ng-mocks';
import { of } from 'rxjs';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;
  let mockAvatarProviderService: MockedObject<AvatarProviderService>;

  beforeEach(() => {
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

    const mockLuigiClient = {
      linkManager: vi.fn().mockReturnValue({
        navigate: vi.fn(),
      }),
    };

    void TestBed.configureTestingModule({
      providers: [
        { provide: AvatarProviderService, useValue: mockService },
        {
          provide: IamLuigiContextService,
          useValue: mockIamLuigiContextService,
        },
        { provide: LuigiClient, useValue: mockLuigiClient },
      ],
      imports: [AvatarComponent, MockModule(AvatarModule)],
      schemas: [NO_ERRORS_SCHEMA],
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
    ) as MockedObject<AvatarProviderService>;
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
      { firstName: 'John', userId: 'ICOS', lastName: 'Doe', email: '' },
      'stab',
    ],
    [
      'fetch to get avatar image rejects and user has firstName',
      AvatarMode.Name,
      { firstName: 'John', userId: 'ICOS', lastName: '', email: '' },
      undefined,
    ],
    [
      'fetch to get avatar image rejects and user has lastName',
      AvatarMode.Name,
      { firstName: '', userId: 'ICOS', lastName: 'Doe', email: '' },
      undefined,
    ],
    [
      'fetch to get avatar image rejects and user has firstName and lastName',
      AvatarMode.Name,
      { firstName: 'John', userId: 'ICOS', lastName: 'Doe', email: '' },
      undefined,
    ],
    [
      'fetch to get avatar image rejects and user does not have firstName or lastName',
      AvatarMode.GlyphIcon,
      { firstName: '', userId: 'ICOS', lastName: '', email: '' },
      undefined,
    ],
    [
      'user does not have id but has firstName or lastName',
      AvatarMode.Name,
      { firstName: 'John', userId: '', lastName: 'Doe', email: '' },
      undefined,
    ],
    [
      'user does not have id neither firstName or lastName',
      AvatarMode.GlyphIcon,
      { firstName: '', userId: '', lastName: '', email: '' },
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
