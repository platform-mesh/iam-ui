import { IContextMessage, IamLuigiContextService } from '../../../services';
import { DashboardComponent } from './dashboard.component';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let luigiContextService: IamLuigiContextService;
  let component: DashboardComponent;

  beforeEach(() => {
    luigiContextService = MockService(IamLuigiContextService);

    component = new DashboardComponent(luigiContextService);
  });

  describe('ngOnInit', () => {
    it('should set sidebarEnabled to true and set layout to TwoColumnsStartExpanded if sidebar is present in context', function () {
      // given
      luigiContextService.contextObservable = () =>
        of({
          context: {
            dashboard: {
              sidebar: { title: 'sidebar title' },
            },
          },
        } as unknown as IContextMessage);

      // when
      component.ngOnInit();

      // then
      expect(component.sidebarEnabled).toBeTruthy();
      expect(component.layout).toEqual('TwoColumnsStartExpanded');
      expect(component.sidebarTitle).toEqual('sidebar title');
    });

    it('should set sidebarEnabled to false if sidebar is not present in context', function () {
      // given
      luigiContextService.contextObservable = () =>
        of({
          context: {
            dashboard: {},
          },
        } as unknown as IContextMessage);

      // when
      component.ngOnInit();

      // then
      expect(component.sidebarEnabled).toBeFalsy();
      expect(component.layout).toEqual('OneColumnStartFullScreen');
    });
  });

  describe('Handle layout', () => {
    it('should set layout to the provided value if the value is not TwoColumnsMidExpanded', function () {
      // given
      component.layout = 'TwoColumnsStartExpanded';
      const layout = 'ThreeColumnsStartMinimized';

      // when
      component.layoutChange(layout);

      // then
      expect(component.layout).toEqual(layout);
    });

    it('should set layout to OneColumnStartFullScreen if the value is TwoColumnsMidExpanded', function () {
      // given
      component.layout = 'ThreeColumnsStartMinimized';
      const layout = 'TwoColumnsMidExpanded';

      // when
      component.layoutChange(layout);

      // then
      expect(component.layout).toEqual('OneColumnStartFullScreen');
    });

    it('should set layout to TwoColumnsStartExpanded', function () {
      // when
      component.closeSidebar();

      // then
      expect(component.layout).toEqual('OneColumnStartFullScreen');
    });
  });

  describe('Handle buttons', () => {
    it('should return true if showEditButton is true and secondaryButtonText is a string', function () {
      // given
      const showEditButton = true;
      const secondaryButtonText = 'secondary button text';

      // when
      const result = component.showEditWithSecondaryButton(
        showEditButton,
        secondaryButtonText,
      );

      // then
      expect(result).toBeTruthy();
    });

    it('should return false if showEditButton is false', function () {
      // given
      const showEditButton = false;
      const secondaryButtonText = 'secondary button text';

      // when
      const result = component.showEditWithSecondaryButton(
        showEditButton,
        secondaryButtonText,
      );

      // then
      expect(result).toBeFalsy();
    });

    it('should return false if secondaryButtonText is an empty string', function () {
      // given
      const showEditButton = true;
      const secondaryButtonText = '';

      // when
      const result = component.showEditWithSecondaryButton(
        showEditButton,
        secondaryButtonText,
      );

      // then
      expect(result).toBeFalsy();
    });

    it('should return false if secondaryButtonText is not a string', function () {
      // given
      const showEditButton = true;
      const secondaryButtonText = 123;

      // when
      const result = component.showEditWithSecondaryButton(
        showEditButton,
        secondaryButtonText as unknown as string,
      );

      // then
      expect(result).toBeFalsy();
    });

    it('should return true if showEditButton is true and secondaryButtonText is an empty string', function () {
      // given
      const showEditButton = true;
      const secondaryButtonText = '';

      // when
      const result = component.showStandardEditButton(
        showEditButton,
        secondaryButtonText,
      );

      // then
      expect(result).toBeTruthy();
    });

    it('should return true if showEditButton is true and secondaryButtonText is not a string', function () {
      // given
      const showEditButton = true;
      const secondaryButtonText = 123;

      // when
      const result = component.showStandardEditButton(
        showEditButton,
        secondaryButtonText as unknown as string,
      );

      // then
      expect(result).toBeTruthy();
    });
  });
});
