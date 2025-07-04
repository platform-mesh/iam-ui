import { DxpIContextMessage, IamLuigiContextService } from '../../../services';
import { DashboardGridComponent } from './dashboard-grid.component';
import { DashboardGridSection } from './models/dashboard-grid-section';
import { NodeWithLuigi } from './models/node-with-luigi';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';

describe('DashboardGridComponent', () => {
  let luigiContextService: IamLuigiContextService;
  let component: DashboardGridComponent;

  beforeEach(() => {
    luigiContextService = MockService(IamLuigiContextService);
    component = new DashboardGridComponent(luigiContextService);
  });

  describe('ngOnInit', () => {
    it('should handle sections', () => {
      // given
      const sections: DashboardGridSection[] = [
        {
          id: 'foo',
          displayName: 'bar',
        },
        {
          id: 'baz',
          displayName: 'blub',
        },
      ];

      luigiContextService.contextObservable = () =>
        of({
          context: {
            dashboard: {
              sections,
            },
          },
        } as unknown as DxpIContextMessage);

      // when
      component.ngOnInit();

      // then
      expect(component.sections).toEqual(sections);
    });
  });

  describe('handle slot changes', () => {
    it('should show section if at least one node is assigned to it', () => {
      // given
      const event = {
        target: {
          assignedNodes: () => [document.createElement('div')],
        },
      } as unknown as Event;
      const sectionId = 'foo';

      // when
      component.sectionSlotchange(event, sectionId);

      // then
      expect(component.showSection.get(sectionId)).toBeTruthy();
    });

    it('should not show section if no node is assigned to it', () => {
      // given
      const event = {
        target: {
          assignedNodes: () => [],
        },
      } as unknown as Event;
      const sectionId = 'foo';

      // when
      component.sectionSlotchange(event, sectionId);

      // then
      expect(component.showSection.get(sectionId)).toBeFalsy();
    });

    it('should assign grid styles to each node', () => {
      // given
      const node = document.createElement('div');
      const layoutConfig = {
        row: '1',
        column: '2',
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any)._luigi_node = {
        layoutConfig,
      };

      // when
      component.assignGridStylesToEachNode(node as unknown as NodeWithLuigi);

      // then
      expect(node.getAttribute('style')).toEqual(
        `
          height: auto;
          grid-row: 1;
          grid-column: 2;
          order: 9999;
        `,
      );
    });
  });
});
