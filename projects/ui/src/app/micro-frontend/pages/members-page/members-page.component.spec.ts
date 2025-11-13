import { ConfirmationMessagesService } from '../../services/confirmation-messages/confirmation-messages.service';
import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from '../../services/notification/confirmation.service';
import { MembersPageComponent, UIRole } from './members-page.component';
import {
  ERROR_MUST_HAVE_AT_LEAST_ONE_OWNER,
  ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE,
} from './string-variables';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { MultiComboboxSelectionChangeEvent } from '@fundamental-ngx/core';
import { TableSortChangeEvent } from '@fundamental-ngx/platform';
import { LinkManager } from '@luigi-project/client';
import {
  ClaimEntityService,
  GrantedUsers,
  IContextMessage,
  IamLuigiContextService,
  LuigiClient,
  Member,
  MemberService,
  NodeContext,
  NotificationService,
  Role,
  RoutingService,
  User,
} from '@platform-mesh/iam-lib';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { Subject, Subscription, of, throwError } from 'rxjs';

const roleOwner = {
  id: 'owner',
  label: 'Owner',
  technicalName: 'owner',
  displayName: 'Owner',
} as UIRole;
const roleMember = {
  id: 'member',
  label: 'Member',
  technicalName: 'member',
  displayName: 'Member',
} as UIRole;

const allAvailableRoles = [roleOwner, roleMember];

const mockMemberOwner = {
  user: {
    userId: 'userIdOwner',
    email: 'owner@sap.com',
    firstName: 'ownerFirstName',
    lastName: 'ownerLastName',
  },
  roles: [roleOwner],
} as Member;

const mockMemberUser = {
  user: {
    userId: 'userIdMember',
    email: 'member@sap.com',
    firstName: 'memberFirstName',
    lastName: 'memberLastName',
  },
  roles: [roleMember],
} as Member;

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
  let claimProjectService: ClaimEntityService;

  let usersOfEntitySubject: Subject<GrantedUsers | undefined>;
  let mockLeaveEntitySubject: Subject<void>;
  let mockRemoveMemberResult: Subject<boolean>;
  let userIsOwnerSubject: Subject<boolean>;
  let luigiContextSubject: Subject<IContextMessage>;

  beforeEach(() => {
    usersOfEntitySubject = new Subject<GrantedUsers | undefined>();
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
        MockProvider(IamLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        MockProvider(ConfirmationMessagesService, {
          getAddedMembersMessage: jest
            .fn()
            .mockImplementation((data: any, entity: string) => {
              const name = data?.addedMembers?.[0]
                ? `${data.addedMembers[0].firstName} ${data.addedMembers[0].lastName}`
                : '';
              return `${name} has been added to the ${entity}.`;
            }),
        }),
        MockProvider(LuigiClient, {
          linkManager: jest.fn().mockReturnValue({
            fromParent: jest.fn().mockReturnValue(
              mock<LinkManager>({
                openAsModal: jest.fn(),
              }),
            ),
          }),
        }),
        MockProvider(ClaimEntityService),
        MockProvider(RoutingService, { openLink: jest.fn() }),
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
    claimProjectService = TestBed.inject(ClaimEntityService);

    fixture = TestBed.createComponent(MembersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    luigiContextSubject.next({
      context: {
        userid: 'test-user',
        entityContext: {
          project: {
            policies: [],
            id: 'project-id',
            displayName: mockScopeDisplayName,
          },
        },
        portalContext: {
          iamClaimEntityUrl: 'http://example.com',
        },
      },
    } as any);
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

    luigiContextSubject.next({
      context: {
        entityContext: {
          project: { policies: ['iamAdmin'], id: 'id', displayName: 'dM' },
        },
        portalContext: {
          iamClaimEntityUrl: 'http://example.com',
        },
      },
    } as any);

    tick();
    expect(component.members).toBeDefined();
    expect(component.currentUserIsOwner).toBeTruthy();
    expect(component.countOwners).toEqual(1);
    expect(component.rolesForEntity()).toEqual(allAvailableRoles);
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

  describe('on openRemoveMemberDialog', () => {
    it('should open remove member dialog', fakeAsync(() => {
      confirmationServiceMock.showRemoveMemberDialog.mockReturnValue(
        Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
      );

      component.openRemoveMemberDialog(mockMemberUser);
      tick();
      mockRemoveMemberResult.next(true);

      expect(
        confirmationServiceMock.showRemoveMemberDialog,
      ).toHaveBeenCalledWith(mockMemberUser.user, mockScopeDisplayName);
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

    it('should show error notification if remove member fails', fakeAsync(() => {
      confirmationServiceMock.showRemoveMemberDialog.mockReturnValue(
        Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
      );
      memberService.removeFromEntity = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('remove error')));

      component.openRemoveMemberDialog(mockMemberUser);
      tick();

      expect(confirmationServiceMock.showRemoveMemberDialog).toHaveBeenCalled();
      expect(memberService.removeFromEntity).toHaveBeenCalledWith(
        mockMemberUser.user,
      );
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        expect.stringContaining('Could not remove user from'),
      );
    }));

    it('should show error if showRemoveMemberDialog fails', fakeAsync(() => {
      confirmationServiceMock.showRemoveMemberDialog.mockImplementationOnce(
        () => Promise.reject(new Error('error')),
      );

      component.openRemoveMemberDialog(mockMemberUser);
      tick();

      expect(confirmationServiceMock.showRemoveMemberDialog).toHaveBeenCalled();
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        expect.stringContaining('Could not remove user from '),
      );
    }));

    it('should call showRemoveMemberDialog with empty string if scopeDisplayName not defined', fakeAsync(() => {
      confirmationServiceMock.showRemoveMemberDialog.mockReturnValue(
        Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
      );
      component.scopeDisplayName = undefined;

      component.openRemoveMemberDialog(mockMemberUser);
      tick();

      expect(
        confirmationServiceMock.showRemoveMemberDialog,
      ).toHaveBeenCalledWith(mockMemberUser.user, '');
    }));
  });

  it('should update currentPage and call readMembers when newPageClicked is called', () => {
    component.readMembers = jest.fn();
    component.currentPage = 1;
    component.newPageClicked(3);

    component.newPageClicked(3);

    expect(component.currentPage).toBe(3);
    expect(component.readMembers).toHaveBeenCalled();
  });

  describe('on saveMember', () => {
    it('should not save member roles if selected roles are the same as current roles (ignoring order)', fakeAsync(() => {
      const changeEvent = {
        selectedItems: [
          { technicalName: 'member', displayName: 'Member' },
          { technicalName: 'owner', displayName: 'Owner' },
        ],
        source: { setValue: jest.fn() },
      } as unknown as MultiComboboxSelectionChangeEvent;

      const member = {
        user: {} as User,
        roles: [
          { technicalName: 'owner', displayName: 'Owner' },
          { technicalName: 'member', displayName: 'Member' },
        ],
      } as Member;
      component.readMembers = jest.fn();
      component.saveMember(changeEvent, member);
      tick();

      expect(memberService.setMemberRoles).not.toHaveBeenCalled();
      expect(component.readMembers).not.toHaveBeenCalled();
      expect(notificationService.openSuccessToast).not.toHaveBeenCalled();
    }));

    it('should show error and reset combobox if no roles are selected', fakeAsync(() => {
      const setValueMock = jest.fn();
      const changeEvent = {
        selectedItems: [],
        source: { setValue: setValueMock },
      } as unknown as MultiComboboxSelectionChangeEvent;

      const member = {
        user: {} as User,
        roles: [{ technicalName: 'owner', displayName: 'Owner' }],
      } as Member;

      component.saveMember(changeEvent, member);
      tick();

      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        expect.stringContaining(ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE),
      );
      expect(setValueMock).toHaveBeenCalledWith(member.roles);
    }));

    it('should show error and reset combobox if unique owner tries to remove owner role', fakeAsync(() => {
      const setValueMock = jest.fn();
      const changeEvent = {
        selectedItems: [{ technicalName: 'member', displayName: 'Member' }], // no 'owner'
        source: { setValue: setValueMock },
      } as unknown as MultiComboboxSelectionChangeEvent;

      const member = {
        user: { userId: 'currentUserId' } as User,
        roles: [
          { technicalName: 'owner', displayName: 'Owner' },
          { technicalName: 'member', displayName: 'Member' },
        ],
      } as Member;

      luigiContextSubject.next(
        mock<IContextMessage>({
          context: mock<NodeContext>({
            userid: 'currentUserId',
          }),
        }),
      );
      component.currentUserIsOwner = true;
      component.countOwners = 1;

      component.saveMember(changeEvent, member);
      tick();

      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        expect.stringContaining(ERROR_MUST_HAVE_AT_LEAST_ONE_OWNER),
      );
      expect(setValueMock).toHaveBeenCalledWith(member.roles);
    }));

    it('should not save member roles if lockView is true', fakeAsync(() => {
      const setValueMock = jest.fn();
      const changeEvent = {
        selectedItems: [{ technicalName: 'member', displayName: 'Member' }],
        source: { setValue: setValueMock },
      } as unknown as MultiComboboxSelectionChangeEvent;

      const member = {
        user: { userId: 'any' } as User,
        roles: [{ technicalName: 'owner', displayName: 'Owner' }],
      } as Member;

      const roleUpdate$ = new Subject<void>();
      jest
        .spyOn(memberService, 'setMemberRoles')
        .mockReturnValue(roleUpdate$.asObservable());

      component.saveMember(changeEvent, member);

      component.saveMember(changeEvent, member);

      expect(memberService.setMemberRoles).toHaveBeenCalledTimes(1);
      expect(setValueMock).not.toHaveBeenCalled();

      roleUpdate$.next();
      roleUpdate$.complete();

      component.saveMember(changeEvent, member);
      expect(memberService.setMemberRoles).toHaveBeenCalledTimes(2);
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

      jest.spyOn(console, 'error').mockImplementation(() => undefined as any);

      component.saveMember(changeEvent, member);
      tick();
      flush();

      expect(component.readMembers).toHaveBeenCalled();
      expect(notificationService.openErrorStrip).toHaveBeenCalled();
    }));
  });

  describe('on openLeaveDialog', () => {
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

    it('should show error if remove leaveEntity fails', fakeAsync(() => {
      confirmationServiceMock.showLeaveScopeDialog.mockReturnValue(
        Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
      );
      memberService.leaveEntity = jest
        .fn()
        .mockReturnValue(throwError(() => new Error('remove error')));

      component.openLeaveDialog();
      tick();

      expect(confirmationServiceMock.showLeaveScopeDialog).toHaveBeenCalled();
      //expect(memberService.removeFromEntity).toHaveBeenCalledWith(mockMemberUser.user);
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        expect.stringContaining('Could not leave project. Reason: '),
      );
    }));

    it('should show error if remove showLeaveScopeDialog fails', fakeAsync(() => {
      confirmationServiceMock.showLeaveScopeDialog.mockImplementationOnce(() =>
        Promise.reject(new Error('remove error')),
      );

      component.openLeaveDialog();
      tick();

      expect(confirmationServiceMock.showLeaveScopeDialog).toHaveBeenCalled();
      expect(notificationService.openErrorStrip).toHaveBeenCalledWith(
        expect.stringContaining('Could not leave project. Reason: '),
      );
    }));

    it('should call showLeaveScopeDialog with empty string if scopeDisplayName not defined', fakeAsync(() => {
      confirmationServiceMock.showLeaveScopeDialog.mockReturnValue(
        Promise.resolve(ConfirmationDialogDecision.CONFIRMED),
      );
      component.scopeDisplayName = undefined;

      component.openLeaveDialog();
      tick();

      expect(confirmationServiceMock.showLeaveScopeDialog).toHaveBeenCalledWith(
        '',
      );
    }));
  });

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
        const mockMember = {
          user: {
            firstName: firstName,
            lastName: lastName,
          } as User,
          roles: [],
        };

        it(`should return ${expected.toString()}`, () => {
          const userid = isCurrentUser
            ? mockMember.user.userId
            : mockMemberOwner.user.userId;

          luigiContextSubject.next(
            mock<IContextMessage>({
              context: mock<NodeContext>({
                userid,
              }),
            }),
          );

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
    {
      members: mockOneMemberOwner,
      isUserOwner: true,
      expected: true,
      countOwners: 0,
    },
    {
      members: mockOneMemberOwner,
      isUserOwner: true,
      expected: true,
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

        luigiContextSubject.next({
          context: {
            entityContext: {
              project: {
                policies: [`${isUserOwner ? 'iamAdmin' : ''}`],
                id: 'id',
                displayName: 'dM',
              },
            },
            portalContext: {
              iamClaimEntityUrl: 'http://example.com',
            },
          },
        } as any);
        component.countOwners = countOwners;

        const isCurrentUserUniqueOwner = component.isCurrentUserUniqueOwner();

        expect(isCurrentUserUniqueOwner).toEqual(expected);
      }));
    },
  );

  describe('should handle readMembers error', () => {
    it('should assign corner values if data missing', () => {
      usersOfEntitySubject.next({
        users: [],
        // @ts-expect-error expected to be undefined
        pageInfo: { totalCount: undefined, ownerCount: 1 },
      });

      component.readMembers();

      const members = component.members();
      const totalItems = component.totalItems();

      expect(totalItems).toEqual(0);
      expect(members).toEqual([]);
    });

    it('should assign corner values if data missing 2', () => {
      usersOfEntitySubject.next(undefined);
      component.readMembers();

      const countOwners = component.countOwners;

      expect(countOwners).toBeUndefined();
    });
  });

  it('should check current user', fakeAsync(() => {
    luigiContextSubject.next(
      mock<IContextMessage>({
        context: mock<NodeContext>({
          userid: mockMemberUser.user.userId,
          entityContext: {
            project: { policies: ['iamAdmin'], id: 'id', displayName: 'dM' },
          },
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
      mock<IContextMessage>({
        context: mock<NodeContext>({
          goBackContext: {
            addedMembers,
            error: undefined,
          },
          entityContext: {
            project: { policies: ['iamAdmin'], id: 'id', displayName: 'dM' },
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
      mock<IContextMessage>({
        context: mock<NodeContext>({
          goBackContext: {
            error,
          },
          entityContext: {
            project: { policies: ['iamAdmin'], id: 'id', displayName: 'dM' },
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
    claimProjectService.claim = jest.fn();
    component.claim();
    expect(claimProjectService.claim).toHaveBeenCalled();
  }));

  describe('noFiltersApplied method', () => {
    it('should return true when no roles are selected and no search term', () => {
      component.selectedFilterRoleIds = [];
      component.searchTerm = '';

      expect(component.noFiltersApplied()).toBeTruthy();
    });

    it('should return false when roles are selected', () => {
      component.selectedFilterRoleIds = [roleMember];
      component.searchTerm = '';

      expect(component.noFiltersApplied()).toBeFalsy();
    });

    it('should return false when search term is present', () => {
      component.selectedFilterRoleIds = [];
      component.searchTerm = 'test';

      expect(component.noFiltersApplied()).toBeFalsy();
    });

    it('should return false when both roles are selected and search term is present', () => {
      component.selectedFilterRoleIds = [roleMember, roleOwner];
      component.searchTerm = 'test';

      expect(component.noFiltersApplied()).toBeFalsy();
    });
  });

  it('should set itemsPerPage and call newPageClicked with 1 on itemsPerPageChange()', () => {
    component.newPageClicked = jest.fn();
    component.itemsPerPage = 10;

    component.itemsPerPageChange(25);

    expect(component.itemsPerPage).toBe(25);
    expect(component.newPageClicked).toHaveBeenCalledWith(1);
  });

  it('should set currentPage to 1, update selectedFilterRoles, and call readMembers on setRolesFilter', () => {
    const readMembersMock = jest.fn();
    component.readMembers = readMembersMock;
    component.currentPage = 5;
    component.selectedFilterRoleIds = [];

    const event = {
      selectedItems: [roleOwner, roleMember],
    } as unknown as MultiComboboxSelectionChangeEvent;

    component.setRolesFilter(event);

    expect(component.currentPage).toBe(1);
    expect(component.selectedFilterRoleIds).toEqual([roleOwner, roleMember]);
    expect(readMembersMock).toHaveBeenCalled();
  });

  it('should set sortBy and call readMembers on sortChange', () => {
    const readMembersMock = jest.fn();
    component.readMembers = readMembersMock;
    const sortEvent = {
      current: [{ field: 'user', direction: 'desc' }],
    } as TableSortChangeEvent;

    component.sortChange(sortEvent);

    expect(component.sortBy).toEqual({ field: 'user', direction: 'desc' });
    expect(readMembersMock).toHaveBeenCalled();
  });

  describe('on onSearchSubmit', () => {
    it('should set currentPage to 1, trim and set searchTerm, and call readMembers on onSearchSubmit', () => {
      const readMembersMock = jest.fn();
      component.readMembers = readMembersMock;
      component.currentPage = 5;
      component.searchTerm = 'old';

      component.onSearchSubmit('  new search  ');

      expect(component.currentPage).toBe(1);
      expect(component.searchTerm).toBe('new search');
      expect(readMembersMock).toHaveBeenCalled();
    });

    it('should default searchTerm to empty string if not provided', () => {
      const readMembersMock = jest.fn();
      component.readMembers = readMembersMock;
      component.currentPage = 2;
      component.searchTerm = 'something';

      component.onSearchSubmit();

      expect(component.currentPage).toBe(1);
      expect(component.searchTerm).toBe('');
      expect(readMembersMock).toHaveBeenCalled();
    });
  });
});
