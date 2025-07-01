import { NodeWithLuigi } from '../dashboard-grid/models/node-with-luigi';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ButtonComponent } from '@fundamental-ngx/core';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';
import {
  DynamicPageComponent,
  DynamicPageContentComponent,
  DynamicPageHeaderComponent,
  DynamicPageLayoutActionsComponent,
} from '@fundamental-ngx/core/dynamic-page';
import { ToolbarComponent } from '@fundamental-ngx/core/toolbar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dxp-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss'],
  standalone: true,
  imports: [
    DynamicPageComponent,
    DynamicPageHeaderComponent,
    DynamicPageLayoutActionsComponent,
    ToolbarComponent,
    ButtonComponent,
    ContentDensityDirective,
    DynamicPageContentComponent,
  ],
})
export class DashboardSidebarComponent {
  /**
   * Title that will be shown at the top of the sidebar
   */
  @Input()
  title!: string;

  /**
   * Emits an event when the sidebar needs to be closed.
   */
  @Output()
  closeSidebar = new EventEmitter<void>();

  close() {
    this.closeSidebar.emit();
  }

  onSlotChange($event: Event) {
    (
      ($event.target as HTMLSlotElement).assignedNodes() as NodeWithLuigi[]
    ).forEach((node) => {
      const layoutConfig = node?._luigi_node?.layoutConfig;
      node.setAttribute(
        'style',
        `
          order: ${layoutConfig?.order || 9999};
        `,
      );
    });
  }
}
