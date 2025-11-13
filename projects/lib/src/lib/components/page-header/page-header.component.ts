import { CustomButton, Header } from '../../models';
import { StatusInfoPopoverComponent } from '../status-info-popover';
import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ContentDensityDirective } from '@fundamental-ngx/core/content-density';
import {
  DynamicPageComponent,
  DynamicPageGlobalActionsComponent,
  DynamicPageHeaderComponent,
  DynamicPageSubheaderComponent,
  DynamicPageTitleContentComponent,
} from '@fundamental-ngx/core/dynamic-page';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import {
  MenuComponent,
  MenuInteractiveComponent,
  MenuItemComponent,
  MenuTitleDirective,
} from '@fundamental-ngx/core/menu';
import { SplitButtonComponent } from '@fundamental-ngx/core/split-button';
import { ToolbarComponent } from '@fundamental-ngx/core/toolbar';
import { ButtonComponent } from '@fundamental-ngx/platform';

/**
 * @deprecated
 * Please use the Dashboard Module instead to create dashboard pages
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-page-header[header]',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  standalone: true,
  imports: [
    DynamicPageComponent,
    DynamicPageHeaderComponent,
    DynamicPageTitleContentComponent,
    InfoLabelComponent,
    StatusInfoPopoverComponent,
    DynamicPageGlobalActionsComponent,
    ToolbarComponent,
    ButtonComponent,
    ContentDensityDirective,
    SplitButtonComponent,
    MenuComponent,
    MenuItemComponent,
    MenuInteractiveComponent,
    MenuTitleDirective,
    DynamicPageSubheaderComponent,
    AsyncPipe,
  ],
})
export class PageHeaderComponent implements OnInit, AfterViewInit {
  @Input() header!: Header;
  @Input() showEditButton = true;
  @Input() showAutomateButton = false;
  @Input() showDeleteButton = true;
  /**
   * Custom buttons which will be displayed in the Header
   */
  @Input() customButtons: CustomButton[] = [];
  @Input() manageRequiredPolicies: string[] = ['projectAdmin'];
  @Input() secondaryButtonText = '';
  @Output() editClicked = new EventEmitter<void>();
  @Output() automateClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();
  @Output() secondaryButtonClicked = new EventEmitter<void>();

  protected wrapTitle = true;
  private prevSubheaderSize!: number;
  private communicationXChangeNode: Node | HTMLElement | null | undefined;

  @ViewChild('dynamicPage', { read: ElementRef })
  dynamicPage!: ElementRef<HTMLElement>;
  @ViewChild('pageHeader', { read: ElementRef })
  pageHeader!: ElementRef<HTMLElement>;
  @ViewChild('subHeader', { read: ElementRef })
  subHeader!: ElementRef<HTMLElement>;
  @ViewChild('subHeader')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subHeaderComponent: any;

  private resizeObserver = new ResizeObserver(() => {
    this.adjustTitleAndHeaderHeight(this.subHeaderComponent.collapsed);
  });

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.communicationXChangeNode = (
      this.elementRef.nativeElement.getRootNode() as ShadowRoot
    )?.host?.parentNode;

    if (!this.communicationXChangeNode) {
      this.communicationXChangeNode =
        this.elementRef.nativeElement.parentElement?.parentElement;
    }

    if (this.communicationXChangeNode) {
      this.communicationXChangeNode.addEventListener(
        'headerVisibleStateChange',
        (event: Event) => {
          this.subHeaderComponent.collapsed = (
            event as CustomEvent
          ).detail.state;
          this.adjustTitleAndHeaderHeight(this.subHeaderComponent.collapsed);
        },
      );
    }
  }

  ngAfterViewInit(): void {
    this.resizeObserver.observe(this.pageHeader.nativeElement);
  }

  private adjustTitleAndHeaderHeight(collapsed: boolean) {
    const headerSize = this.pageHeader.nativeElement.offsetHeight;
    if (collapsed) {
      this.dynamicPage.nativeElement.style.height = `${headerSize}px`;
      this.wrapTitle = false;
    } else {
      this.prevSubheaderSize =
        this.subHeader.nativeElement.offsetHeight || this.prevSubheaderSize;
      this.dynamicPage.nativeElement.style.height = `${
        headerSize + this.prevSubheaderSize
      }px`;
      this.wrapTitle = true;
    }
  }

  showEditWithSecondaryButton(
    showEditButton: boolean,
    secondaryButtonText: string,
  ): boolean {
    return (
      showEditButton &&
      typeof secondaryButtonText === 'string' &&
      secondaryButtonText !== ''
    );
  }

  showStandardEditButton(
    showEditButton: boolean,
    secondaryButtonText: string,
  ): boolean {
    return (
      showEditButton &&
      (secondaryButtonText === '' || typeof secondaryButtonText !== 'string')
    );
  }

  editButtonClicked() {
    this.editClicked.emit();
  }

  secondaryEditButtonClicked() {
    this.secondaryButtonClicked.emit();
  }

  automateButtonClicked() {
    this.automateClicked.emit();
  }

  deleteButtonClicked() {
    this.deleteClicked.emit();
  }

  titleClicked(event: MouseEvent) {
    event.preventDefault();
    if (this.communicationXChangeNode) {
      this.communicationXChangeNode.dispatchEvent(
        new CustomEvent('titleClicked', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: { state: !this.subHeaderComponent.collapsed },
        }),
      );
    }

    this.adjustTitleAndHeaderHeight(!this.subHeaderComponent.collapsed);
  }
}
