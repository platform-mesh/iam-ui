import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {
  FacetComponent,
  FacetContentComponent,
  FacetGroupComponent,
} from '@fundamental-ngx/core';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';
import { TextComponent } from '@fundamental-ngx/core/text';
import { ButtonComponent } from '@fundamental-ngx/platform/button';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  AvatarComponent,
  DashboardComponent,
  Header,
  IamLuigiContextService,
  MemberService,
  NodeContext,
  User,
  UserUtils,
} from '@platform-mesh/iam-lib';

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
  user = signal<User | undefined>(undefined);
  header: Header = {
    title: 'User Profile',
    subtitle: '',
  };

  ctx!: NodeContext;

  @Input()
  LuigiClient!: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.ctx = context;
    this.luigiContextService.setContext(context);
  }

  constructor(
    private luigiContextService: IamLuigiContextService,
    private memberService: MemberService,
  ) {}

  ngOnInit(): void {
    this.memberService.user(this.ctx.userId).subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (error) => {
        this.user.set({
          userId: this.ctx.userId,
          email: 'test@test.com',
          firstName: 'First',
          lastName: 'Last',
        });
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
    const user = this.user();
    return user?.firstName ? `See ${user?.firstName} on:` : 'Check on:';
  }
}
