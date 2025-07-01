import { inject } from '@angular/core';
import { AnalyticsTrackerService } from '@dxp/iam-lib';

export function initializeMatomo(): () => void {
  const analyticsTrackerService = inject(AnalyticsTrackerService);
  analyticsTrackerService.injectScript().then((_) => undefined);
  return () => undefined;
}
