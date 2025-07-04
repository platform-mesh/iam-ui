import { MembersSidebarComponent } from './members-sidebar.component';
import { ChangeDetectorRef } from '@angular/core';
import {
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

  beforeEach(() => {
    luigiContextService = MockService(IamLuigiContextService);

    memberService = MockService(MemberService, {
      getUsersOfEntity: jest.fn().mockReturnValue(of([])),
      getMembers: jest.fn().mockReturnValue(of([])),
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

    component = new MembersSidebarComponent(
      luigiContextService,
      memberService,
      cdr,
    );

    component.LuigiClient = luigiClient as any;
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
    memberService.usersOfEntity = jest
      .fn()
      .mockReturnValue(of({ users: [{ user: expectedUsers }] }));
    component.loading = true;

    component.getUsersOfEntity();

    expect(component.loading).toBe(false);
    expect(component.members).toEqual([expectedUsers]);
    expect(cdr.detectChanges).toHaveBeenCalled();
  });
});
