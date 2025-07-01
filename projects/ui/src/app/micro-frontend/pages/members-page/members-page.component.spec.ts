import { ConfirmationMessagesService } from '../../services/confirmation-messages/confirmation-messages.service';
import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from '../../services/notification/confirmation.service';
import { MembersPageComponent, UIRole } from './members-page.component';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  ClaimProjectService,
  DxpContext,
  DxpIContextMessage,
  DxpLuigiContextService,
  GrantedUsers,
  LuigiClient,
  Member,
  MemberService,
  NotificationService,
  Role,
  User,
} from '@dxp/iam-lib';
import { MultiComboboxSelectionChangeEvent } from '@fundamental-ngx/core';
import { LinkManager } from '@luigi-project/client';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { Subject, Subscription, of, throwError } from 'rxjs';

const roleOwner: UIRole = {
  id: 'owner',
  label: 'Owner',
  technicalName: 'owner',
  displayName: 'Owner',
};
const roleMember: UIRole = {
  id: 'member',
  label: 'Member',
  technicalName: 'member',
  displayName: 'Member',
};

const allAvailableRoles = [roleOwner, roleMember];

const mockMemberOwner: Member = {
  user: {
    userId: 'userIdOwner',
    email: 'owner@sap.com',
    firstName: 'ownerFirstName',
    lastName: 'ownerLastName',
  },
  roles: [roleOwner],
};

const mockMemberUser: Member = {
  user: {
    userId: 'userIdMember',
    email: 'member@sap.com',
    firstName: 'memberFirstName',
    lastName: 'memberLastName',
  },
  roles: [roleMember],
};

const mockTwoMemberOwners: Member[] = [mockMemberOwner, mockMemberOwner];
const mockOneMemberOwner: Member[] = [mockMemberOwner];

const { location } = window;

const mockScopeDisplayName = 'Display Name';

const confirmationServiceMock = mock<ConfirmationService>({
  showRemoveMemberDialog: jest.fn(),
  showLeaveScopeDialog: jest.fn(),
});

describe('MembersPageComponent', () => {
  let component: MembersPageComponent;
  let fixture: ComponentFixture<MembersPageComponent>;

  let memberService: MemberService;
  let notificationService: NotificationService;
  let luigiClient: LuigiClient;
  let claimProjectService: ClaimProjectService;

  let usersOfEntitySubject: Subject<GrantedUsers>;
  let mockLeaveEntitySubject: Subject<void>;
  let mockRemoveMemberResult: Subject<boolean>;
  let userIsOwnerSubject: Subject<boolean>;
  let luigiContextSubject: Subject<DxpIContextMessage>;

  beforeEach(() => {
    usersOfEntitySubject = new Subject<GrantedUsers>();
    mockLeaveEntitySubject = new Subject<void>();
    mockRemoveMemberResult = new Subject<boolean>();
    userIsOwnerSubject = new Subject<boolean>();
    luigiContextSubject = new Subject();

    void TestBed.configureTestingModule({
      providers: [
        MockProvider(MemberService, {
          usersOfEntity: jest.fn().mockReturnValue(usersOfEntitySubject),
          removeFromEntity: jest.fn().mockReturnValue(mockRemoveMemberResult),
          leaveEntity: jest.fn().mockReturnValue(mockLeaveEntitySubject),
          currentEntity: jest.fn().mockReturnValue(of('project')),
          navigateToList: jest.fn(),
          addMembersWithFga: jest.fn(),
          getAvailableRolesForEntityType: jest
            .fn()
            .mockReturnValue(of(allAvailableRoles)),
          setMemberRoles: jest.fn().mockReturnValue(of([])),
        }),
        MockProvider(NotificationService, {
          openSuccessToast: jest.fn(),
          openErrorStrip: jest.fn(),
        }),
        MockProvider(DxpLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        MockProvider(ConfirmationMessagesService),
        MockProvider(LuigiClient, {
          linkManager: jest.fn().mockReturnValue({
            fromParent: jest.fn().mockReturnValue(
              mock<LinkManager>({
                openAsModal: jest.fn(),
              }),
            ),
          }),
        }),
        MockProvider(ClaimProjectService),
      ],
      imports: [MembersPageComponent],
    })
      .overrideProvider(ConfirmationService, {
        useValue: confirmationServiceMock,
      })
      .compileComponents();

    jest.spyOn(window, 'open').mockImplementation();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
    Subscription.prototype.unsubscribe = jest.fn();

    memberService = TestBed.inject(MemberService);
    notificationService = TestBed.inject(NotificationService);
    luigiClient = TestBed.inject(LuigiClient);
    claimProjectService = TestBed.inject(ClaimProjectService);

    fixture = TestBed.createComponent(MembersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    window.location.href = location.href;
  });

  it('should initialize correctly', fakeAsync(() => {
    const totalCount = 1;
    const ownerCount = 1;
    usersOfEntitySubject.next(
      mock<GrantedUsers>({
        users: [],
        pageInfo: {
          ownerCount,
          totalCount,
        },
      }),
    );

    userIsOwnerSubject.next(true);

    tick();
    expect(component.members).toBeDefined();
    expect(component.currentUserIsOwner).toBeTruthy();
    expect(component.countOwners).toEqual(1);
    expect(component.rolesForEntity).toEqual(allAvailableRoles);
    expect(component.scopeDisplayName).toBeDefined();
    expect(memberService.usersOfEntity).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      showInvitees: true,
      roles: [],
      searchTerm: '',
      sortBy: {
        direction: 'asc',
        field: 'user',
      },
    });
  }));

  it('should open remove member dialog', fakeAsync(() => {
    confirmationServiceMock.showRemoveMemberDialog.mockReturnValue(
      Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
    );

    component.openRemoveMemberDialog(mockMemberUser);
    tick();
    mockRemoveMemberResult.next(true);

    expect(confirmationServiceMock.showRemoveMemberDialog).toHaveBeenCalledWith(
      mockMemberUser.user,
      mockScopeDisplayName,
    );
    expect(memberService.removeFromEntity).toHaveBeenCalledWith(
      mockMemberUser.user,
    );
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      `${mockMemberUser.user.firstName} ${mockMemberUser.user.lastName} was removed from the project.`,
    );
    expect(memberService.usersOfEntity).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      showInvitees: true,
      roles: [],
      searchTerm: '',
      sortBy: {
        direction: 'asc',
        field: 'user',
      },
    });
  }));

  it('should save member roles', fakeAsync(() => {
    const changeEvent = mock<MultiComboboxSelectionChangeEvent>({
      selectedItems: [{ displayName: 'foo' }],
    });
    const member = {
      user: {} as User,
      roles: [{ displayName: 'bar' }, { displayName: 'baz' }],
    } as Member;

    component.readMembers = jest.fn();
    component.saveMember(changeEvent, member);
    tick();

    expect(memberService.setMemberRoles).toHaveBeenCalledWith(
      member.user,
      changeEvent.selectedItems,
      false,
    );
    expect(component.readMembers).toHaveBeenCalled();
    expect(notificationService.openSuccessToast).toHaveBeenCalled();
  }));

  it('should show error if member role save failed', fakeAsync(() => {
    const changeEvent = mock<MultiComboboxSelectionChangeEvent>({
      selectedItems: [mock()],
    });
    const member = {
      user: {} as User,
      roles: [{ displayName: 'bar' }, { displayName: 'baz' }],
    } as Member;

    component.readMembers = jest.fn();
    memberService.setMemberRoles = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('test')));
    component.saveMember(changeEvent, member);
    tick();

    expect(component.readMembers).toHaveBeenCalled();
    expect(notificationService.openErrorStrip).toHaveBeenCalled();
  }));

  it('should open leave project dialog', fakeAsync(() => {
    confirmationServiceMock.showLeaveScopeDialog.mockReturnValue(
      Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
    );

    component.openLeaveDialog();
    tick();
    mockLeaveEntitySubject.next();

    expect(confirmationServiceMock.showLeaveScopeDialog).toHaveBeenCalledWith(
      mockScopeDisplayName,
    );
    expect(memberService.leaveEntity).toHaveBeenCalled();
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'You have left the project Display Name.',
    );
    expect(memberService.navigateToList).toHaveBeenCalledWith();
  }));

  describe('when getUserNameOrId is called', () => {
    describe.each([
      {
        firstName: 'Jonathan',
        lastName: 'Davis',
        isCurrentUser: true,
        expected: 'Jonathan Davis (You)',
      },
      {
        firstName: 'Jonathan',
        lastName: 'Davis',
        isCurrentUser: false,
        expected: 'Jonathan Davis',
      },
    ])(
      'with user is current user=$isCurrentUser',
      ({ firstName, lastName, isCurrentUser, expected }) => {
        const mockMember: Member = {
          user: {
            firstName: firstName,
            lastName: lastName,
          },
          roles: [],
        };

        it(`should return ${expected.toString()}`, () => {
          component['currentUserId'] = isCurrentUser
            ? mockMember.user.userId
            : mockMemberOwner.user.userId;

          const displayName = component.getUserNameOrId(mockMember);

          expect(displayName).toEqual(expected);
        });
      },
    );
  });

  const rolesTechnicalNames = (roles: Role[]) =>
    roles.flatMap((r) => r.technicalName).join();
  describe.each([
    {
      members: mockTwoMemberOwners,
      isUserOwner: false,
      expected: false,
      countOwners: 2,
    },
    {
      members: mockTwoMemberOwners,
      isUserOwner: true,
      expected: false,
      countOwners: 2,
    },
    {
      members: mockOneMemberOwner,
      isUserOwner: false,
      expected: false,
      countOwners: 1,
    },
    {
      members: mockOneMemberOwner,
      isUserOwner: true,
      expected: true,
      countOwners: 1,
    },
  ])(
    `when isCurrentUserUniqueOwner is called`,
    ({ members, isUserOwner, countOwners, expected }) => {
      it(`should return ${expected.toString()} when having roles (${rolesTechnicalNames(
        allAvailableRoles,
      )}) and current user is owner = ${isUserOwner.toString()} `, fakeAsync(() => {
        usersOfEntitySubject.next({
          users: members,
          pageInfo: { totalCount: members.length, ownerCount: 1 },
        });
        userIsOwnerSubject.next(isUserOwner);
        component.countOwners = countOwners;

        const isCurrentUserUniqueOwner = component.isCurrentUserUniqueOwner();

        expect(isCurrentUserUniqueOwner).toEqual(expected);
      }));
    },
  );

  it('should check current  user', fakeAsync(() => {
    luigiContextSubject.next(
      mock<DxpIContextMessage>({
        context: mock<DxpContext>({
          userid: mockMemberUser.user.userId,
        }),
      }),
    );

    expect(component.equalsCurrentUser(mockMemberUser)).toBeTruthy();
    expect(component.equalsCurrentUser(mockMemberOwner)).toBeFalsy();
  }));

  it('should email user via teams correctly', () => {
    component.emailUser(mockMemberUser.user);

    expect(window.location.href).toBe('mailto:member@sap.com');
  });

  it('should call user via teams correctly', () => {
    component.callUserViaTeams(mockMemberUser.user);

    expect(window.open).toHaveBeenCalledWith(
      'msteams:/l/call/0/0?users=member@sap.com&withVideo=false',
      '_blank',
    );
  });

  it('should chat with user via teams correctly', () => {
    component.chatWithUserViaTeams(mockMemberUser.user);

    expect(window.open).toHaveBeenCalledWith(
      'msteams:/l/chat/0/0?users=member@sap.com',
      '_blank',
    );
  });

  it('should show a toast after closing dialog with SUCCESS', fakeAsync(() => {
    const addedMembers = [mock<User>({ firstName: 'blob', lastName: 'blob2' })];
    component.openAddMembersDialog();

    luigiContextSubject.next(
      mock<DxpIContextMessage>({
        context: mock<DxpContext>({
          goBackContext: {
            addedMembers,
            error: undefined,
          },
        }),
      }),
    );
    tick();
    expect(
      luigiClient.linkManager().fromParent().openAsModal,
    ).toHaveBeenCalledWith('add-members', {
      height: '40rem',
      title: 'Add Members',
      width: '60rem',
    });
    expect(notificationService.openSuccessToast).toHaveBeenCalledWith(
      'blob blob2 has been added to the project.',
    );
    expect(memberService.usersOfEntity).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      showInvitees: true,
      roles: [],
      searchTerm: '',
      sortBy: {
        direction: 'asc',
        field: 'user',
      },
    });
  }));

  it('should show a toast after closing dialog with ERROR', fakeAsync(() => {
    const error = 'error';
    component.openAddMembersDialog();

    luigiContextSubject.next(
      mock<DxpIContextMessage>({
        context: mock<DxpContext>({
          goBackContext: {
            error,
          },
        }),
      }),
    );
    tick();

    expect(
      luigiClient.linkManager().fromParent().openAsModal,
    ).toHaveBeenCalled();
    expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
      `Could not add new members. Reason: ${error}`,
    );
  }));

  it('should claim project', fakeAsync(() => {
    claimProjectService.claimProject = jest.fn();
    component.claimProject();
    expect(claimProjectService.claimProject).toHaveBeenCalled();
  }));

  describe('noFiltersApplied method', () => {
    it('should return true when no roles are selected and no search term', () => {
      component.selectedFilterRoles = [];
      component.searchTerm = '';

      expect(component.noFiltersApplied()).toBeTruthy();
    });

    it('should return false when roles are selected', () => {
      component.selectedFilterRoles = [roleMember];
      component.searchTerm = '';

      expect(component.noFiltersApplied()).toBeFalsy();
    });

    it('should return false when search term is present', () => {
      component.selectedFilterRoles = [];
      component.searchTerm = 'test';

      expect(component.noFiltersApplied()).toBeFalsy();
    });

    it('should return false when both roles are selected and search term is present', () => {
      component.selectedFilterRoles = [roleMember, roleOwner];
      component.searchTerm = 'test';

      expect(component.noFiltersApplied()).toBeFalsy();
    });
  });
});
