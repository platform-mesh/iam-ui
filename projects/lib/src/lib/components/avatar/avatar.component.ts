import { User } from '../../models';
import { AvatarProviderService, IamLuigiContextService } from '../../services';
import { UserQuickViewComponent } from '../user-quick-view';
import { AvatarMode } from './avatar.model';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Size } from '@fundamental-ngx/core';
import { AvatarComponent as AvatarComponent_1 } from '@fundamental-ngx/core/avatar';

@Component({
  selector: 'iam-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [UserQuickViewComponent, NgTemplateOutlet, AvatarComponent_1],
})
export class AvatarComponent {
  private avatarProviderService = inject(AvatarProviderService);
  private iamLuigiContextService = inject(IamLuigiContextService);
  /**
   * The size of the avatar component.
   */
  size = input.required<Size>();
  /**
   * The user data used to generate the avatar
   */
  user = input.required<User>();
  /**
   * Determines whether to disable the popover when clicking on the avatar
   */
  disablePopover = input<boolean>(false);

  ctx = toSignal(this.iamLuigiContextService.contextObservable());

  imageUrl!: string;
  avatarMode: AvatarMode = AvatarMode.GlyphIcon;
  allAvatarModes = AvatarMode;

  constructor(private cdr: ChangeDetectorRef) {
    effect(() => {
      this.setupUserAvatar();
    });
  }

  async setupUserAvatar(): Promise<void> {
    const user = this.user();
    const ctx = this.ctx();
    const avatarImageUrl =
      await this.avatarProviderService.getAvatarImageUrl(user, ctx?.context.portalContext.avatarImgUrl);

    if (avatarImageUrl) {
      this.imageUrl = avatarImageUrl;
      this.avatarMode = AvatarMode.Image;
    } else if (user.firstName || user.lastName) {
      this.avatarMode = AvatarMode.Name;
    } else {
      this.avatarMode = AvatarMode.GlyphIcon;
    }

    this.cdr.detectChanges();
  }
}
