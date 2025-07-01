import { Injectable } from '@angular/core';

@Injectable()
export abstract class PolicyTestingController {
  abstract setPoliciesForTest(policiesForTest: string[]): void;
}
