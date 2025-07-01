import { ButtonType } from '@fundamental-ngx/core';

export interface CardAction {
  text: string;
  tooltip?: string;
  fdType: ButtonType;
  disabled?: boolean;
  clickCallback?: () => void;
  testId?: string;
}

export interface HelpLink {
  link: string;
  tooltip?: string;
}
