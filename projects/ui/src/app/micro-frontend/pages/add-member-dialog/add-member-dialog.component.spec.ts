import {
  AddMemberDialogComponent,
  DropDownValue,
} from './add-member-dialog.component';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  LuigiClient,
  LuigiDialogUtil,
  Member,
  MemberService,
  Role,
  SearchService,
  SuggestedUser,
  SuggestedUserResponse,
  TenantInfoService,
  User,
  UserService,
} from '@platform-mesh/iam-lib';
import { MockProvider } from 'ng-mocks';
import { Subject, Subscription, of } from 'rxjs';

describe('AddMemberDialogComponent', () => {
  let component: AddMemberDialogComponent;
  let fixture: ComponentFixture<AddMemberDialogComponent>;

  let mockAddMembersToProject: Subject<Member[]>;
  let mockGetAvailableRoles: Subject<Role[]>;
  let mockGetUsers: Subject<User[]>;
  let mockMembersService: Partial<MemberService>;
  let mockLuigiClient: Partial<LuigiClient>;

  const mockUserA: SuggestedUser = {
    id: 'tenantID/userAId',
    userId: 'userAId',
    email: 'hundekuchen@sap.com',
    firstName: 'userAFirstName',
    lastName: 'userALastName',
  };
  const mockUserB: SuggestedUser = {
    id: 'tenantID/userBId',
    userId: 'userBId',
    email: 'email@sap.com',
    firstName: 'userBFirstName',
    lastName: 'userBLastName',
  };
  const mockSuggestedUserResponse: SuggestedUserResponse = {
    docs: [mockUserA, mockUserB],
    numFound: 2,
    responseSize: 2,
    status: 0,
  };

  const defaultRole = { displayName: 'Member', technicalName: 'member' };
  const ownerRole = { displayName: 'Owner', technicalName: 'owner' };
  const allAvailableRoles = [defaultRole, ownerRole];

  const mockMembersA: Member = { user: mockUserA, roles: [defaultRole] };
  const mockMembersB: Member = { user: mockUserB, roles: [defaultRole] };

  beforeEach(() => {
    mockAddMembersToProject = new Subject<Member[]>();
    mockGetAvailableRoles = new Subject<Role[]>();
    mockGetUsers = new Subject<User[]>();
    mockMembersService = {
      addMembersWithFga: jest.fn().mockReturnValue(mockAddMembersToProject),
      currentEntity: jest.fn().mockReturnValue(of('project')),
      getAvailableRolesForEntityType: jest
        .fn()
        .mockReturnValue(mockGetAvailableRoles),
    };
    mockLuigiClient = {
      linkManager: jest.fn().mockReturnValue({
        goBack: jest.fn(),
      }),
    };

    void TestBed.configureTestingModule({
      providers: [
        MockProvider(LuigiClient, mockLuigiClient),
        MockProvider(LuigiDialogUtil, {
          manageLuigiBackdrops: jest.fn(),
        }),
        MockProvider(UserService, {
          getUsers: jest.fn().mockReturnValue(mockGetUsers),
        }),
        MockProvider(SearchService, {
          getSuggestedUsersForAccountWithFga: jest
            .fn()
            .mockReturnValue(of(mockSuggestedUserResponse)),
        }),
        MockProvider(MemberService, mockMembersService),
        MockProvider(TenantInfoService, {
          tenantInfo: jest
            .fn()
            .mockReturnValue(
              of({ emailDomains: ['sap.com', 'global.corp.sap'] }),
            ),
        }),
      ],
      imports: [AddMemberDialogComponent],
    }).compileComponents();
    Subscription.prototype.unsubscribe = jest.fn();
    fixture = TestBed.createComponent(AddMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    mockGetAvailableRoles.next(allAvailableRoles);
  });

  describe('when roles are emitted', () => {
    it('should initialize availableRoles and defaultRole is member', () => {
      mockGetAvailableRoles.next(allAvailableRoles);

      expect(component.availableRoles).toEqual(allAvailableRoles);
      expect(component.defaultRole).toEqual(defaultRole);
    });
  });

  describe('when addMembers is called', () => {
    describe('and addMembersToProject succeed', () => {
      it('should add expected members and close dialog with added userId', fakeAsync(() => {
        component.selectedMembers = [mockMembersA];

        component.addMembers();
        mockAddMembersToProject.next([mockMembersA]);
        tick();

        expect(mockMembersService.addMembersWithFga).toHaveBeenCalledWith([
          mockMembersA,
        ]);
        expect(mockLuigiClient.linkManager!().goBack).toHaveBeenCalledWith({
          addedMembers: [mockUserA],
        });
      }));

      it('should not close dialog if no members were added', () => {
        component.selectedMembers = [];

        component.addMembers();

        expect(mockMembersService.addMembersWithFga).toHaveBeenCalledTimes(0);
        expect(component.touched).toEqual(true);
      });

      describe('and addMembersToProject fails', () => {
        it('should call dialog dismiss with "error"', fakeAsync(() => {
          component.selectedMembers = [mockMembersA];
          component.addMembers();
          mockAddMembersToProject.error(new Error('ups'));
          tick();

          expect(mockLuigiClient.linkManager!().goBack).toHaveBeenCalledWith({
            error: 'Error: ups',
          });
        }));
      });
    });
  });

  describe('when deleteMemberFromList is called', () => {
    it.each([
      [[mockMembersA], mockUserA.userId, []],
      [[mockMembersA], mockUserB.userId, [mockMembersA]],
      [[mockMembersA, mockMembersB], mockUserB.userId, [mockMembersA]],
    ])(
      'removes users from selectedMembers for passed userId',
      (
        selectedMembers: Member[],
        userIdToDelete: string,
        expectedMembers: Member[],
      ) => {
        component.selectedMembers = selectedMembers;

        component.deleteMemberFromList(userIdToDelete);

        expect(component.selectedMembers).toEqual(expectedMembers);
      },
    );
  });

  describe('when deleteInviteeFromList is called', () => {
    it.each([
      [[mockMembersA], mockUserA.email, []],
      [[mockMembersA], mockUserB.email, [mockMembersA]],
      [[mockMembersA, mockMembersB], mockUserB.email, [mockMembersA]],
    ])(
      'removes users from selectedInvitees for passed email',
      (
        selectedInvitees: Member[],
        emailToDelete: string,
        expectedSelectedInvitees: Member[],
      ) => {
        component.selectedInvitees = selectedInvitees;

        component.deleteInviteeFromList(emailToDelete);

        expect(component.selectedInvitees).toEqual(expectedSelectedInvitees);
      },
    );
  });

  describe('when filterUsers is called', () => {
    it.each([
      [mockUserA.email, [{ user: mockUserA }], 1],
      [mockUserB.email, [{ user: mockUserB }], 1],
      ['unknown.user@sap.com', [{ email: 'unknown.user@sap.com' }], 0],
      ['non-email search term', [{ user: mockUserA }, { user: mockUserB }], 2],
    ])(
      'set dropDownValues and the length with users fulfilling the search term',
      (
        searchTerm: string,
        expectedDropDownValues: DropDownValue[],
        expectedUsersCollectionLength: number,
      ) => {
        component.filter(searchTerm);

        expect(component.dropDownValues).toEqual(expectedDropDownValues);
        expect(component.filteredUsersCollectionLength).toEqual(
          expectedUsersCollectionLength,
        );
      },
    );
  });

  describe('when itemClicked is called', () => {
    it.each([
      {
        selectedMembers: [],
        selectedInvitees: [],
        value: { user: mockUserA },
        expectedSelectedMembers: [mockMembersA],
        expectedSelectedInvitees: [],
      },
      {
        selectedMembers: [mockMembersA],
        selectedInvitees: [],
        value: { user: mockUserA } as DropDownValue,
        expectedSelectedMembers: [mockMembersA],
        expectedSelectedInvitees: [],
      },
      {
        selectedMembers: [mockMembersA],
        selectedInvitees: [],
        value: { user: mockUserB },
        expectedSelectedMembers: [mockMembersA, mockMembersB],
        expectedSelectedInvitees: [],
      },
      {
        selectedMembers: [mockMembersA],
        selectedInvitees: [],
        value: { noData: true },
        expectedSelectedMembers: [mockMembersA],
        expectedSelectedInvitees: [],
      },
      {
        selectedMembers: [mockMembersA],
        selectedInvitees: [],
        value: { email: 'new-email@sap.com' },
        expectedSelectedMembers: [mockMembersA],
        expectedSelectedInvitees: [
          {
            user: { email: 'new-email@sap.com', userId: '' },
            roles: [defaultRole],
          },
        ],
      },
    ])(
      'add users to selectedMembers or selectedInvitees for a provided user',
      ({
        selectedMembers,
        selectedInvitees,
        value,
        expectedSelectedMembers,
        expectedSelectedInvitees,
      }) => {
        mockGetAvailableRoles.next(allAvailableRoles);

        component.selectedMembers = selectedMembers;
        component.selectedInvitees = selectedInvitees;

        component.itemClicked(value as DropDownValue);

        expect(component.selectedMembers).toEqual(expectedSelectedMembers);
        expect(component.selectedInvitees).toEqual(expectedSelectedInvitees);
      },
    );
  });

  describe('isEmail', () => {
    beforeEach(() => {
      component.emailDomains = ['sap.com', 'global.corp.sap'];
    });

    it('should return true for valid unquoted local-part emails', () => {
      expect(component.isEmail('john.doe@sap.com')).toBe(true);
      expect(
        component.isEmail('user+mailbox/department=shipping@sap.com'),
      ).toBe(true);
      expect(component.isEmail("a!#$%&'*+-/=?^_`{|}~@sap.com")).toBe(true);
      expect(component.isEmail('a.b.c.d.e@sap.com')).toBe(true);
    });

    it('should return false for unquoted local-part with consecutive dots', () => {
      expect(component.isEmail('john..doe@sap.com')).toBe(false);
    });

    it('should return false for unquoted local-part starting or ending with dot', () => {
      expect(component.isEmail('.johndoe@sap.com')).toBe(false);
      expect(component.isEmail('johndoe.@sap.com')).toBe(false);
    });

    it('should return true for quoted local-part with special chars and dots', () => {
      expect(component.isEmail('".John..Doe."@sap.com')).toBe(true);
      expect(component.isEmail('"John Doe"@sap.com')).toBe(true);
      expect(component.isEmail('"John\tDoe"@sap.com')).toBe(true);
    });

    it('should return false for missing @ or domain', () => {
      expect(component.isEmail('johndoe')).toBe(false);
      expect(component.isEmail('johndoe@')).toBe(false);
      expect(component.isEmail('@sap.com')).toBe(false);
    });

    it('should return false for local-part exceeding 64 chars', () => {
      const longLocal = 'a'.repeat(65) + '@sap.com';
      expect(component.isEmail(longLocal)).toBe(false);
    });

    it('should return false for disallowed domain', () => {
      expect(component.isEmail('john.doe@notallowed.com')).toBe(false);
    });

    it('should return false for invalid unquoted local-part chars', () => {
      expect(component.isEmail('john(doe)@sap.com')).toBe(false);
      expect(component.isEmail('john<doe>@sap.com')).toBe(false);
      expect(component.isEmail('john,doe@sap.com')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(component.isEmail('')).toBe(false);
    });
  });
});
