import { IamLuigiContextService } from '../services/luigi';
import { PolicyObject } from './authorization.constants';
import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PolicyAdapter {
  private readonly policies: Observable<PolicyObject>;

  constructor(private luigiContextService: IamLuigiContextService) {
    this.policies = combineLatest([
      this.luigiContextService.contextObservable(),
    ]).pipe(
      map(([data]) => {
        const entityContext = data?.context?.entityContext || {};
        const userPolicies: string[] =
          Object.entries(entityContext)?.[0]?.[1]?.policies || [];
        const currentPolicyState = new PolicyObject();
        userPolicies.forEach((activePolicy) => {
          currentPolicyState[activePolicy] = true;
        });
        return currentPolicyState;
      }),
    );
  }

  getPolicies(): Observable<PolicyObject> {
    return this.policies;
  }
}
