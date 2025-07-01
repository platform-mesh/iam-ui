import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

type PolicyDirectiveOperation = 'and' | 'or';

@Directive({
  selector: '[dxpRequiredPolicies]',
  standalone: true,
})
export class PolicyMockDirective {
  @Input()
  dxpRequiredPolicies: string[] | string;

  @Input()
  dxpRequiredPoliciesOperator: PolicyDirectiveOperation;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
