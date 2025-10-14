import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FacetComponent, FacetContentComponent, FacetGroupComponent } from '@fundamental-ngx/core';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';
import { LinkComponent } from '@fundamental-ngx/core/link';
import { TextComponent } from '@fundamental-ngx/core/text';
import { ButtonComponent } from '@fundamental-ngx/platform/button';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import { AvatarComponent, DashboardComponent, Header, IamLuigiContextService, NodeContext, User, UserService, UserUtils } from '@platform-mesh/iam-lib';


@Component({
  selector: 'app-user-overview-header',
  imports: [
    FacetGroupComponent,
    FacetComponent,
    AvatarComponent,
    ButtonComponent,
    ContentDensityDirective,
    FacetContentComponent,
    TextComponent,
    DashboardComponent,
  ],
  templateUrl: './user-overview-header.component.html',
  styleUrl: './user-overview-header.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOverviewHeaderComponent implements OnInit {
  user?: User;
  header: Header = {
    title: 'User Profile',
    subtitle: '',
  };

  ctx?: NodeContext;

  /**
   * Set by Luigi itself.
   */
  @Input()
  LuigiClient!: LuigiClient;

  /**
   * Set by Luigi itself.
   */
  @Input()
  set context(context: NodeContext) {
    this.ctx = context;
    this.luigiContextService.setContext(context);
  }

  constructor(
    private luigiContextService: IamLuigiContextService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userService.getUser(this.ctx?.profileUserId ?? '').subscribe({
      next: (user) => {
        this.user = user;
        this.cdRef.markForCheck();
      },
      error: (error) => {
        this.user = {
          userId: this.ctx?.profileUserId,
          invitationOutstanding: false,
          email: 'test@test.com',
          firstName: 'First',
          lastName: 'Last',
          title: 'Title',
        };
        this.cdRef.markForCheck();
      },
    });
  }

  getFirstLastNameOrUserId(user: User): string {
    const name = UserUtils.getNameOrDefault(user, '');
    return name ? `${name} (${user.userId})` : user.userId || '';
  }

  callUserViaTeams(email: string | undefined, withVideo = false): void {
    const url = `msteams:/l/call/0/0?users=${email}&withVideo=${withVideo}`;
    this.openNewWindow(url);
  }

  chatWithUserViaTeams(email: string | undefined): void {
    const url = `msteams:/l/chat/0/0?users=${email}`;
    this.openNewWindow(url);
  }

  emailUser(email: string | undefined): void {
    window.location.assign(`mailto:${email}`);
  }

  private openNewWindow(url: string): void {
    window.open(url, '_blank');
  }

  getUserContactsHeaderText(): string {
    return this.user?.firstName
      ? `See ${this.user.firstName} on:`
      : 'Check on:';
  }
}