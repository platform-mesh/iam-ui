import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

type PolicyDirectiveOperation = 'and' | 'or';

@Directive({
  selector: '[requiredPolicies]',
  standalone: true,
})
export class PolicyMockDirective {
  @Input()
  requiredPolicies!: string[] | string;

  @Input()
  requiredPoliciesOperator!: PolicyDirectiveOperation;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
  ) {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
