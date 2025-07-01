import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  DashboardSidebarItemComponent,
  DxpContext,
  DxpLuigiContextService,
  GrantedUsers,
  AvatarComponent as IAMAvatarComponent,
  MemberService,
  ProjectGroupTechnicalNames,
  RolesTechnicalName,
  User,
} from '@dxp/iam-lib';
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
  set context(context: DxpContext) {
    this.dxpLuigiContextService.setContext(context);
  }

  constructor(
    private dxpLuigiContextService: DxpLuigiContextService,
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
