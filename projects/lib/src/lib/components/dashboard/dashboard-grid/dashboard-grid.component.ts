import { DxpIContextMessage, IamLuigiContextService } from '../../../services';
import { DashboardGridSection } from './models/dashboard-grid-section';
import { NodeWithLuigi } from './models/node-with-luigi';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-grid',
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.scss'],
  standalone: true,
})
export class DashboardGridComponent implements OnInit {
  sections: DashboardGridSection[] = [];
  showSection = new Map<string, boolean>();

  constructor(private luigiContextService: IamLuigiContextService) {}

  ngOnInit(): void {
    this.luigiContextService
      .contextObservable()
      .subscribe((context: DxpIContextMessage) => {
        const sections = context.context?.dashboard?.sections;
        if (sections?.length > 0) {
          this.sections = sections;
          // Mark all sections as hidden until at least one node is assigned to them
          this.showSection = this.sections.reduce((acc, section) => {
            acc.set(section.id, false);
            return acc;
          }, new Map<string, boolean>());
        }
      });
  }

  sectionSlotchange($event: Event, sectionId: string) {
    const nodes = ($event.target as HTMLSlotElement).assignedNodes();
    // Show the section if at least one node is assigned to it
    this.showSection.set(sectionId, nodes.length > 0);
    nodes.forEach((node) => {
      this.assignGridStylesToEachNode(node as NodeWithLuigi);
    });
  }

  slotchange($event: Event) {
    ($event.target as HTMLSlotElement).assignedNodes().forEach((node) => {
      this.assignGridStylesToEachNode(node as NodeWithLuigi);
    });
  }

  assignGridStylesToEachNode(node: NodeWithLuigi) {
    const layoutConfig = node?._luigi_node?.layoutConfig;

    if (layoutConfig) {
      node.setAttribute(
        'style',
        `
          height: auto;
          grid-row: ${layoutConfig.row || 'auto'};
          grid-column: ${layoutConfig.column || 'auto'};
          order: ${layoutConfig.order || 9999};
        `,
      );
    }
  }
}
