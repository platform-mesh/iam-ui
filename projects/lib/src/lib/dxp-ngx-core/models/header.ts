import { StatusInfo } from './status-info';
import { InfoLabelColorInput } from '@fundamental-ngx/core';

export interface Header {
  title: string;
  subtitle: string;
  keyInfo?: InfoLabel;
  statusInfo?: StatusInfo;
}

export interface InfoLabel {
  color?: InfoLabelColorInput;
  text: string;
}
