import { Component, HostListener, Input, ViewChild } from '@angular/core';
import {
  IconComponent,
  LinkComponent,
  PopoverBodyComponent,
  PopoverComponent,
  PopoverControlComponent,
} from '@fundamental-ngx/core';

@Component({
  selector: 'app-info-popup',
  standalone: true,
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.css'],
  imports: [
    PopoverComponent,
    PopoverControlComponent,
    LinkComponent,
    IconComponent,
    PopoverBodyComponent,
  ],
})
export class InfoPopupComponent {
  @ViewChild(PopoverBodyComponent)
  popover!: PopoverBodyComponent;
  @Input() helpIcon!: boolean;
  @HostListener('click', ['$event'])
  public onClick(event: Event): void {
    event.stopPropagation();
  }

  public isOpenChange(isOpen: boolean) {
    if (isOpen) {
      setTimeout(() => {
        this.popover._focusFirstTabbableElement();
      }, 0);
    }
  }
}
