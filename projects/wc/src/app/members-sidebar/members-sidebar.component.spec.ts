import { MembersSidebarComponent } from './members-sidebar.component';
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
  let mockAvatarProviderService: jest.Mocked<AvatarProviderService>;

  beforeEach(async () => {
    luigiContextService = MockService(IamLuigiContextService);

    memberService = MockService(MemberService, {
      users: jest.fn().mockReturnValue(of([])),
      user: jest.fn().mockReturnValue(of([])),
    } as any);

    cdr = MockService(ChangeDetectorRef, {
      detectChanges: jest.fn(),
    });

    luigiClient = MockService(LuigiClient, {
      linkManager: jest.fn().mockReturnValue({
        fromClosestContext: jest.fn().mockReturnValue({
          navigate: jest.fn(),
        }),
        navigate: jest.fn(),
      }),
    });

    const mockAvatarService = {
      getAvatarImageUrl: jest.fn(),
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
    ) as jest.Mocked<AvatarProviderService>;
  });

  it('should get members on init', () => {
    const spy = jest.spyOn(component, 'getUsersOfEntity').mockReturnValue();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to user', () => {
    const spy = jest.spyOn(
      component.LuigiClient.linkManager().fromClosestContext(),
      'navigate',
    );

    component.navigateToMembers();
    expect(spy).toHaveBeenCalledWith('members');
  });

  it('should navigate to members', () => {
    const spy = jest.spyOn(component.LuigiClient.linkManager(), 'navigate');
    component.navigateToUser('123');
    expect(spy).toHaveBeenCalledWith('/users/123/overview');
  });

  it('should retrieve users and stop showing loading spinner', () => {
    const expectedUsers: User = {
      userId: 'foo',
    };
    memberService.users = jest
      .fn()
      .mockReturnValue(of({ users: [{ user: expectedUsers }] }));
    component.loading = true;

    const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');
    component.getUsersOfEntity();

    expect(component.loading).toBe(false);
    expect(component.members).toEqual([expectedUsers]);
    expect(detectChangesSpy).toHaveBeenCalled();
  });
});
