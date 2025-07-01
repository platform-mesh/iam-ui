import { MemberService } from '../../services/member.service';
import { DxpLuigiContextService } from '../services/luigi';
import { PolicyObject } from './authorization.constants';
import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PolicyAdapter {
  private readonly policies: Observable<PolicyObject>;

  constructor(
    private luigiContextService: DxpLuigiContextService,
    private memberService: MemberService,
  ) {
    this.policies = combineLatest([
      this.memberService.currentEntity(),
      this.luigiContextService.contextObservable(),
    ]).pipe(
      map(([entity, data]) => {
        const entityContext = data?.context?.entityContext;
        const userPolicies: string[] = entityContext?.[entity]?.policies || [];
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
