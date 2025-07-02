import { AddMemberDialogComponent } from './micro-frontend/pages/add-member-dialog/add-member-dialog.component';
import { MembersPageComponent } from './micro-frontend/pages/members-page/members-page.component';
import { Routes } from '@angular/router';
import { LuigiPreloadComponent } from '@luigi-project/client-support-angular';

export const routes: Routes = [
  {
    path: 'preload',
    component: LuigiPreloadComponent,
  },
  {
    path: 'entity/:entityId/members',
    component: MembersPageComponent,
  },
  {
    path: 'entity/:entityId/add-members',
    component: AddMemberDialogComponent,
  },
];
