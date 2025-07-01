import { ObjectStatus } from '@fundamental-ngx/core/object-status';

export interface StatusInfo {
  label?: string;
  status?: ObjectStatus;
  glyph?: string;
  items: StatusItem[];
}

export interface StatusItem {
  header: string;
  content: string;
  status: ObjectStatus;
  glyph: string;
}
