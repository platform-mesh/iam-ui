import { Provider } from '@angular/core';
import { FD_FLEXIBLE_LAYOUT_CONFIG } from '@fundamental-ngx/core';

/** The default sidebar layout configuration from Fundamental
 * has a sidebar which is too wide. We change here one setting
 * to make the sidebar smaller, but we have to provide all
 * values.
 */
export const flexibleLayoutConfigProvider: Provider = {
  provide: FD_FLEXIBLE_LAYOUT_CONFIG,
  useValue: {
    layouts: {
      OneColumnStartFullScreen: { start: 100, mid: 0, end: 0 },
      OneColumnMidFullScreen: { start: 0, mid: 100, end: 0 },
      OneColumnEndFullScreen: { start: 0, mid: 0, end: 100 },
      // This layout setting shows a wide content area and narrow sidebar
      TwoColumnsStartExpanded: { start: 75, mid: 25, end: 0 },
      TwoColumnsMidExpanded: { start: 75, mid: 25, end: 0 },
      TwoColumnsEndExpanded: { start: 0, mid: 33, end: 67 },
      ThreeColumnsMidExpanded: { start: 25, mid: 50, end: 25 },
      ThreeColumnsEndExpanded: { start: 25, mid: 25, end: 50 },
      ThreeColumnsStartMinimized: { start: 0, mid: 50, end: 50 },
      ThreeColumnsEndMinimized: { start: 50, mid: 50, end: 0 },
    },
  },
};
