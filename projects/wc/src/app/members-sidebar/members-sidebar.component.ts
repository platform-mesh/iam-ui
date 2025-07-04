import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  AvatarGroupComponent,
  AvatarGroupItemDirective,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { LinkComponent } from '@fundamental-ngx/core/link';
import {
  QuickViewComponent,
  QuickViewGroupComponent,
  QuickViewGroupItemComponent,
  QuickViewGroupItemContentComponent,
  QuickViewGroupItemLabelComponent,
  QuickViewGroupTitleComponent,
  QuickViewSubheaderComponent,
  QuickViewSubheaderTitleComponent,
} from '@fundamental-ngx/core/quick-view';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  DashboardSidebarItemComponent,
  GrantedUsers,
  AvatarComponent as IAMAvatarComponent,
  IamLuigiContextService,
  MemberService,
  NodeContext,
  ProjectGroupTechnicalNames,
  RolesTechnicalName,
  User,
} from '@platform-mesh/iam-lib';
import { map } from 'rxjs';

@Component({
  selector: 'app-members-sidebar-component',
  templateUrl: './members-sidebar.component.html',
  styleUrl: './members-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  imports: [
    AvatarGroupComponent,
    AvatarGroupItemDirective,
    AvatarComponent,
    QuickViewComponent,
    QuickViewSubheaderComponent,
    IAMAvatarComponent,
    QuickViewSubheaderTitleComponent,
    QuickViewGroupComponent,
    QuickViewGroupTitleComponent,
    QuickViewGroupItemComponent,
    QuickViewGroupItemLabelComponent,
    QuickViewGroupItemContentComponent,
    LinkComponent,
    DashboardSidebarItemComponent,
  ],
})
export class MembersSidebarComponent implements OnInit {
  rolesAllowedForEdit = [
    ProjectGroupTechnicalNames.PROJECT_OWNER,
    RolesTechnicalName.OWNER,
  ];
  members: User[] = [];
  loading = true;

  @Input()
  LuigiClient!: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.iamLuigiContextService.setContext(context);
  }

  constructor(
    private iamLuigiContextService: IamLuigiContextService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getUsersOfEntity();
  }

  navigateToUser(userId: string): void {
    this.LuigiClient.linkManager().navigate(`/users/${userId}/overview`);
  }

  navigateToMembers(): void {
    this.LuigiClient.linkManager().fromClosestContext().navigate('members');
  }

  getUsersOfEntity(): void {
    this.memberService
      .usersOfEntity({
        limit: -1,
        page: 1,
        showInvitees: false,
      })
      .pipe(
        map((grantedUsers: GrantedUsers) =>
          grantedUsers.users.map((u) => u.user),
        ),
      )
      .subscribe((users: User[]) => {
        this.members = users;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
}
