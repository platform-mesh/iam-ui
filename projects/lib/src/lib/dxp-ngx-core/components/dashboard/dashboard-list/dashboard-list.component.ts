import { Groups } from '../../../authorization';
import { AvatarComponent as IAMAvatarComponent } from '../../avatar';
import { ListItem } from './models/list-item';
import { SvgConfigType } from './models/svg-config-type';
import { sapIllusDotAvatarAlternate } from './svg/dot-avatar-alternate';
import { sapIllusDotNoApplicationsAlternate } from './svg/dot-no-applications-alternate';
import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AvatarComponent,
  ButtonComponent,
  ContentDensityDirective,
  IconComponent,
  IllustratedMessageComponent,
  IllustratedMessageTextDirective,
  IllustratedMessageTitleDirective,
  ListBylineDirective,
  ListComponent,
  ListContentDirective,
  ListItemComponent,
  ListLinkDirective,
  ListThumbnailDirective,
  ListTitleDirective,
  SvgConfig,
} from '@fundamental-ngx/core';
import { PopoverModule } from '@fundamental-ngx/core/popover';

@Component({
  selector: 'app-dxp-dashboard-list',
  standalone: true,
  imports: [
    ListComponent,
    ListItemComponent,
    ListLinkDirective,
    ListThumbnailDirective,
    AvatarComponent,
    ListContentDirective,
    ListTitleDirective,
    ListBylineDirective,
    ContentDensityDirective,
    IllustratedMessageComponent,
    IllustratedMessageTitleDirective,
    IllustratedMessageTextDirective,
    ButtonComponent,
    IAMAvatarComponent,
    IconComponent,
    PopoverModule,
    NgTemplateOutlet,
  ],
  templateUrl: './dashboard-list.component.html',
  styleUrl: './dashboard-list.component.scss',
})
export class DashboardListComponent {
  /**
   * List of items to display.
   */
  @Input({ required: true }) list: ListItem[] = [];

  /**
   * Title displayed when there are no items.
   */
  @Input({ required: true }) noItemTitle!: string;

  /**
   * Boolean that indicates whether to show the byline text for list items.
   */
  @Input({ required: true }) showByline!: boolean;

  /**
   * Label for the add button.
   */
  @Input() addLabel = 'Add';

  /**
   * Boolean that indicates whether the action button is disabled.
   */
  @Input() actionDisabled = false;

  /**
   * Tooltip text displayed when the action button is disabled.
   */
  @Input() actionDisabledTooltip?: string;

  /**
   * Text displayed when there are no items in the list.
   */
  @Input() noItemText = 'They will appear here once added.';

  /**
   * SVG configuration for the illustrated message.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input({ required: true, transform: toSvgConfig, alias: 'svgConfigType' })
  svgConfig!: SvgConfig;

  /**
   * Roles allowed to trigger the add callback.
   */
  @Input() rolesAllowedForAddCallback: string[] = [
    Groups.PROJECT_OWNER,
    'projectAdmin',
  ];

  /**
   * Event emitted when the add button is clicked.
   */
  @Output() addCallback = new EventEmitter<void>();

  handleClick(event: Event, link?: string): void {
    if (!link) {
      event.preventDefault();
    }
  }
}

function toSvgConfig(svgConfigType: SvgConfigType): SvgConfig {
  const avatarSvgConfig: SvgConfig = {
    dot: {
      file: sapIllusDotAvatarAlternate,
      id: 'tnt-Dot-Avatar-alternate',
    },
  };

  const noApplicationsSvgConfig: SvgConfig = {
    dot: {
      file: sapIllusDotNoApplicationsAlternate,
      id: 'tnt-Dot-NoApplications-alternate',
    },
  };
  return svgConfigType === SvgConfigType.AvatarAlternate
    ? avatarSvgConfig
    : noApplicationsSvgConfig;
}
