import { AddYourTeamCardComponent } from './add-your-team-card/add-your-team-card.component';
import { MembersSidebarComponent } from './members-sidebar/members-sidebar.component';
import { UserOverviewHeaderComponent } from './user-overview-header/user-overview-header.component';
import { Injector, inject } from '@angular/core';
import { ɵSharedStylesHost } from '@angular/platform-browser';
import { registerLuigiWebComponents } from '@platform-mesh/iam-lib';

export function initializeWC() {
  const injector = inject(Injector);

  injector.get(ɵSharedStylesHost).removeHost(document.head);

  registerLuigiWebComponents(
    {
      'add-your-team-action': AddYourTeamCardComponent,
      'members-sidebar': MembersSidebarComponent,
      'user-overview-header': UserOverviewHeaderComponent,
    },
    injector,
  );

  return () => undefined;
}
