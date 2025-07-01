import { Policies } from '../../../../../../lib/src/lib/models/policies';
import { ConfirmationMessagesService } from '../../services/confirmation-messages/confirmation-messages.service';
import {
  ConfirmationDialogDecision,
  ConfirmationService,
} from '../../services/notification/confirmation.service';
import {
  ERROR_CHANGING_MEMBERS_ROLE,
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
  ClaimProjectService,
  DxpLuigiContextService,
  GrantedUsers,
  AvatarComponent as IAMAvatarComponent,
  LuigiClient,
  Member,
  MemberService,
  NotificationService,
  PolicyDirective,
  Role,
  User,
  UserUtils,
} from '@dxp/iam-lib';
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
  CollectionSort,
  DynamicPageContentComponent,
  DynamicPageTitleComponent,
  SearchFieldComponent,
  SortDirection,
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
import { Subscription, combineLatest, filter } from 'rxjs';

export interface AddMembersData {
  error?: string;
  addedMembers?: User[];
}

export interface UIRole extends Role {
  id: string;
  label: string;
}

@Component({
  selector: 'app-members-page',
  providers: [ConfirmationService, ConfirmationMessagesService],
  styleUrl: './members-page.component.scss',
  templateUrl: './members-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ToolbarComponent,
    PolicyDirective,
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
})
export class MembersPageComponent implements OnInit, OnDestroy {
  public currentUserIsOwner = false;
  public countOwners?: number;
  public scopeDisplayName?: string;
  public currentEntity?: string;

  private subscriptions: Subscription = new Subscription();
  private currentUserId?: string;
  private lockView = false;

  members = signal<Member[]>([]);
  rolesForEntity = signal<UIRole[]>([]);
  totalItems = signal<number>(10);
  searchTerm = '';
  selectedFilterRoles: UIRole[] = [];
  sortBy: CollectionSort = { field: 'user', direction: SortDirection.ASC };
  initialSortOrder = [this.sortBy];
  itemsPerPage = 10;
  currentPage = 1;
  itemsPerPageOptions: number[] = [5, 10, 15];
  isLoading = true;

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

  constructor(
    private memberService: MemberService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private luigiClient: LuigiClient,
    private luigiContextService: DxpLuigiContextService,
    private claimProjectService: ClaimProjectService,
    private confirmationMessagesService: ConfirmationMessagesService,
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([
        this.memberService.currentEntity(),
        this.luigiContextService.contextObservable(),
      ]).subscribe(([entity, context]) => {
        this.currentEntity = entity;
        this.currentUserId = context.context.userid;

        if (entity && context.context.entityContext) {
          this.scopeDisplayName =
            context.context.entityContext[entity].displayName ||
            context.context.entityContext[entity].id;
          this.currentUserIsOwner = context.context.entityContext[
            entity
          ].policies?.includes(Policies.IAM_ADMIN);
        }
      }),
    );

    this.subscriptions.add(
      this.memberService
        .getAvailableRolesForEntityType()
        .subscribe((groups) => {
          this.rolesForEntity.set(
            groups.map((g) => ({
              label: g.displayName,
              id: g.technicalName,
              ...g,
            })),
          );
        }),
    );

    this.subscriptions.add(
      this.luigiContextService
        .contextObservable()
        .pipe(filter((data) => !!data.context.goBackContext))
        .subscribe((data) => {
          const goBackContext = data.context.goBackContext as AddMembersData;
          if (goBackContext.error) {
            this.openErrorToast(goBackContext.error);
          }
          if (goBackContext.addedMembers) {
            this.readMembers();
            this.openSuccessToast(goBackContext);
          }
        }),
    );
    this.readMembers();
  }

  isCurrentUserUniqueOwner = (): boolean =>
    !!this.currentUserIsOwner && (this.countOwners ?? 0) < 2;

  equalsCurrentUser = (member: Member): boolean =>
    member.user && this.currentUserId === member.user.userId;

  getUserNameOrId = (member: Member): string => {
    const postFix = this.equalsCurrentUser(member)
      ? ` (${$localize`You`})`
      : '';
    const userName = UserUtils.getNameOrId(member.user);
    return `${userName}${postFix}`;
  };

  readMembers() {
    this.memberService
      .usersOfEntity({
        limit: this.itemsPerPage,
        page: this.currentPage,
        showInvitees: true,
        searchTerm: this.searchTerm,
        roles: this.selectedFilterRoles,
        sortBy: this.sortBy,
      })
      .subscribe((members: GrantedUsers) => {
        if (!members) {
          return;
        }

        this.members.set([
          ...(members?.users.map((user) => {
            return {
              user: user.user,
              roles: this.rolesForEntity().filter((role) =>
                user.roles?.some((r) => r.displayName === role.displayName),
              ),
            };
          }) || []),
        ]);
        this.totalItems.set(members.pageInfo.totalCount || 0);

        this.countOwners = members.pageInfo.ownerCount;
        this.isLoading = false;
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
      .showRemoveMemberDialog(member.user, this.scopeDisplayName ?? '')
      .then((confirmation) => {
        if (confirmation === ConfirmationDialogDecision.CONFIRMED) {
          this.subscriptions.add(
            this.memberService.removeFromEntity(member.user).subscribe({
              next: () => {
                this.removeMemberSuccessNotification(member.user);
                this.readMembers();
              },
              error: (error: Error) => {
                this.removeMemberErrorNotification(error);
              },
            }),
          );
        }
      })
      .catch((error: Error) => {
        this.removeMemberErrorNotification(error);
      });
  }

  private removeMemberSuccessNotification(user: User): void {
    this.notificationService.openSuccessToast(
      UserUtils.getNameOrId(user) +
        $localize` was removed from the ${this.currentEntity}.`,
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
            this.memberService.leaveEntity().subscribe({
              next: () => {
                this.leaveSuccessNotification();
                this.memberService.navigateToList();
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
      a.technicalName?.localeCompare(b.technicalName, 'en');
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

    if (this.lockView) {
      return;
    }
    this.lockView = true;

    this.subscriptions.add(
      this.memberService
        .setMemberRoles(member.user, event.selectedItems as Role[], false)
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
            this.notificationService.openErrorStrip(
              ERROR_CHANGING_MEMBERS_ROLE,
            );
            this.readMembers();
          },
        }),
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

  claimProject() {
    this.claimProjectService.claimProject();
  }

  onSearchSubmit(searchTerm = '') {
    this.currentPage = 1;
    this.searchTerm = searchTerm.trim();
    this.readMembers();
  }

  setRolesFilter(item: MultiComboboxSelectionChangeEvent) {
    this.currentPage = 1;
    this.selectedFilterRoles = item.selectedItems as UIRole[];
    this.readMembers();
  }

  sortChange(event: TableSortChangeEvent) {
    this.sortBy = event.current[0];
    this.readMembers();
  }

  noFiltersApplied(): boolean {
    return this.selectedFilterRoles.length === 0 && !this.searchTerm;
  }
}
