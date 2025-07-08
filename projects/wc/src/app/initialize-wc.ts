import { AddYourTeamCardComponent } from './add-your-team-card/add-your-team-card.component';
import { MembersSidebarComponent } from './members-sidebar/members-sidebar.component';
import { UserOverviewHeaderComponent } from './user-overview-header/user-overview-header.component';
import { Injector, inject } from '@angular/core';
import { registerLuigiWebComponents } from '@platform-mesh/iam-lib';

export function initializeWC() {
  const source = import.meta.url;
  const injector = inject(Injector);

  registerLuigiWebComponents(
    {
      'add-your-team-action': AddYourTeamCardComponent,
      'members-sidebar': MembersSidebarComponent,
      'user-overview-header': UserOverviewHeaderComponent,
    },
    injector,
    source,
  );
}
