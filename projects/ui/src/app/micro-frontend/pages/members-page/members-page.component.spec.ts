import { ConfirmationMessagesService } from '../../services/confirmation-messages/confirmation-messages.service';
import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from '../../services/notification/confirmation.service';
import { MembersPageComponent } from './members-page.component';
import { TestBed } from '@angular/core/testing';
import { MultiComboboxSelectionChangeEvent } from '@fundamental-ngx/core';
import {
  ClaimEntityService,
  IamLuigiContextService,
  LuigiClient,
  Member,
  MemberService,
  NodeContext,
  NotificationService,
  Role,
  RoutingService,
  SortDirection,
  User,
  UserConnection,
  UserSortField,
} from '@platform-mesh/iam-lib';
import { of, throwError } from 'rxjs';

describe('MembersPageComponent', () => {
  let component: MembersPageComponent;
  let memberService: jest.Mocked<MemberService>;
  let notificationService: jest.Mocked<NotificationService>;
  let confirmationService: jest.Mocked<ConfirmationService>;
  let luigiClient: jest.Mocked<LuigiClient>;
  let luigiContextService: jest.Mocked<IamLuigiContextService>;
  let claimEntityService: jest.Mocked<ClaimEntityService>;
  let confirmationMessagesService: jest.Mocked<ConfirmationMessagesService>;
  let routingService: jest.Mocked<RoutingService>;

  const mockContext: NodeContext = {
    entityName: 'test-entity',
    userId: 'user-123',
    entityId: 'entity-123',
    portalContext: { iamClaimEntityUrl: 'https://test.com' },
  } as any;

  const mockRoles: Role[] = [
    { id: 'owner', displayName: 'Owner' } as Role,
    { id: 'member', displayName: 'Member' } as Role,
    { id: 'viewer', displayName: 'Viewer' } as Role,
  ];

  const mockUser: User = {
    userId: 'user-456',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  } as User;

  const mockMember: Member = {
    user: mockUser,
    roles: [mockRoles[1]],
  } as Member;

  const mockUserConnection: UserConnection = {
    users: [mockMember],
    pageInfo: {
      totalCount: 1,
      ownerCount: 1,
    },
  } as UserConnection;

  beforeEach(() => {
    memberService = {
      roles: jest.fn().mockReturnValue(of(mockRoles)),
      users: jest.fn().mockReturnValue(of(mockUserConnection)),
      removeRole: jest.fn().mockReturnValue(of({})),
      assignRolesToUser: jest.fn().mockReturnValue(of({})),
      me: jest.fn().mockReturnValue(of({ userId: 'user-123' })),
    } as any;

    notificationService = {
      openSuccessToast: jest.fn(),
      openErrorStrip: jest.fn(),
    } as any;

    confirmationService = {
      showRemoveMemberDialog: jest.fn(),
      showLeaveScopeDialog: jest.fn(),
    } as any;

    const linkManager = {
      fromParent: jest.fn().mockReturnThis(),
      openAsModal: jest.fn().mockResolvedValue(undefined),
    };

    luigiClient = {
      linkManager: jest.fn().mockReturnValue(linkManager),
      clearFrameCache: jest.fn(),
    } as any;

    luigiContextService = {
      getContextAsync: jest.fn().mockResolvedValue(mockContext),
    } as any;

    claimEntityService = {
      claim: jest.fn(),
    } as any;

    confirmationMessagesService = {
      getAddedMembersMessage: jest.fn().mockReturnValue('Members added'),
    } as any;

    routingService = {
      openLink: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MembersPageComponent,
        { provide: MemberService, useValue: memberService },
        { provide: NotificationService, useValue: notificationService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: LuigiClient, useValue: luigiClient },
        { provide: IamLuigiContextService, useValue: luigiContextService },
        { provide: ClaimEntityService, useValue: claimEntityService },
        {
          provide: ConfirmationMessagesService,
          useValue: confirmationMessagesService,
        },
        { provide: RoutingService, useValue: routingService },
      ],
    });

    component = TestBed.inject(MembersPageComponent);
  });

  describe('ngOnInit', () => {
    it('should initialize component with context and roles', async () => {
      await component.ngOnInit();

      expect(luigiContextService.getContextAsync).toHaveBeenCalled();
      expect(component.currentEntity).toBe('test-entity');
      expect(component.currentUserId).toBe('user-123');
      expect(component.iamClaimEntityUrl).toBe('https://test.com');
      expect(component.scopeDisplayName).toBe('entity-123');
      expect(memberService.roles).toHaveBeenCalled();
      expect(component.rolesForEntity()).toEqual(mockRoles);
    });

    it('should read members on initialization', async () => {
      await component.ngOnInit();

      expect(memberService.users).toHaveBeenCalledWith({
        page: { page: 1, limit: 10 },
        roleFilters: [],
        sortBy: { field: UserSortField.lastName, direction: SortDirection.asc },
      });
    });
  });

  describe('isCurrentUserMember', () => {
    it('should return true when user has member role', () => {
      const member: Member = {
        user: mockUser,
        roles: [{ id: 'member' } as Role],
      } as Member;

      expect(component.isUserMember(member)).toBe(true);
    });

    it('should return false when user does not have member role', () => {
      const member: Member = {
        user: mockUser,
        roles: [{ id: 'viewer' } as Role],
      } as Member;

      expect(component.isUserMember(member)).toBe(false);
    });
  });

  describe('navigateToUserProfile', () => {
    it('should navigate to user profile', () => {
      component.navigateToUserProfile('user-123');

      expect(routingService.openLink).toHaveBeenCalledWith({
        displayName: 'user-123',
        link: {
          url: '/users/user-123/overview',
          external: false,
        },
      });
    });
  });

  describe('equalsCurrentUser', () => {
    it('should return true when member is current user', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: { userId: 'user-123' } as User,
      } as Member;

      expect(component.isCurrentUser(member)).toBe(true);
    });

    it('should return false when member is not current user', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: { userId: 'user-456' } as User,
      } as Member;

      expect(component.isCurrentUser(member)).toBe(false);
    });
  });

  describe('getUserNameOrId', () => {
    it('should return username with You postfix for current user', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: {
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
        } as User,
      } as Member;

      const result = component.getUserNameOrId(member);
      expect(result).toContain('(You)');
    });

    it('should return username without postfix for other users', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: {
          userId: 'user-456',
          firstName: 'Jane',
          lastName: 'Smith',
        } as User,
      } as Member;

      const result = component.getUserNameOrId(member);
      expect(result).not.toContain('(You)');
    });
  });

  describe('readMembers', () => {
    it('should load members successfully', async () => {
      await component.ngOnInit();
      component.readMembers();

      expect(memberService.users).toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
      expect(component.members()).toEqual(mockUserConnection.users);
      expect(component.totalItems()).toBe(1);
    });

    it('should handle error when loading members', async () => {
      memberService.users.mockReturnValue(
        throwError(() => new Error('API Error')),
      );
      await component.ngOnInit();

      expect(component.isLoading()).toBe(false);
    });

    it('should handle empty members response', async () => {
      memberService.users.mockReturnValue(of(null as any));
      await component.ngOnInit();

      expect(component.members()).toEqual([]);
    });
  });

  describe('openAddMembersDialog', () => {
    it('should open add members modal', async () => {
      await component.ngOnInit();
      component.openAddMembersDialog();

      expect(luigiClient.linkManager).toHaveBeenCalled();
    });
  });

  describe('openRemoveMemberDialog', () => {
    it('should remove member when confirmed', async () => {
      await component.ngOnInit();
      confirmationService.showRemoveMemberDialog.mockResolvedValue(
        ConfirmationDialogDecision.CONFIRMED,
      );

      await component.openRemoveMemberDialog(mockMember);

      expect(confirmationService.showRemoveMemberDialog).toHaveBeenCalledWith(
        mockUser,
      );
      expect(memberService.removeRole).toHaveBeenCalledWith(
        mockUser.userId,
        'member',
      );
      expect(notificationService.openSuccessToast).toHaveBeenCalled();
    });

    it('should not remove member when cancelled', async () => {
      await component.ngOnInit();
      confirmationService.showRemoveMemberDialog.mockResolvedValue(
        ConfirmationDialogDecision.DISMISSED,
      );

      await component.openRemoveMemberDialog(mockMember);

      expect(memberService.removeRole).not.toHaveBeenCalled();
    });

    it('should show error when removal fails', async () => {
      await component.ngOnInit();
      confirmationService.showRemoveMemberDialog.mockResolvedValue(
        ConfirmationDialogDecision.CONFIRMED,
      );
      memberService.removeRole.mockReturnValue(
        throwError(() => new Error('Remove failed')),
      );

      await component.openRemoveMemberDialog(mockMember);

      expect(notificationService.openErrorStrip).toHaveBeenCalled();
    });
  });

  describe('openLeaveDialog', () => {
    it('should allow user to leave when confirmed', async () => {
      await component.ngOnInit();
      confirmationService.showLeaveScopeDialog.mockResolvedValue(
        ConfirmationDialogDecision.CONFIRMED,
      );

      await component.openLeaveDialog();

      expect(confirmationService.showLeaveScopeDialog).toHaveBeenCalledWith(
        'entity-123',
      );
      expect(memberService.removeRole).toHaveBeenCalledWith(
        'user-123',
        'member',
      );
      expect(notificationService.openSuccessToast).toHaveBeenCalled();
    });

    it('should not leave when cancelled', async () => {
      await component.ngOnInit();
      confirmationService.showLeaveScopeDialog.mockResolvedValue(
        ConfirmationDialogDecision.DISMISSED,
      );

      await component.openLeaveDialog();

      expect(memberService.removeRole).not.toHaveBeenCalled();
    });

    it('should show error when leaving fails', async () => {
      await component.ngOnInit();
      confirmationService.showLeaveScopeDialog.mockResolvedValue(
        ConfirmationDialogDecision.CONFIRMED,
      );
      memberService.removeRole.mockReturnValue(
        throwError(() => new Error('Leave failed')),
      );

      await component.openLeaveDialog();

      expect(notificationService.openErrorStrip).toHaveBeenCalled();
    });
  });

  describe('saveMember', () => {
    const mockEvent = {
      selectedItems: [mockRoles[0]],
      source: { setValue: jest.fn() },
    } as unknown as MultiComboboxSelectionChangeEvent;

    it('should save member roles successfully', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: mockUser,
        roles: [mockRoles[1]],
      } as Member;

      component.saveMember(mockEvent, member);

      expect(memberService.assignRolesToUser).toHaveBeenCalledWith([
        {
          userId: mockUser.userId,
          roles: mockEvent.selectedItems.map((r) => r.id),
        },
      ]);
      expect(notificationService.openSuccessToast).toHaveBeenCalled();
    });

    it('should not save when roles are unchanged', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: mockUser,
        roles: [mockRoles[0]],
      } as Member;
      const event = {
        selectedItems: [mockRoles[0]],
        source: { setValue: jest.fn() },
      } as unknown as MultiComboboxSelectionChangeEvent;

      component.saveMember(event, member);

      expect(memberService.assignRolesToUser).not.toHaveBeenCalled();
    });

    it('should show error when no roles selected', async () => {
      await component.ngOnInit();
      const event = {
        selectedItems: [],
        source: { setValue: jest.fn() },
      } as unknown as MultiComboboxSelectionChangeEvent;

      component.saveMember(event, mockMember);

      expect(notificationService.openErrorStrip).toHaveBeenCalled();
      expect(event.source.setValue).toHaveBeenCalledWith(mockMember.roles);
    });

    it('should prevent unique owner from removing owner role', async () => {
      await component.ngOnInit();
      component.currentUserIsOwner = true;
      const currentUserMember: Member = {
        user: { userId: 'user-123' } as User,
        roles: [mockRoles[0]],
      } as Member;
      const event = {
        selectedItems: [mockRoles[1]],
        source: { setValue: jest.fn() },
      } as unknown as MultiComboboxSelectionChangeEvent;

      component.saveMember(event, currentUserMember);

      expect(notificationService.openErrorStrip).toHaveBeenCalled();
      expect(event.source.setValue).toHaveBeenCalledWith(
        currentUserMember.roles,
      );
    });

    it('should clear frame cache when current user roles change', async () => {
      await component.ngOnInit();
      const currentUserMember: Member = {
        user: { userId: 'user-123' } as User,
        roles: [mockRoles[1]],
      } as Member;

      component.saveMember(mockEvent, currentUserMember);

      expect(luigiClient.clearFrameCache).toHaveBeenCalled();
    });
  });

  describe('selectedRoles', () => {
    it('should return filtered roles for member', async () => {
      await component.ngOnInit();
      const member: Member = {
        user: mockUser,
        roles: [{ id: 'owner' } as Role, { id: 'member' } as Role],
      } as Member;

      const result = component.selectedRoles(member);

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(['owner', 'member']);
    });
  });

  describe('newPageClicked', () => {
    it('should change page and reload members', async () => {
      await component.ngOnInit();
      memberService.users.mockClear();

      component.newPageClicked(2);

      expect(component.currentPage).toBe(2);
      expect(memberService.users).toHaveBeenCalled();
    });
  });

  describe('emailUser', () => {
    it('should attempt to navigate to mailto link', () => {
      expect(() => component.emailUser(mockUser)).not.toThrow();
    });
  });

  describe('callUserViaTeams', () => {
    it('should open Teams call without video', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

      component.callUserViaTeams(mockUser, false);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=test@example.com&withVideo=false',
        '_blank',
      );

      windowOpenSpy.mockRestore();
    });

    it('should open Teams call with video', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

      component.callUserViaTeams(mockUser, true);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'msteams:/l/call/0/0?users=test@example.com&withVideo=true',
        '_blank',
      );

      windowOpenSpy.mockRestore();
    });
  });

  describe('chatWithUserViaTeams', () => {
    it('should open Teams chat', () => {
      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

      component.chatWithUserViaTeams(mockUser);

      expect(windowOpenSpy).toHaveBeenCalledWith(
        'msteams:/l/chat/0/0?users=test@example.com',
        '_blank',
      );

      windowOpenSpy.mockRestore();
    });
  });

  describe('itemsPerPageChange', () => {
    it('should change items per page and reset to first page', async () => {
      await component.ngOnInit();
      component.currentPage = 3;
      memberService.users.mockClear();

      component.itemsPerPageChange(15);

      expect(component.itemsPerPage).toBe(15);
      expect(component.currentPage).toBe(1);
      expect(memberService.users).toHaveBeenCalled();
    });
  });

  describe('claim', () => {
    it('should call claim entity service', () => {
      component.claim();

      expect(claimEntityService.claim).toHaveBeenCalled();
    });
  });

  describe('onSearchSubmit', () => {
    it('should search with trimmed term', async () => {
      await component.ngOnInit();
      memberService.users.mockClear();

      component.onSearchSubmit('  test search  ');

      expect(component.searchTerm).toBe('test search');
      expect(component.currentPage).toBe(1);
      expect(memberService.users).toHaveBeenCalled();
    });

    it('should search with empty term', async () => {
      await component.ngOnInit();
      memberService.users.mockClear();

      component.onSearchSubmit();

      expect(component.searchTerm).toBe('');
      expect(memberService.users).toHaveBeenCalled();
    });
  });

  describe('setRolesFilter', () => {
    it('should filter by selected roles', async () => {
      await component.ngOnInit();
      memberService.users.mockClear();
      const event = {
        selectedItems: [mockRoles[0], mockRoles[1]],
      } as MultiComboboxSelectionChangeEvent;

      component.setRolesFilter(event);

      expect(component.selectedFilterRoleIds).toEqual(['owner', 'member']);
      expect(component.currentPage).toBe(1);
      expect(memberService.users).toHaveBeenCalled();
    });
  });

  describe('noFiltersApplied', () => {
    it('should return true when no filters applied', () => {
      component.selectedFilterRoleIds = [];
      component.searchTerm = '';

      expect(component.noFiltersApplied()).toBe(true);
    });

    it('should return false when role filter applied', () => {
      component.selectedFilterRoleIds = ['owner'];
      component.searchTerm = '';

      expect(component.noFiltersApplied()).toBe(false);
    });

    it('should return false when search term applied', () => {
      component.selectedFilterRoleIds = [];
      component.searchTerm = 'test';

      expect(component.noFiltersApplied()).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', () => {
      const unsubscribeSpy = jest.spyOn(
        component['subscriptions'],
        'unsubscribe',
      );

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
