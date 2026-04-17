import { MockedObject } from 'vitest';
import {
  AddMemberDialogComponent,
  DropDownValue,
} from './add-member-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MultiComboboxSelectionChangeEvent } from '@fundamental-ngx/core';
import {
  LuigiClient,
  Member,
  MemberService,
  NotificationService,
  Role,
  User,
  UserConnection,
} from '@platform-mesh/iam-lib';
import { of, throwError } from 'rxjs';

describe('AddMemberDialogComponent', () => {
  let component: AddMemberDialogComponent;
  let memberService: MockedObject<MemberService>;
  let notificationService: MockedObject<NotificationService>;
  let luigiClient: MockedObject<LuigiClient>;
  let cdr: MockedObject<ChangeDetectorRef>;

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
    roles: [mockRoles[1]],
  } as Member;

  const mockUserConnection: UserConnection = {
    users: [mockMember],
    pageInfo: {
      totalCount: 1,
    },
  } as UserConnection;

  beforeEach(() => {
    memberService = {
      roles: vi.fn().mockReturnValue(of(mockRoles)),
      knownUsers: vi.fn().mockReturnValue(of(mockUserConnection)),
      assignRolesToUser: vi.fn().mockReturnValue(of({})),
    } as any;

    notificationService = {
      openErrorStrip: vi.fn(),
      openSuccessToast: vi.fn(),
    } as any;

    const linkManager = {
      goBack: vi.fn(),
    };

    luigiClient = {
      linkManager: vi.fn().mockReturnValue(linkManager),
    } as any;

    cdr = {
      detectChanges: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AddMemberDialogComponent,
        { provide: MemberService, useValue: memberService },
        { provide: NotificationService, useValue: notificationService },
        { provide: LuigiClient, useValue: luigiClient },
        { provide: ChangeDetectorRef, useValue: cdr },
      ],
    });

    component = TestBed.inject(AddMemberDialogComponent);
  });

  describe('ngOnInit', () => {
    it('should initialize roles and set default role', async () => {
      await component.ngOnInit();

      expect(memberService.roles).toHaveBeenCalled();
      expect(component.availableRoles).toEqual(mockRoles);
      expect(component.defaultRole?.id).toBe('member');
    });

    it('should setup search input debounce', async () => {
      await component.ngOnInit();
      vi.spyOn(component, 'filter');

      component.searchInput.next('test');

      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(component.filter).toHaveBeenCalledWith('test');
    });
  });

  describe('onRoleChange', () => {
    it('should update member roles when roles selected', () => {
      const potentialMember: Member = {
        user: mockUser,
        roles: [mockRoles[1]],
      } as Member;
      const event = {
        selectedItems: [mockRoles[0], mockRoles[2]],
        source: { setValue: vi.fn() },
      } as unknown as MultiComboboxSelectionChangeEvent;

      component.onRoleChange(event, potentialMember);

      expect(potentialMember.roles).toEqual([mockRoles[0], mockRoles[2]]);
    });

    it('should show error and reset when no roles selected', () => {
      const potentialMember: Member = {
        user: mockUser,
        roles: [mockRoles[1]],
      } as Member;
      const event = {
        selectedItems: [],
        source: { setValue: vi.fn() },
      } as unknown as MultiComboboxSelectionChangeEvent;

      component.onRoleChange(event, potentialMember);

      expect(notificationService.openErrorStrip).toHaveBeenCalled();
      expect(event.source.setValue).toHaveBeenCalledWith([mockRoles[1]]);
    });
  });

  describe('addMembers', () => {
    it('should add members successfully', async () => {
      await component.ngOnInit();
      component.selectedMembers = [mockMember];

      component.addMembers();

      expect(component.touched).toBe(true);
      expect(memberService.assignRolesToUser).toHaveBeenCalledWith({
        changes: [
          { roles: mockMember.roles.map((r) => r.id), userId: mockUser.userId },
        ],
        invites: [],
      });
    });

    it('should add invitees successfully', async () => {
      await component.ngOnInit();
      const invitee: Member = {
        user: { email: 'invitee@example.com', userId: '' } as User,
        roles: [mockRoles[1]],
      } as Member;
      component.selectedInvitees = [invitee];

      component.addMembers();

      expect(memberService.assignRolesToUser).toHaveBeenCalledWith({
        changes: [],
        invites: [
          { roles: invitee.roles.map((r) => r.id), email: invitee.user.email },
        ],
      });
    });

    it('should add both members and invitees', async () => {
      await component.ngOnInit();
      const invitee: Member = {
        user: { email: 'invitee@example.com', userId: '' } as User,
        roles: [mockRoles[1]],
      } as Member;
      component.selectedMembers = [mockMember, mockMember];
      component.selectedInvitees = [invitee];

      component.addMembers();

      expect(memberService.assignRolesToUser).toHaveBeenCalledTimes(1);
    });

    it('should not add when no members selected', () => {
      component.selectedMembers = [];
      component.selectedInvitees = [];

      component.addMembers();

      expect(component.touched).toBe(true);
      expect(memberService.assignRolesToUser).not.toHaveBeenCalled();
    });

    it('should close dialog with success on successful addition', async () => {
      await component.ngOnInit();
      component.selectedMembers = [mockMember];
      const linkManager = luigiClient.linkManager();

      component.addMembers();

      expect(linkManager.goBack).toHaveBeenCalled();
    });

    it('should close dialog with error on failure', async () => {
      await component.ngOnInit();
      memberService.assignRolesToUser.mockReturnValue(
        throwError(() => new Error('Add failed')),
      );
      component.selectedMembers = [mockMember];
      const linkManager = luigiClient.linkManager();

      component.addMembers();

      expect(linkManager.goBack).toHaveBeenCalledWith({
        error: expect.stringContaining('Add failed'),
      });
    });

    it('should close dialog with error when no members added', async () => {
      await component.ngOnInit();
      memberService.assignRolesToUser.mockReturnValue(of(undefined));
      component.selectedMembers = [mockMember];
      const linkManager = luigiClient.linkManager();

      component.addMembers();

      expect(linkManager.goBack).toHaveBeenCalledWith({ error: undefined });
    });
  });

  describe('deleteMemberFromList', () => {
    it('should delete member from list', () => {
      component.selectedMembers = [mockMember];

      component.deleteMemberFromList('user-123');

      expect(component.selectedMembers).toHaveLength(0);
    });

    it('should not delete when userId is undefined', () => {
      component.selectedMembers = [mockMember];

      component.deleteMemberFromList(undefined);

      expect(component.selectedMembers).toHaveLength(1);
    });

    it('should not delete when member not found', () => {
      component.selectedMembers = [mockMember];

      component.deleteMemberFromList('non-existent');

      expect(component.selectedMembers).toHaveLength(1);
    });
  });

  describe('deleteInviteeFromList', () => {
    it('should delete invitee from list', () => {
      const invitee: Member = {
        user: { email: 'test@example.com', userId: '' } as User,
        roles: [],
      } as Member;
      component.selectedInvitees = [invitee];

      component.deleteInviteeFromList('test@example.com');

      expect(component.selectedInvitees).toHaveLength(0);
    });

    it('should not delete when email is undefined', () => {
      const invitee: Member = {
        user: { email: 'test@example.com', userId: '' } as User,
        roles: [],
      } as Member;
      component.selectedInvitees = [invitee];

      component.deleteInviteeFromList(undefined);

      expect(component.selectedInvitees).toHaveLength(1);
    });

    it('should not delete when invitee not found', () => {
      const invitee: Member = {
        user: { email: 'test@example.com', userId: '' } as User,
        roles: [],
      } as Member;
      component.selectedInvitees = [invitee];

      component.deleteInviteeFromList('other@example.com');

      expect(component.selectedInvitees).toHaveLength(1);
    });
  });

  describe('inputChange', () => {
    it('should update search input with lowercase', () => {
      vi.spyOn(component.searchInput, 'next');

      component.inputChange('TEST Search');

      expect(component.searchInput.next).toHaveBeenCalledWith('test search');
    });

    it('should handle empty search term', () => {
      vi.spyOn(component.searchInput, 'next');

      component.inputChange('');

      expect(component.searchInput.next).toHaveBeenCalledWith('');
    });
  });

  describe('filter', () => {
    it('should clear dropdown when search term is empty', () => {
      component.filter('');

      expect(component.dropDownValues).toEqual([]);
      expect(component.filteredUsersCollectionLength).toBe(0);
      expect(cdr.detectChanges).toHaveBeenCalled();
    });

    it('should filter users by search term', () => {
      component.filter('test');

      expect(memberService.knownUsers).toHaveBeenCalled();
      expect(component.dropDownValues).toHaveLength(1);
      expect(component.dropDownValues[0]).toEqual({ user: mockUser });
    });

    it('should show email option when email not found', () => {
      memberService.knownUsers.mockReturnValue(
        of({
          users: [],
          ownersCount: 0,
          pageInfo: { totalCount: 0 },
        } as UserConnection),
      );

      component.filter('new@example.com');

      expect(component.dropDownValues).toEqual([{ email: 'new@example.com' }]);
    });

    it('should show email match when exact email found', () => {
      component.filter('test@example.com');

      expect(component.dropDownValues[0]).toEqual({ user: mockUser });
    });

    it('should show no data message for non-email without matches', () => {
      memberService.knownUsers.mockReturnValue(
        of({
          users: [],
          ownersCount: 0,
          pageInfo: { totalCount: 0 },
        } as UserConnection),
      );

      component.filter('nonexistent');

      expect(component.dropDownValues).toEqual([{ noData: true }]);
    });
  });

  describe('isEmail', () => {
    it('should validate correct email', () => {
      expect(component.isEmail('test@example.com')).toBe(true);
    });

    it('should validate email with dots in local part', () => {
      expect(component.isEmail('test.name@example.com')).toBe(true);
    });

    it('should validate email with special characters', () => {
      expect(component.isEmail('test+tag@example.com')).toBe(true);
    });

    it('should validate quoted local part', () => {
      expect(component.isEmail('"test name"@example.com')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(component.isEmail('testexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(component.isEmail('test@')).toBe(false);
    });

    it('should reject email without local part', () => {
      expect(component.isEmail('@example.com')).toBe(false);
    });

    it('should reject email with local part longer than 64 chars', () => {
      const longLocal = 'a'.repeat(65);
      expect(component.isEmail(`${longLocal}@example.com`)).toBe(false);
    });

    it('should reject email with invalid characters', () => {
      expect(component.isEmail('test name@example.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(component.isEmail('')).toBe(false);
    });

    it('should reject null', () => {
      expect(component.isEmail(null as any)).toBe(false);
    });

    it('should reject email from non-allowed domain', () => {
      component.emailDomains = ['allowed.com'];

      expect(component.isEmail('test@notallowed.com')).toBe(false);
    });

    it('should accept email from allowed domain', () => {
      component.emailDomains = ['example.com'];

      expect(component.isEmail('test@example.com')).toBe(true);
    });

    it('should accept any domain when emailDomains is empty', () => {
      component.emailDomains = [];

      expect(component.isEmail('test@anydomain.com')).toBe(true);
    });
  });

  describe('fakeFilterFunc', () => {
    it('should return content unchanged', () => {
      const users = [mockUser];

      const result = component.fakeFilterFunc(users);

      expect(result).toBe(users);
    });
  });

  describe('displayFunc', () => {
    it('should display full name when available', () => {
      const result = component.displayFunc(mockUser);

      expect(result).toBe('John Doe');
    });

    it('should display userId when name not available', () => {
      const userWithoutName: User = {
        userId: 'user-456',
        email: 'test@example.com',
      } as User;

      const result = component.displayFunc(userWithoutName);

      expect(result).toBe('user-456');
    });

    it('should return empty string when user is null', () => {
      const result = component.displayFunc(null as any);

      expect(result).toBe('');
    });

    it('should return empty string when user is undefined', () => {
      const result = component.displayFunc(undefined as any);

      expect(result).toBe('');
    });
  });

  describe('itemClicked', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('should add invitee when email clicked', () => {
      const emailValue: DropDownValue = { email: 'new@example.com' };

      component.itemClicked(emailValue);

      expect(component.selectedInvitees).toHaveLength(1);
      expect(component.selectedInvitees[0].user.email).toBe('new@example.com');
      expect(component.selectedInvitees[0].roles).toEqual([mockRoles[1]]);
    });

    it('should not add duplicate invitee', () => {
      const emailValue: DropDownValue = { email: 'new@example.com' };
      component.selectedInvitees = [
        {
          user: { email: 'new@example.com', userId: '' } as User,
          roles: [],
        } as Member,
      ];

      component.itemClicked(emailValue);

      expect(component.selectedInvitees).toHaveLength(1);
    });

    it('should add member when user clicked', () => {
      const userValue: DropDownValue = { user: mockUser };

      component.itemClicked(userValue);

      expect(component.selectedMembers).toHaveLength(1);
      expect(component.selectedMembers[0].user).toBe(mockUser);
      expect(component.selectedMembers[0].roles).toEqual([mockRoles[1]]);
    });

    it('should not add duplicate member', () => {
      const userValue: DropDownValue = { user: mockUser };
      component.selectedMembers = [mockMember];

      component.itemClicked(userValue);

      expect(component.selectedMembers).toHaveLength(1);
    });

    it('should clear search after item clicked', () => {
      vi.spyOn(component, 'clearSearch');
      const userValue: DropDownValue = { user: mockUser };

      component.itemClicked(userValue);

      expect(component.clearSearch).toHaveBeenCalled();
    });

    it('should handle noData value gracefully', () => {
      const noDataValue: DropDownValue = { noData: true };

      component.itemClicked(noDataValue);

      expect(component.selectedMembers).toHaveLength(0);
      expect(component.selectedInvitees).toHaveLength(0);
    });
  });

  describe('clearSearch', () => {
    it('should clear search input and dropdown', () => {
      vi.spyOn(component, 'filter');
      component.currentInput = 'test';

      component.clearSearch();

      expect(component.filter).toHaveBeenCalledWith('');
      expect(component.currentInput).toBe('');
    });
  });

  describe('closeDialogError', () => {
    it('should close dialog with error reason', () => {
      const linkManager = luigiClient.linkManager();

      component.closeDialogError('Test error');

      expect(linkManager.goBack).toHaveBeenCalledWith({ error: 'Test error' });
    });

    it('should close dialog without error reason', () => {
      const linkManager = luigiClient.linkManager();

      component.closeDialogError();

      expect(linkManager.goBack).toHaveBeenCalledWith({ error: undefined });
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', () => {
      const unsubscribeSpy = vi.spyOn(
        component['subscriptions'],
        'unsubscribe',
      );

      component.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('hasError', () => {
    it('should return true when no members selected and touched', () => {
      component.selectedMembers = [];
      component.selectedInvitees = [];
      component.touched = true;

      expect(component.hasError()).toBe(true);
    });

    it('should return false when members selected', () => {
      component.selectedMembers = [mockMember];
      component.selectedInvitees = [];
      component.touched = true;

      expect(component.hasError()).toBe(false);
    });

    it('should return false when invitees selected', () => {
      component.selectedMembers = [];
      component.selectedInvitees = [mockMember];
      component.touched = true;

      expect(component.hasError()).toBe(false);
    });

    it('should return false when not touched', () => {
      component.selectedMembers = [];
      component.selectedInvitees = [];
      component.touched = false;

      expect(component.hasError()).toBe(false);
    });
  });

  describe('showByline', () => {
    it('should return false when dropdown has email value', () => {
      component.dropDownValues = [{ email: 'test@example.com' }];

      expect(component.showByline).toBe(false);
    });

    it('should return true when dropdown has user value', () => {
      component.dropDownValues = [{ user: mockUser }];

      expect(component.showByline).toBe(true);
    });

    it('should return true when dropdown has noData value', () => {
      component.dropDownValues = [{ noData: true }];

      expect(component.showByline).toBe(true);
    });

    it('should return true when dropdown is empty', () => {
      component.dropDownValues = [];

      expect(component.showByline).toBe(true);
    });
  });
});
