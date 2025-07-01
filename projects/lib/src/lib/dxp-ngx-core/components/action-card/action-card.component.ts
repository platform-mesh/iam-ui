import { InfoPopupComponent } from './info-popup/info-popup.component';
import { CardAction, HelpLink } from './models/card-action';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardMainHeaderComponent,
  CardTitleDirective,
  IllustratedMessageComponent,
  SvgConfig,
} from '@fundamental-ngx/core';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';

export enum ImageType {
  CENTERED = 'centered',
  FULLSIZE = 'fullsize',
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dxp-action-card',
  templateUrl: './action-card.component.html',
  styleUrls: ['./action-card.component.scss'],
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardMainHeaderComponent,
    CardTitleDirective,
    CardContentComponent,
    ButtonComponent,
    IllustratedMessageComponent,
    InfoPopupComponent,
    ContentDensityDirective,
  ],
})
export class ActionCardComponent {
  /**
   * The title displayed at the top of the card.
   */
  @Input() title?: string;
  /**
   * Defines the width of the card,
   */
  @Input() width = '356px';
  /**
   * Defines the width of the card,
   */
  @Input() height = '430px';
  /**
   * Defines the url to an image.
   */
  @Input() imageConfig!: SvgConfig;
  /**
   * Takes one of the options ImageType.FULLSIZE or ImageType.CENTERED. Defines how the image is displayed.
   */
  @Input() imageType: ImageType = ImageType.FULLSIZE;
  /**
   * Defines the heading under the image.
   */
  @Input() heading?: string;
  /**
   * Defines description of the card.
   */
  @Input() content?: string;
  /**
   * Gives necessary information for the action buttons.
   */
  @Input() actions?: CardAction[];
  /**
   * Defines the link, leading to the help page and the text for a tooltip. The help icon is displayed in the top right corner.
   */
  @Input() helpLink?: HelpLink;
  /**
   * Defines the text to display at the end of the card.
   */
  @Input() footer?: string;

  openCardLink(link: string) {
    window.open(link, '_blank');
  }
  clickAction(action: CardAction) {
    if (action.clickCallback) {
      action.clickCallback();
    }
  }
}
