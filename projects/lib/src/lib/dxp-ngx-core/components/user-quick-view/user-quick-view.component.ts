import { User } from '../../models';
import { LuigiClient } from '../../services';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
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
  selector: 'dxp-user-quick-view[user]',
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
  ],
})
export class UserQuickViewComponent {
  /**
   * The user data that will be shown in the quick view
   */
  @Input() user!: User;

  @ViewChild(PopoverBodyComponent)
  popover!: PopoverBodyComponent;

  constructor(private luigiClient: LuigiClient) {}

  public getUserAvatarImgUrl(): string {
    return `https://avatars.wdf.sap.corp/avatar/${this.user.userId}`;
  }

  public getGithubURL(): string {
    return `https://github.tools.sap/${this.user.userId}`;
  }

  public getUserFullName(): string {
    return `${this.user.firstName || ''} ${this.user.lastName || ''}`;
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
        this.popover._focusFirstTabbableElement();
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
