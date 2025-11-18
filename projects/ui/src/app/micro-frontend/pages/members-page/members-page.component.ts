import { ConfirmationMessagesService } from '../../services/confirmation-messages/confirmation-messages.service';
import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from '../../services/notification/confirmation.service';
import {
  ERROR_CHANGING_MEMBERS_ROLE,
  ERROR_MUST_HAVE_AT_LEAST_ONE_OWNER,
  ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE,
  SUCCESS_CHANGING_MEMBERS_ROLE,
} from './string-variables';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormItemComponent,
  FormLabelComponent,
  MultiComboboxComponent,
  MultiComboboxSelectionChangeEvent,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { BusyIndicatorComponent } from '@fundamental-ngx/core/busy-indicator';
import { ButtonComponent } from '@fundamental-ngx/core/button';
import {
  IllustratedMessageActionsComponent,
  IllustratedMessageComponent,
  IllustratedMessageFigcaptionComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
} from '@fundamental-ngx/core/illustrated-message';
import { PaginationComponent } from '@fundamental-ngx/core/pagination';
import {
  ToolbarComponent,
  ToolbarItemDirective,
} from '@fundamental-ngx/core/toolbar';
import {
  DynamicPageContentComponent,
  DynamicPageTitleComponent,
  SearchFieldComponent,
  TableColumnComponent,
  TableSortChangeEvent,
} from '@fundamental-ngx/platform';
import {
  DynamicPageComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
} from '@fundamental-ngx/platform/dynamic-page';
import {
  NoDataWrapperComponent,
  TableComponent,
} from '@fundamental-ngx/platform/table';
import {
  FdpCellDef,
  FdpTableCell,
  TableInitialStateDirective,
} from '@fundamental-ngx/platform/table-helpers';
import {
  ClaimEntityService,
  AvatarComponent as IAMAvatarComponent,
  IamLuigiContextService,
  LuigiClient,
  Member,
  MemberService,
  NodeContext,
  NotificationService,
  Role,
  RoutingService,
  SortByInput,
  SortDirection,
  User,
  UserConnection,
  UserSortField,
  UserUtils,
} from '@platform-mesh/iam-lib';
import { Subscription } from 'rxjs';

export interface AddMembersData {
  error?: string;
  addedMembers?: User[];
}

@Component({
  selector: 'app-members-page',
  imports: [
    ToolbarComponent,
    ButtonComponent,
    CdkScrollable,
    TableComponent,
    TableInitialStateDirective,
    TableColumnComponent,
    FdpCellDef,
    FdpTableCell,
    AvatarComponent,
    IAMAvatarComponent,
    NoDataWrapperComponent,
    IllustratedMessageComponent,
    IllustratedMessageFigcaptionComponent,
    IllustratedMessageTitleDirective,
    IllustratedMessageTextDirective,
    IllustratedMessageActionsComponent,
    PaginationComponent,
    ToolbarItemDirective,
    BusyIndicatorComponent,
    SearchFieldComponent,
    DynamicPageComponent,
    DynamicPageTitleComponent,
    DynamicPageHeaderComponent,
    DynamicPageGlobalActionsComponent,
    DynamicPageContentComponent,
    FormItemComponent,
    FormLabelComponent,
    MultiComboboxComponent,
  ],
  templateUrl: './members-page.component.html',
  styleUrl: './members-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, ConfirmationMessagesService],
})
export class MembersPageComponent implements OnInit, OnDestroy {
  public countOwners?: number;
  public scopeDisplayName?: string;
  public currentEntity?: string;
  public iamClaimEntityUrl?: string;

  private subscriptions: Subscription = new Subscription();
  currentUserId!: string;
  private lockView = false;

  members = signal<Member[]>([]);
  rolesForEntity = signal<Role[]>([]);
  totalItems = signal<number>(10);
  searchTerm = '';
  selectedFilterRoleIds: string[] = [];
  sortBy: SortByInput = {
    field: UserSortField.lastName,
    direction: SortDirection.asc,
  };
  initialSortOrder = [this.sortBy];
  itemsPerPage = 10;
  currentPage = 1;
  itemsPerPageOptions: number[] = [5, 10, 15];
  isLoading = signal<boolean>(true);

  svgConfig = {
    scene: {
      url: 'assets/images/tnt-Scene-Teams.svg',
      id: 'tnt-Scene-Teams',
    },
    dialog: {
      url: 'assets/images/tnt-Dialog-Teams.svg',
      id: 'tnt-Dialog-Teams',
    },
  };

  noSearchResults = {
    scene: {
      url: 'assets/images/sapIllus-Scene-NoSearchResults.svg',
      id: 'sapIllus-Scene-NoSearchResults',
    },
    dialog: {
      url: 'assets/images/sapIllus-Dialog-NoSearchResults.svg',
      id: 'sapIllus-Dialog-NoSearchResults',
    },
  };
  context!: NodeContext;
  currentUser: Member | undefined;
  currentUserIsOwner: boolean = false;

  constructor(
    private memberService: MemberService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private luigiClient: LuigiClient,
    private luigiContextService: IamLuigiContextService,
    private claimEntityService: ClaimEntityService,
    private confirmationMessagesService: ConfirmationMessagesService,
    private routingService: RoutingService,
  ) {}

  async ngOnInit() {
    this.context = await this.luigiContextService.getContextAsync();
    this.currentEntity = this.context.entityName;
    this.currentUserId = this.context.userId;
    this.iamClaimEntityUrl = this.context.portalContext.iamClaimEntityUrl;
    this.scopeDisplayName = this.context.entityId;

    this.memberService.roles().subscribe({
      next: (roles) => this.rolesForEntity.set(roles || []),
    });

    this.readMembers();
  }

  public isCurrentUserMember(member: Member) {
    return member.roles.some((r) => r.id === 'member');
  }

  navigateToUserProfile(userId: string): void {
    const searchItemLink = {
      displayName: userId,
      link: {
        url: `/users/${userId}/overview`,
        external: false,
      },
    };
    this.routingService.openLink(searchItemLink);
  }

  isCurrentUserUniqueOwner(): boolean {
    return this.currentUserIsOwner && (this.countOwners ?? 0) < 2;
  }

  equalsCurrentUser(member: Member): boolean {
    return member.user && this.currentUserId === member.user.userId;
  }

  getUserNameOrId(member: Member): string {
    const postFix = this.equalsCurrentUser(member)
      ? ` (${$localize`You`})`
      : '';
    const userName = UserUtils.getNameOrId(member.user);
    return `${userName}${postFix}`;
  }

  readMembers(): void {
    this.memberService
      .users({
        page: { page: this.currentPage, limit: this.itemsPerPage },
        roleFilters: this.selectedFilterRoleIds,
        sortBy: this.sortBy,
      })
      .subscribe({
        next: (members: UserConnection | undefined) => {
          this.isLoading.set(false);
          if (!members) {
            return;
          }

          this.members.set(members.users);
          this.totalItems.set(members.pageInfo.totalCount || 0);
          this.countOwners = members.pageInfo.ownerCount;
          this.currentUser = (members.users || []).find(
            (m) => m.user.userId === this.currentUserId,
          );
          this.currentUserIsOwner = !!this.currentUser?.roles.some(
            (r) => r.id === 'owner',
          );
        },
        error: (error) => {
          this.isLoading.set(false);
        },
      });
  }

  openAddMembersDialog(): void {
    void this.luigiClient
      .linkManager()
      .fromParent()
      .openAsModal('add-members', {
        title: $localize`Add Members`,
        width: '60rem',
        height: '40rem',
      });
  }

  private openSuccessToast(addMembersData: AddMembersData): void {
    const successMessage =
      this.confirmationMessagesService.getAddedMembersMessage(
        addMembersData,
        this.currentEntity,
      );
    this.notificationService.openSuccessToast(successMessage);
  }

  private openErrorToast(reason: string): void {
    this.notificationService.openErrorStrip(
      $localize`Could not add new members. Reason: ` + reason.toString(),
    );
  }

  openRemoveMemberDialog(member: Member): void {
    this.confirmationService
      .showRemoveMemberDialog(member.user)
      .then((confirmation) => {
        if (confirmation === ConfirmationDialogDecision.CONFIRMED) {
          this.memberService.removeRole(member.user, 'member').subscribe({
            next: () => {
              this.removeMemberSuccessNotification(member.user);
              this.readMembers();
            },
            error: (error: Error) => {
              this.removeMemberErrorNotification(error);
            },
          });
        }
      })
      .catch((error: Error) => {
        this.removeMemberErrorNotification(error);
      });
  }

  private removeMemberSuccessNotification(user: User): void {
    this.notificationService.openSuccessToast(
      UserUtils.getNameOrId(user) +
        $localize` has been removed from the ${this.currentEntity}.`,
    );
  }

  private removeMemberErrorNotification(reason: Error): void {
    this.notificationService.openErrorStrip(
      $localize`Could not remove user from ${this.currentEntity}. Reason: ` +
        reason.toString(),
    );
  }

  openLeaveDialog(): void {
    this.confirmationService
      .showLeaveScopeDialog(this.scopeDisplayName ?? '')
      .then((confirmation) => {
        if (confirmation === ConfirmationDialogDecision.CONFIRMED) {
          this.subscriptions.add(
            this.memberService
              .removeRole({ userId: this.currentUserId }, 'member')
              .subscribe({
                next: () => {
                  this.leaveSuccessNotification();
                },
                error: (error: Error) => {
                  this.leaveErrorNotification(error);
                },
              }),
          );
        }
      })
      .catch((error: Error) => {
        this.leaveErrorNotification(error);
      });
  }

  private leaveSuccessNotification(): void {
    this.notificationService.openSuccessToast(
      $localize`You have left the ${this.currentEntity} ` +
        `${this.scopeDisplayName}.`,
    );
  }

  private leaveErrorNotification(reason: Error): void {
    this.notificationService.openErrorStrip(
      $localize`Could not leave ${this.currentEntity}. Reason: ` +
        reason.toString(),
    );
  }

  public saveMember(
    event: MultiComboboxSelectionChangeEvent,
    member: Member,
  ): void {
    const sortByRoleTechnicalName = (a: Role, b: Role) =>
      a.id?.localeCompare(b.id, 'en');
    const selectedSortedRoles = [...(event.selectedItems as Role[])].sort(
      sortByRoleTechnicalName,
    );
    const memberSortedRoles = [...member.roles].sort(sortByRoleTechnicalName);

    if (
      JSON.stringify(selectedSortedRoles) === JSON.stringify(memberSortedRoles)
    ) {
      // Fundamental Multi Combobox has a bug where it triggers the change event twice
      // The second time around, the values will be the same as the original values so we ignore it
      return;
    }

    if ((event.selectedItems as Role[]).length === 0) {
      this.notificationService.openErrorStrip(
        ERROR_MUST_HAVE_AT_LEAST_ONE_ROLE,
      );
      event.source.setValue(member.roles);
      return;
    }

    // if the user is the owner, he cannot remove himself from the owner role
    const ownerRoleRemains = (event.selectedItems as Role[]).find(
      (role) => role.id === 'owner',
    );

    if (
      this.equalsCurrentUser(member) &&
      this.isCurrentUserUniqueOwner() &&
      !ownerRoleRemains
    ) {
      this.notificationService.openErrorStrip(
        ERROR_MUST_HAVE_AT_LEAST_ONE_OWNER,
      );
      event.source.setValue(member.roles);
      return;
    }

    if (this.lockView) {
      return;
    }
    this.lockView = true;

    this.memberService
      .assignRolesToUser(member.user, event.selectedItems as Role[])
      .subscribe({
        next: () => {
          this.lockView = false;
          if (member.user.userId === this.currentUserId) {
            this.luigiClient.clearFrameCache();
          }
          this.notificationService.openSuccessToast(
            SUCCESS_CHANGING_MEMBERS_ROLE,
          );
          this.readMembers();
        },
        error: (error) => {
          console.error(error);
          this.lockView = false;
          this.notificationService.openErrorStrip(ERROR_CHANGING_MEMBERS_ROLE);
          this.readMembers();
        },
      });
  }

  selectedRoles(member: Member): Role[] {
    return (
      this.rolesForEntity().filter((r) =>
        member.roles.map((mr) => mr.id).includes(r.id),
      ) || []
    );
  }

  newPageClicked(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.readMembers();
  }

  public emailUser(user: User): void {
    window.location.href = `mailto:${user.email}`;
  }

  public callUserViaTeams(user: User, withVideo = false): void {
    const url = `msteams:/l/call/0/0?users=${user.email}&withVideo=${String(
      withVideo,
    )}`;
    MembersPageComponent.openNewWindow(url);
  }

  public chatWithUserViaTeams(user: User): void {
    const url = `msteams:/l/chat/0/0?users=${user.email}`;
    MembersPageComponent.openNewWindow(url);
  }

  private static openNewWindow(url: string): void {
    window.open(url, '_blank');
  }

  itemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.newPageClicked(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  claim(): void {
    this.claimEntityService.claim();
  }

  onSearchSubmit(searchTerm = ''): void {
    this.currentPage = 1;
    this.searchTerm = searchTerm.trim();
    this.readMembers();
  }

  setRolesFilter(item: MultiComboboxSelectionChangeEvent): void {
    this.currentPage = 1;
    this.selectedFilterRoleIds = (item.selectedItems as Role[]).map(
      (i) => i.id,
    );
    this.readMembers();
  }

  sortChange(event: TableSortChangeEvent): void {
    // gkr todo
    this.sortBy = {
      field: UserSortField.userId,
      direction: SortDirection.desc,
    };
    this.readMembers();
  }

  noFiltersApplied(): boolean {
    return this.selectedFilterRoleIds.length === 0 && !this.searchTerm;
  }
}
