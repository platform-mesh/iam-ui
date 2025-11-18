import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ButtonComponent } from '@fundamental-ngx/core';
import { BusyIndicatorComponent } from '@fundamental-ngx/core/busy-indicator';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-sidebar-item',
  templateUrl: './dashboard-sidebar-item.component.html',
  styleUrls: ['./dashboard-sidebar-item.component.scss'],
  standalone: true,
  imports: [ButtonComponent, ContentDensityDirective, BusyIndicatorComponent],
})
export class DashboardSidebarItemComponent {
  collapsed = false;

  /**
   * The title of the sidebar item.
   */
  @Input({ required: true })
  title!: string;

  /**
   * Indicates whether the sidebar item is in a loading state.
   */
  @Input()
  loading = false;

  /**
   * Disables the edit button if set to `true`.
   */
  @Input()
  editDisabled = false;

  /**
   * List of roles allowed to trigger the callback action.
   */
  @Input()
  rolesAllowedForCallback: string[] = ['projectMember', 'projectAdmin'];

  /**
   * Emits an event when the edit action is triggered.
   */
  @Output()
  editCallback = new EventEmitter<void>();

  callbackDefined() {
    return this.editCallback.observed;
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
