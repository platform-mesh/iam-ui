import { CustomButton, Header } from '../../../models';
import { IamLuigiContextService } from '../../../services';
import { StatusInfoPopoverComponent } from '../../status-info-popover';
import { DashboardGridComponent } from '../dashboard-grid/dashboard-grid.component';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';
import { flexibleLayoutConfigProvider } from './providers/flexible-layout-config';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ButtonComponent,
  FlexibleColumnLayout,
  IconComponent,
} from '@fundamental-ngx/core';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageSubheaderComponent,
  DynamicPageTitleContentComponent,
} from '@fundamental-ngx/core/dynamic-page';
import { FlexibleColumnLayoutComponent } from '@fundamental-ngx/core/flexible-column-layout';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import {
  MenuComponent,
  MenuInteractiveComponent,
  MenuItemComponent,
  MenuTitleDirective,
} from '@fundamental-ngx/core/menu';
import { SplitButtonComponent } from '@fundamental-ngx/core/split-button';
import { ToolbarComponent } from '@fundamental-ngx/core/toolbar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [flexibleLayoutConfigProvider],
  standalone: true,
  imports: [
    FlexibleColumnLayoutComponent,
    NgTemplateOutlet,
    DashboardSidebarComponent,
    DynamicPageComponent,
    DynamicPageHeaderComponent,
    DynamicPageTitleContentComponent,
    InfoLabelComponent,
    DynamicPageGlobalActionsComponent,
    ToolbarComponent,
    ButtonComponent,
    ContentDensityDirective,
    SplitButtonComponent,
    MenuComponent,
    MenuItemComponent,
    MenuInteractiveComponent,
    MenuTitleDirective,
    IconComponent,
    DynamicPageSubheaderComponent,
    DynamicPageContentComponent,
    DashboardGridComponent,
    AsyncPipe,
    StatusInfoPopoverComponent,
  ],
})
export class DashboardComponent implements OnInit {
  layout: FlexibleColumnLayout = 'OneColumnStartFullScreen';
  sidebarEnabled = false;
  sidebarTitle = '';
  deletionToolTip = 'Delete';
  noDeletionToolTip =
    "Since this product contains compliance-relevant data, you can't delete it.";

  /**
   * Header that will be shown at the top of the dashboard
   */
  @Input() header!: Header;

  /**
   * Indicates whether to show the edit button
   */
  @Input() showEditButton = true;

  /**
   * Indicates whether to show the automate button
   */
  @Input() showAutomateButton = false;

  /**
   * Indicates whether to show the delete button
   */
  @Input() showDeleteButton = true;

  /**
   * List of custom buttons that will be shown in the dashboard
   */
  @Input() customButtons: CustomButton[] = [];

  /**
   * Required policies to use the actions
   */
  @Input() manageRequiredPolicies: string[] = ['projectAdmin'];

  /**
   * Text that will be shown for the button
   */
  @Input() secondaryButtonText = '';

  @Output() editClicked = new EventEmitter<void>();
  @Output() automateClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();
  @Output() secondaryButtonClicked = new EventEmitter<void>();

  constructor(private luigiContextService: IamLuigiContextService) {}

  ngOnInit(): void {
    this.luigiContextService.contextObservable().subscribe((context) => {
      const sidebar = context.context?.dashboard?.sidebar;
      if (sidebar && Object.keys(sidebar).length > 0) {
        this.sidebarEnabled = true;
        this.layout = 'TwoColumnsStartExpanded';
        this.sidebarTitle = sidebar.title || '';
      }
    });
  }

  /**
   * Set the wanted layout unless it is TwoColumnsMidExpanded.
   * "TwoColumnsMidExpanded" is the layout which happens when the dividing line between
   * the content and sidebar is clicked and we want to hide the sidebar in that case,
   * not expand it(what would have been the default behaviour).
   * @param layout The Fundamental Flexible Layout to set
   */
  layoutChange(layout: FlexibleColumnLayout) {
    if (layout === 'TwoColumnsMidExpanded') {
      this.layout = 'OneColumnStartFullScreen';
    } else {
      this.layout = layout;
    }
  }

  isLayoutFullscreen() {
    return this.layout === 'OneColumnStartFullScreen';
  }

  closeSidebar() {
    this.layout = 'OneColumnStartFullScreen';
  }

  showEditWithSecondaryButton(
    showEditButton: boolean,
    secondaryButtonText: string,
  ): boolean {
    return showEditButton && secondaryButtonText !== '';
  }

  showStandardEditButton(
    showEditButton: boolean,
    secondaryButtonText: string,
  ): boolean {
    return showEditButton && secondaryButtonText === '';
  }
}
