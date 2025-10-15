import { User } from '../../models';
import {
  AvatarProviderService,
  IamLuigiContextService,
  LuigiClient,
} from '../../services';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  IconComponent,
  LinkComponent,
  PopoverBodyComponent,
  PopoverBodyDirective,
  PopoverComponent,
  PopoverControlComponent,
  QuickViewComponent,
  QuickViewGroupComponent,
  QuickViewSubheaderComponent,
  QuickViewSubheaderSubtitleComponent,
  QuickViewSubheaderTitleComponent,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-quick-view[user]',
  templateUrl: './user-quick-view.component.html',
  styleUrls: ['./user-quick-view.component.scss'],
  standalone: true,
  imports: [
    PopoverComponent,
    PopoverControlComponent,
    PopoverBodyDirective,
    CardComponent,
    CardContentComponent,
    QuickViewComponent,
    QuickViewSubheaderComponent,
    AvatarComponent,
    QuickViewSubheaderTitleComponent,
    LinkComponent,
    QuickViewSubheaderSubtitleComponent,
    QuickViewGroupComponent,
    IconComponent,
    ButtonComponent,
    AsyncPipe,
  ],
})
export class UserQuickViewComponent {
  private avatarProviderService = inject(AvatarProviderService);
  private iamLuigiContextService = inject(IamLuigiContextService);
  /**
   * The user data that will be shown in the quick view
   */
  user = input.required<User>();
  ctx = toSignal(this.iamLuigiContextService.contextObservable());

  popover = viewChild.required<PopoverBodyComponent>(PopoverBodyComponent);

  constructor(private luigiClient: LuigiClient) {}

  public getUserAvatarImgUrl(): Promise<string | undefined> {
    return this.avatarProviderService.getAvatarImageUrl(this.user(), this.ctx()?.context.portalContext.avatarImgUrl);
  }

  public getGithubURL(): string {
    return `https://github.tools.sap/${this.user().userId}`;
  }

  public getUserFullName(): string {
    const user = this.user();
    return `${user.firstName || ''} ${user.lastName || ''}`;
  }

  public callUserViaTeams(email: string, withVideo = false): void {
    const url = `msteams:/l/call/0/0?users=${email}&withVideo=${withVideo}`;
    this.openNewWindow(url);
  }

  public chatWithUserViaTeams(email: string): void {
    const url = `msteams:/l/chat/0/0?users=${email}`;
    this.openNewWindow(url);
  }

  public emailUser(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  public isOpenChange(isOpen: boolean) {
    if (isOpen) {
      setTimeout(() => {
        this.popover()._focusFirstTabbableElement();
      }, 0);
    }
  }

  private openNewWindow(url: string): void {
    window.open(url, '_blank');
  }

  public navigateToUserProfile(userId: string | undefined): void {
    this.luigiClient.linkManager().navigate(`/users/${userId}/overview`);
  }
}
