import { User } from '../../models';
import { AvatarProviderService } from '../../services';
import { UserQuickViewComponent } from '../user-quick-view';
import { AvatarMode } from './avatar.model';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Size } from '@fundamental-ngx/core';
import { AvatarComponent as AvatarComponent_1 } from '@fundamental-ngx/core/avatar';

@Component({
  selector: 'iam-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: true,
  imports: [UserQuickViewComponent, NgTemplateOutlet, AvatarComponent_1],
})
export class AvatarComponent implements OnChanges {
  private avatarProviderService = inject(AvatarProviderService);
  /**
   * The size of the avatar component.
   */
  @Input() size!: Size;
  /**
   * The user data used to generate the avatar
   */
  @Input() user!: User;
  /**
   * Determines whether to disable the popover when clicking on the avatar
   */
  @Input() disablePopover = false;

  imageUrl!: string;
  avatarMode: AvatarMode = AvatarMode.GlyphIcon;
  allAvatarModes = AvatarMode;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']?.currentValue !== changes['user']?.previousValue) {
      this.setupUserAvatar();
    }
  }

  async setupUserAvatar(): Promise<void> {
    const avatarImageUrl = await this.avatarProviderService.getAvatarImageUrl(
      this.user,
    );

    if (avatarImageUrl) {
      this.imageUrl = avatarImageUrl;
      this.avatarMode = AvatarMode.Image;
    } else if (this.user?.firstName || this.user?.lastName) {
      this.avatarMode = AvatarMode.Name;
    } else {
      this.avatarMode = AvatarMode.GlyphIcon;
    }

    this.cdr.detectChanges();
  }
}
