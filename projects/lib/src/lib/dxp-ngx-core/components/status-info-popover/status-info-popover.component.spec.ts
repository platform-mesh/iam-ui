import { StatusInfo, StatusItem } from './models/status-info';
import { StatusInfoPopoverComponent } from './status-info-popover.component';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('StatusInfoPopoverComponent', () => {
  let component: StatusInfoPopoverComponent;
  let fixture: ComponentFixture<StatusInfoPopoverComponent>;
  let componentRef: ComponentRef<StatusInfoPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusInfoPopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusInfoPopoverComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('statusInfo', {
      items: [{ header: 'Item 1', status: 'negative', glyph: 'error' }],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedItem when statusInfo.items has one item', () => {
    const statusInfo: StatusInfo = {
      items: [
        {
          header: 'Item 1',
          status: 'negative',
          glyph: 'error',
          content: '',
        },
      ],
    };
    componentRef.setInput('statusInfo', statusInfo);
    fixture.detectChanges();

    expect(component.selectedItem).toEqual(statusInfo.items[0]);
  });

  it('should update selectedItem when selectItem is called', () => {
    const item: StatusItem = {
      content: '',
      header: 'Item 2',
      status: 'negative',
      glyph: 'warning',
    };

    component.selectItem(item);

    expect(component.selectedItem).toEqual(item);
  });
});
