/* eslint-disable @typescript-eslint/no-empty-function */
import { PolicyAdapter } from '../../authorization/policy-adapter.service';
import { Header } from '../../models';
import { PageHeaderComponent } from './page-header.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';

import spyOn = jest.spyOn;

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

describe('PageHeaderComponent', () => {
  const mouseEvent = { preventDefault: () => {} } as MouseEvent;
  const header: Header = { title: 'title', subtitle: 'subtitle' };
  let component: PageHeaderComponent;
  let policyAdapter: jest.Mocked<PolicyAdapter>;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    policyAdapter = mock();
    policyAdapter.getPolicies.mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
      providers: [{ provide: PolicyAdapter, useValue: policyAdapter }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
    component.header = header;
    fixture.detectChanges();
  });

  describe('headerVisibleStateChange', () => {
    it('should listen to headerVisibleStateChange event and adjust the page height and title wrap and set collapse state to collapsed', function () {
      // given
      component['adjustTitleAndHeaderHeight'] = jest.fn();

      // when
      // @ts-expect-error TODO: private field
      component.communicationXChangeNode?.dispatchEvent(
        new CustomEvent('headerVisibleStateChange', {
          detail: { state: false },
        }),
      );

      // then
      expect(component.subHeaderComponent.collapsed).toBeFalsy();
      expect(component['adjustTitleAndHeaderHeight']).toHaveBeenCalledWith(
        false,
      );
    });

    it('should listen to headerVisibleStateChange event and adjust the page height and title wrap and set collapse state to expanded', function () {
      // given
      component['adjustTitleAndHeaderHeight'] = jest.fn();

      // when
      // @ts-expect-error TODO: private field
      component.communicationXChangeNode?.dispatchEvent(
        new CustomEvent('headerVisibleStateChange', {
          detail: { state: true },
        }),
      );

      // then
      expect(component.subHeaderComponent.collapsed).toBeTruthy();
      expect(component['adjustTitleAndHeaderHeight']).toHaveBeenCalledWith(
        true,
      );
    });
  });

  describe('ngAfterViewInit', () => {
    it('should adjust page header height after view init', function () {
      // given
      component['resizeObserver'].observe = jest.fn();

      // when
      component.ngAfterViewInit();

      // then
      expect(component['resizeObserver'].observe).toHaveBeenCalledWith(
        component.pageHeader.nativeElement,
      );
    });
  });

  describe('titleClicked', () => {
    it('should dispatch custom title-click event', function () {
      // given
      spyOn(component['communicationXChangeNode']!, 'dispatchEvent');
      component.subHeaderComponent.collapsed = true;

      // when
      component.titleClicked(mouseEvent);

      // then
      expect(
        component['communicationXChangeNode']?.dispatchEvent,
      ).toHaveBeenCalledWith(
        new CustomEvent('title-click', {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: { state: false },
        }),
      );
    });
  });
});
