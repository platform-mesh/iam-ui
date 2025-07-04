import { StatusInfo, StatusItem } from '../../models';
import { Component, Input } from '@angular/core';
import { FundamentalNgxCoreModule } from '@fundamental-ngx/core';
import {
  BarComponent,
  BarElementDirective,
  BarLeftDirective,
  ButtonBarComponent,
} from '@fundamental-ngx/core/bar';
import {
  ObjectStatus,
  ObjectStatusComponent,
} from '@fundamental-ngx/core/object-status';
import {
  PopoverBodyHeaderDirective,
  PopoverComponent,
  PopoverControlComponent,
} from '@fundamental-ngx/core/popover';
import { TitleComponent } from '@fundamental-ngx/core/title';
import { FundamentalNgxPlatformModule } from '@fundamental-ngx/platform';

@Component({
  selector: 'app-status-info-popover',
  standalone: true,
  imports: [
    PopoverComponent,
    PopoverControlComponent,
    PopoverBodyHeaderDirective,
    BarComponent,
    ButtonBarComponent,
    BarElementDirective,
    BarLeftDirective,
    TitleComponent,
    ObjectStatusComponent,
    FundamentalNgxCoreModule,
    FundamentalNgxPlatformModule,
  ],
  templateUrl: './status-info-popover.component.html',
  styleUrl: './status-info-popover.component.scss',
})
export class StatusInfoPopoverComponent {
  selectedItem: StatusItem | null = null;
  protected statusInformation!: StatusInfo;

  /**
   * Sets the status information and determines the selected item.
   * If there is only one item in `statusInformation.items`, it is automatically selected; otherwise, no item is selected.
   *
   * @param value - The status information containing a list of items.
   */
  @Input({ required: true })
  set statusInfo(value: StatusInfo) {
    this.statusInformation = value;
    this.selectedItem =
      this.statusInformation.items.length === 1
        ? this.statusInformation.items[0]
        : null;
  }

  get glyph(): string {
    return (
      this.statusInformation.glyph || this.statusInformation.items[0]?.glyph
    );
  }

  get status(): ObjectStatus {
    return (
      this.statusInformation.status || this.statusInformation.items[0]?.status
    );
  }

  get label(): string {
    const { label, items } = this.statusInformation;
    return label ? `${label} (${items.length})` : items[0]?.header;
  }

  selectItem(item: StatusItem): void {
    this.selectedItem = item;
  }

  showItemList(): void {
    this.selectedItem = null;
  }
}
