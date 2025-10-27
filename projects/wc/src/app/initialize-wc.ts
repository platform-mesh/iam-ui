import { MembersSidebarComponent } from './members-sidebar/members-sidebar.component';
import { UserOverviewHeaderComponent } from './user-overview-header/user-overview-header.component';
import { Injector, inject } from '@angular/core';
import { registerLuigiWebComponents } from '@platform-mesh/iam-lib';

export function initializeWC() {
  const source = import.meta.url;
  const injector = inject(Injector);

  registerLuigiWebComponents(
    {
      'members-sidebar': MembersSidebarComponent,
      'user-overview': UserOverviewHeaderComponent,
    },
    injector,
    source,
  );
}
