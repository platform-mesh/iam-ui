import { EventEmitter } from '@angular/core';
import { ButtonType } from '@fundamental-ngx/core';
import { Subject } from 'rxjs';

/**
 * A custom button to be displayed in the header.
 */
export interface CustomButton {
  /**
   * If the button should be displayed or not. This can be used e.g.
   * for hiding the button if a user is not an administrator of a project.
   */
  show: Subject<boolean>;
  /**
   * Button type per Fundamental Button types
   */
  type: ButtonType;
  /**
   * Text of the button
   */
  label: string;
  /**
   * The testid attribute which will be used by E2E tests
   */
  testId: string;
  /**
   * The Event Emitter which will emit each time the button is pressed.
   * Subscribe to this method to react on button presses.
   */
  callback: EventEmitter<void>;
}
