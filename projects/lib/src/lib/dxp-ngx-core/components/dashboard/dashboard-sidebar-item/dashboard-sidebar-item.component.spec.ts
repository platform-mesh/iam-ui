import { DashboardSidebarItemComponent } from './dashboard-sidebar-item.component';

describe('DashboardSidebarItemComponent', () => {
  let component: DashboardSidebarItemComponent;

  beforeEach(() => {
    component = new DashboardSidebarItemComponent();
  });

  it('should toggle collapsed', () => {
    // given
    component.collapsed = false;

    // when
    component.toggleCollapse();

    // then
    expect(component.collapsed).toBeTruthy();
  });

  describe('callback defined', () => {
    it('should return false if no callback is provided', () => {
      // when
      const result = component.callbackDefined();

      // then
      expect(result).toBeFalsy();
    });

    it('should return true if a callback is provided', () => {
      // given
      component.editCallback.subscribe();

      // when
      const result = component.callbackDefined();

      // then
      expect(result).toBeTruthy();
    });
  });
});
