import { MembersSidebarComponent } from './members-sidebar.component';
import { MockedObject } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AvatarProviderService,
  IamLuigiContextService,
  LuigiClient,
  MemberService,
  User,
} from '@platform-mesh/iam-lib';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';

describe('MembersSidebarComponent', () => {
  let component: MembersSidebarComponent;
  let luigiContextService: IamLuigiContextService;
  let memberService: MemberService;
  let cdr: ChangeDetectorRef;
  let luigiClient: LuigiClient;
  let mockAvatarProviderService: MockedObject<AvatarProviderService>;

  beforeEach(async () => {
    luigiContextService = MockService(IamLuigiContextService);

    memberService = MockService(MemberService, {
      users: vi.fn().mockReturnValue(of([])),
      user: vi.fn().mockReturnValue(of([])),
    } as any);

    cdr = MockService(ChangeDetectorRef, {
      detectChanges: vi.fn(),
    });

    luigiClient = MockService(LuigiClient, {
      linkManager: vi.fn().mockReturnValue({
        fromClosestContext: vi.fn().mockReturnValue({
          navigate: vi.fn(),
        }),
        navigate: vi.fn(),
      }),
    });

    const mockAvatarService = {
      getAvatarImageUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: AvatarProviderService, useValue: mockAvatarService },
        { provide: IamLuigiContextService, useValue: luigiContextService },
        { provide: MemberService, useValue: memberService },
        { provide: ChangeDetectorRef, useValue: cdr },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MembersSidebarComponent);
    component = fixture.componentInstance;
    component.LuigiClient = luigiClient as any;
    mockAvatarProviderService = TestBed.inject(
      AvatarProviderService,
    ) as MockedObject<AvatarProviderService>;
  });

  it('should get members on init', () => {
    const spy = vi.spyOn(component, 'getUsersOfEntity').mockReturnValue();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to user', () => {
    const spy = vi.spyOn(
      component.LuigiClient.linkManager().fromClosestContext(),
      'navigate',
    );

    component.navigateToMembers();
    expect(spy).toHaveBeenCalledWith('members');
  });

  it('should navigate to members', () => {
    const spy = vi.spyOn(component.LuigiClient.linkManager(), 'navigate');
    component.navigateToUser('123');
    expect(spy).toHaveBeenCalledWith('/users/123/overview');
  });

  it('should retrieve users and stop showing loading spinner', () => {
    const expectedUsers: User = {
      userId: 'foo',
    };
    memberService.users = vi
      .fn()
      .mockReturnValue(of({ users: [{ user: expectedUsers }] }));
    component.loading = true;

    const detectChangesSpy = vi.spyOn(component['cdr'], 'detectChanges');
    component.getUsersOfEntity();

    expect(component.loading).toBe(false);
    expect(component.members).toEqual([expectedUsers]);
    expect(detectChangesSpy).toHaveBeenCalled();
  });
});
