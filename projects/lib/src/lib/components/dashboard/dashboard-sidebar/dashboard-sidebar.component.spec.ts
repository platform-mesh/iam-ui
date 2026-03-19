import { NodeWithLuigi } from '../dashboard-grid/models/node-with-luigi';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

describe('DashboardSidebarComponent', () => {
  let component: DashboardSidebarComponent;

  beforeEach(() => {
    component = new DashboardSidebarComponent();
  });

  describe('handle closing', () => {
    it('should emit close event', () => {
      // given
      const closeSpy = vi.spyOn(component.closeSidebar, 'emit');

      // when
      component.close();

      // then
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  // Handle slot changes
  describe('onSlotChange', () => {
    it('should set order to 9999 if layoutConfig is not present', () => {
      // given
      const node = document.createElement('div') as unknown as NodeWithLuigi;
      const layoutConfig = undefined;
      node._luigi_node = { layoutConfig };

      // when
      component.onSlotChange({
        target: { assignedNodes: () => [node] },
      } as unknown as Event);

      // then
      expect(node.style.order).toEqual('9999');
    });

    it('should set order to the provided value if layoutConfig is present', () => {
      // given
      const node = document.createElement('div') as unknown as NodeWithLuigi;
      const layoutConfig = { order: 42 };
      node._luigi_node = { layoutConfig };

      // when
      component.onSlotChange({
        target: { assignedNodes: () => [node] },
      } as unknown as Event);

      // then
      expect(node.style.order).toEqual('42');
    });
  });
});
