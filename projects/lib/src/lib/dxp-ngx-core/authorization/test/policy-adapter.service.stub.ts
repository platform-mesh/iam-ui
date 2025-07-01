import { PolicyObject } from '../authorization.constants';
import { DEFAULT_POLICIES } from './authorization-di-tokens';
import { PolicyTestingController } from './policy-testing-controller.service';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class PolicyAdapterStub implements PolicyTestingController {
  private readonly projectPoliciesSubject: BehaviorSubject<PolicyObject>;

  constructor() {
    this.projectPoliciesSubject = new BehaviorSubject({});
    this.setPolicies(inject(DEFAULT_POLICIES));
  }

  private setPolicies(policies: string[]): void {
    const policiesUsedForTest = new PolicyObject();
    policies.forEach((p) => {
      policiesUsedForTest[p] = true;
    });
    this.projectPoliciesSubject.next(policiesUsedForTest);
  }

  getPolicies(): Observable<PolicyObject> {
    return this.projectPoliciesSubject;
  }

  setPoliciesForTest(policiesForTest: string[]): void {
    this.setPolicies(policiesForTest);
  }
}
