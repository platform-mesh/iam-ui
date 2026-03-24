import { MockedObject } from 'vitest';
import { MembersPageComponent } from './members-page.component';
import {
  ERROR_CHANGING_MEMBERS_ROLE,
  ERROR_MUST_HAVE_AT_LEAST_ONE_OWNER,
  ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE,
  SUCCESS_CHANGING_MEMBERS_ROLE,
} from './string-variables';
import { TestBed } from '@angular/core/testing';
import { MultiComboboxSelectionChangeEvent } from '@fundamental-ngx/core';
import {
  ClaimEntityService,
  IamLuigiContextService,
  LuigiClient,
  Member,
  MemberService,
  NotificationService,
  Role,
  RoutingService,
  User,
  UserConnection,
} from '@platform-mesh/iam-lib';
import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from '../../services/notification/confirmation.service';
import { ConfirmationMessagesService } from '../../services/confirmation-messages/confirmation-messages.service';
import { Observable, of } from 'rxjs';

const errorObservable = (msg = 'fail') =>
  new Observable<never>((s) => s.error(new Error(msg)));

describe('MembersPageComponent', () => {
  let component: MembersPageComponent;
  let memberService: MockedObject<MemberService>;
  let notificationService: MockedObject<NotificationService>;
  let confirmationService: MockedObject<ConfirmationService>;
  let luigiClient: MockedObject<LuigiClient>;
  let luigiContextService: MockedObject<IamLuigiContextService>;
  let claimEntityService: MockedObject<ClaimEntityService>;
  let routingService: MockedObject<RoutingService>;

  const mockRoles: Role[] = [
    { id: 'owner', displayName: 'Owner' } as Role,
    { id: 'member', displayName: 'Member' } as Role,
    { id: 'viewer', displayName: 'Viewer' } as Role,
  ];

  const mockUser: User = {
    userId: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  } as User;

  const mockMember: Member = {
    user: mockUser,
    roles: [mockRoles[0], mockRoles[1]],
  } as Member;

  const mockUserConnection: UserConnection = {
    users: [mockMember],
    ownersCount: 1,
    pageInfo: { totalCount: 1 },
  };

  const mockContext = {
    entityName: 'project',
    entityId: 'my-project',
    portalContext: { iamClaimEntityUrl: 'http://claim' },
  };

  beforeEach(async () => {
    memberService = {
      me: vi.fn().mockReturnValue(of(mockUser)),
      roles: vi.fn().mockReturnValue(of(mockRoles)),
      users: vi.fn().mockReturnValue(of(mockUserConnection)),
      removeRole: vi.fn().mockReturnValue(of({})),
      assignRolesToUser: vi.fn().mockReturnValue(of({})),
    } as any;

    notificationService = {
      openErrorStrip: vi.fn(),
      openSuccessToast: vi.fn(),
    } as any;

    confirmationService = {
      showRemoveMemberDialog: vi
        .fn()
        .mockResolvedValue(ConfirmationDialogDecision.CONFIRMED),
      showLeaveScopeDialog: vi
        .fn()
        .mockResolvedValue(ConfirmationDialogDecision.CONFIRMED),
    } as any;

    luigiClient = {
      linkManager: vi.fn().mockReturnValue({
        fromParent: vi.fn().mockReturnValue({
          openAsModal: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      clearFrameCache: vi.fn(),
    } as any;

    luigiContextService = {
      getContextAsync: vi.fn().mockResolvedValue(mockContext),
    } as any;

    claimEntityService = {
      claim: vi.fn(),
    } as any;

    routingService = {
      openLink: vi.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [MembersPageComponent],
      providers: [
        { provide: MemberService, useValue: memberService },
        { provide: NotificationService, useValue: notificationService },
        { provide: LuigiClient, useValue: luigiClient },
        { provide: IamLuigiContextService, useValue: luigiContextService },
        { provide: ClaimEntityService, useValue: claimEntityService },
        { provide: RoutingService, useValue: routingService },
      ],
    })
    .overrideComponent(MembersPageComponent, {
      set: {
        providers: [
          { provide: ConfirmationService, useValue: confirmationService },
          { provide: ConfirmationMessagesService, useValue: { getAddedMembersMessage: vi.fn().mockReturnValue('added') } },
        ],
      },
    })
    .compileComponents();

    const fixture = TestBed.createComponent(MembersPageComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('sets context fields', () => {
      expect(component.currentEntity).toBe('project');
      expect(component.scopeDisplayName).toBe('my-project');
    });

    it('loads roles for entity', () => {
      expect(component.rolesForEntity()).toEqual(mockRoles);
    });

    it('loads members', () => {
      expect(component.members()).toEqual([mockMember]);
    });

    it('sets ownersCount', () => {
      expect(component.ownersCount()).toBe(1);
    });

    it('sets currentUser', () => {
      expect(component.currentUser).toEqual(mockMember);
    });
  });

  describe('isCurrentUser', () => {
    it('returns true when userId matches', () => {
      expect(component.isCurrentUser(mockMember)).toBe(true);
    });

    it('returns false when userId does not match', () => {
      const other = { user: { userId: 'other' }, roles: [] } as any;
      expect(component.isCurrentUser(other)).toBe(false);
    });
  });

  describe('selectedRoles', () => {
    it('returns roles from rolesForEntity matching member roles', () => {
      const result = component.selectedRoles(mockMember);
      expect(result).toEqual([mockRoles[0], mockRoles[1]]);
    });
  });

  describe('openRemoveMemberDialog', () => {
    it('calls removeRole for each role and refreshes on confirm', () => {
      let thenCallback: Function | undefined;
      confirmationService.showRemoveMemberDialog.mockReturnValue({
        then: (cb: Function) => {
          thenCallback = cb;
          return { catch: vi.fn() };
        },
      } as any);
      component.openRemoveMemberDialog(mockMember);
      thenCallback!(ConfirmationDialogDecision.CONFIRMED);
      expect(memberService.removeRole).toHaveBeenCalledWith('user-123', 'owner');
      expect(memberService.removeRole).toHaveBeenCalledWith('user-123', 'member');
      expect(notificationService.openSuccessToast).toHaveBeenCalled();
    });

    it('does nothing when dismissed', () => {
      let thenCallback: Function | undefined;
      confirmationService.showRemoveMemberDialog.mockReturnValue({
        then: (cb: Function) => {
          thenCallback = cb;
          return { catch: vi.fn() };
        },
      } as any);
      component.openRemoveMemberDialog(mockMember);
      thenCallback!(ConfirmationDialogDecision.DISMISSED);
      expect(memberService.removeRole).not.toHaveBeenCalled();
    });

    it('shows error when removeRole fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      memberService.removeRole.mockReturnValue(errorObservable());
      let thenCallback: Function | undefined;
      confirmationService.showRemoveMemberDialog.mockReturnValue({
        then: (cb: Function) => {
          thenCallback = cb;
          return { catch: vi.fn() };
        },
      } as any);
      component.openRemoveMemberDialog(mockMember);
      thenCallback!(ConfirmationDialogDecision.CONFIRMED);
      expect(notificationService.openErrorStrip).toHaveBeenCalled();
    });
  });

  describe('openLeaveDialog', () => {
    it('calls removeRole for each role on confirm', () => {
      let thenCallback: Function | undefined;
      confirmationService.showLeaveScopeDialog.mockReturnValue({
        then: (cb: Function) => {
          thenCallback = cb;
          return { catch: vi.fn() };
        },
      } as any);
      component.openLeaveDialog();
      thenCallback!(ConfirmationDialogDecision.CONFIRMED);
      expect(memberService.removeRole).toHaveBeenCalledTimes(2);
    });

    it('does nothing when dismissed', () => {
      let thenCallback: Function | undefined;
      confirmationService.showLeaveScopeDialog.mockReturnValue({
        then: (cb: Function) => {
          thenCallback = cb;
          return { catch: vi.fn() };
        },
      } as any);
      component.openLeaveDialog();
      thenCallback!(ConfirmationDialogDecision.DISMISSED);
      expect(memberService.removeRole).not.toHaveBeenCalled();
    });
  });

  describe('saveMember', () => {
    const makeEvent = (selectedItems: Role[]) =>
      ({
        selectedItems,
        source: { setValue: vi.fn() } as any,
      }) as MultiComboboxSelectionChangeEvent;

    beforeEach(() => {
      (component as any).lockView = false;
    });

    it('does nothing when selection is unchanged', () => {
      const event = makeEvent([mockRoles[0], mockRoles[1]]);
      component.saveMember(event, mockMember);
      expect(memberService.removeRole).not.toHaveBeenCalled();
      expect(memberService.assignRolesToUser).not.toHaveBeenCalled();
    });

    it('shows error when no roles selected', () => {
      const event = makeEvent([]);
      component.saveMember(event, mockMember);
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE,
      );
    });

    it('shows error when current user tries to remove only owner', () => {
      const ownerOnlyMember: Member = {
        user: mockUser,
        roles: [mockRoles[0]],
      } as Member;
      const event = makeEvent([mockRoles[1]]);
      component.saveMember(event, ownerOnlyMember);
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        ERROR_MUST_HAVE_AT_LEAST_ONE_OWNER,
      );
    });

    it('calls removeRole when a role is removed', () => {
      const otherMember: Member = {
        user: { userId: 'other-user' } as User,
        roles: [mockRoles[0], mockRoles[1]],
      } as Member;
      const event = makeEvent([mockRoles[1]]);
      component.saveMember(event, otherMember);
      expect(memberService.removeRole).toHaveBeenCalledWith('other-user', 'owner');
    });

    it('calls assignRolesToUser when a role is added', () => {
      const singleRoleMember: Member = {
        user: mockUser,
        roles: [mockRoles[1]],
      } as Member;
      const event = makeEvent([mockRoles[0], mockRoles[1]]);
      component.saveMember(event, singleRoleMember);
      expect(memberService.assignRolesToUser).toHaveBeenCalledWith({
        changes: [{ userId: 'user-123', roles: ['owner', 'member'] }],
      });
    });

    it('shows success toast after assigning roles', () => {
      const singleRoleMember: Member = {
        user: mockUser,
        roles: [mockRoles[1]],
      } as Member;
      const event = makeEvent([mockRoles[0], mockRoles[1]]);
      component.saveMember(event, singleRoleMember);
      expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
        SUCCESS_CHANGING_MEMBERS_ROLE,
      );
    });

    it('shows error toast when assignRolesToUser fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      memberService.assignRolesToUser.mockReturnValue(errorObservable());
      const singleRoleMember: Member = {
        user: mockUser,
        roles: [mockRoles[1]],
      } as Member;
      const event = makeEvent([mockRoles[0], mockRoles[1]]);
      component.saveMember(event, singleRoleMember);
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        ERROR_CHANGING_MEMBERS_ROLE,
      );
    });
  });

  describe('readMembers', () => {
    it('sets isLoading to false after load', () => {
      component.readMembers();
      expect(component.isLoading()).toBe(false);
    });

    it('does not throw when members is undefined', () => {
      memberService.users.mockReturnValue(of(undefined));
      expect(() => component.readMembers()).not.toThrow();
    });
  });

  describe('newPageClicked', () => {
    it('updates currentPage and calls readMembers', () => {
      const spy = vi.spyOn(component, 'readMembers');
      component.newPageClicked(3);
      expect(component.currentPage).toBe(3);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onSearchSubmit', () => {
    it('resets to page 1 and sets searchTerm', () => {
      const spy = vi.spyOn(component, 'readMembers');
      component.onSearchSubmit('  hello  ');
      expect(component.currentPage).toBe(1);
      expect(component.searchTerm).toBe('hello');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('noFiltersApplied', () => {
    it('returns true when no filters are set', () => {
      component.selectedFilterRoleIds = [];
      component.searchTerm = '';
      expect(component.noFiltersApplied()).toBe(true);
    });

    it('returns false when search term is set', () => {
      component.searchTerm = 'foo';
      expect(component.noFiltersApplied()).toBe(false);
    });

    it('returns false when role filters are set', () => {
      component.selectedFilterRoleIds = ['owner'];
      expect(component.noFiltersApplied()).toBe(false);
    });
  });

  describe('navigateToUserProfile', () => {
    it('calls routingService.openLink with correct url', () => {
      component.navigateToUserProfile('user-123');
      expect(routingService.openLink).toHaveBeenCalledWith({
        displayName: 'user-123',
        link: { url: '/users/user-123/overview', external: false },
      });
    });
  });

  describe('claim', () => {
    it('delegates to claimEntityService', () => {
      component.claim();
      expect(claimEntityService.claim).toHaveBeenCalled();
    });
  });
});
