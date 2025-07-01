import { TestUtils } from '../../dxp-ngx-core/test';
import { PolicyDirective } from './policy.directive';
import { AuthorizationTestingModule } from './test/authorization-test.module';
import { PolicyTestingController } from './test/policy-testing-controller.service';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  template: `
    <h1 id="without-policy-directive">Element</h1>
    <h1 *dxpRequiredPolicies="''" id="empty-policy">Element</h1>
    <h1 *dxpRequiredPolicies="'aPolicy'" id="requires-one-policy">Element</h1>
    <h1
      *dxpRequiredPolicies="['aPolicy', 'anotherPolicy']"
      id="requires-more-policies"
    >
      Element
    </h1>
    <h1 *dxpRequiredPolicies="['!aNegatedPolicy']" id="requires-negated-policy">
      Element
    </h1>
    <h1
      *dxpRequiredPolicies="['aNotNegatedPolicy', '!aNegatedPolicy']"
      id="requires-normal-and-negated-policy"
    >
      Element
    </h1>
    <h1
      *dxpRequiredPolicies="
        ['aOptionalPolicy', 'anotherOptionalPolicy'];
        operator: 'or'
      "
      id="requires-or"
    >
      Element
    </h1>
    <h1
      *dxpRequiredPolicies="
        ['!aNegatedOptionalPolicy', 'aNonNegatedOptionalPolicy'];
        operator: 'or'
      "
      id="requires-or-negated"
    >
      Element
    </h1>
  `,
  standalone: true,
  imports: [PolicyDirective],
})
class UsingPolicyDirectiveComponent {}

let fixture: ComponentFixture<UsingPolicyDirectiveComponent>;
let policyTestingController: PolicyTestingController;

beforeEach(() => {
  fixture = TestBed.configureTestingModule({
    imports: [UsingPolicyDirectiveComponent, AuthorizationTestingModule],
  }).createComponent(UsingPolicyDirectiveComponent);
});

beforeEach(() => {
  policyTestingController = TestBed.inject(PolicyTestingController);
});

it('should not display elements for which policies are not given', async () => {
  await triggerPolicyUpdate([]);

  expect(element('#without-policy-directive')).toBeTruthy();
  expect(element('#requires-one-policy')).toBeNull();
  expect(element('#requires-more-policies')).toBeNull();
});

it('should display elements that require no or one policy', async () => {
  await triggerPolicyUpdate(['aPolicy']);

  expect(element('#without-policy-directive')).toBeTruthy();
  expect(element('#requires-one-policy')).toBeTruthy();
  expect(element('#requires-more-policies')).toBeNull();
});

it('should display elements that require multiple policies', async () => {
  await triggerPolicyUpdate(['aPolicy', 'anotherPolicy']);

  expect(element('#without-policy-directive')).toBeTruthy();
  expect(element('#requires-one-policy')).toBeTruthy();
  expect(element('#requires-more-policies')).toBeTruthy();
});

it('should not display elements for empty policy', async () => {
  await triggerPolicyUpdate([]);

  expect(element('#empty-policy')).toBeNull();
});

it('should display elements for negated policy that is not present', async () => {
  await triggerPolicyUpdate([]);

  expect(element('#requires-negated-policy')).toBeTruthy();
});

it('should NOT display elements for negated policy that is present', async () => {
  await triggerPolicyUpdate(['aNegatedPolicy']);

  expect(element('#requires-negated-policy')).toBeNull();
});

it('should display elements for mixed negated and non-negated policy when non-negated policy is given', async () => {
  await triggerPolicyUpdate(['aNotNegatedPolicy']);

  expect(element('#requires-negated-policy')).toBeTruthy();
  expect(element('#requires-normal-and-negated-policy')).toBeTruthy();
});

it('should NOT display elements for mixed negated and non-negated policy when negated policy is given', async () => {
  await triggerPolicyUpdate(['aNotNegatedPolicy', 'aNegatedPolicy']);

  expect(element('#requires-negated-policy')).toBeNull();
  expect(element('#requires-normal-and-negated-policy')).toBeNull();
});

it('should display elements for optional policies', async () => {
  await triggerPolicyUpdate(['aOptionalPolicy']);
  expect(element('#requires-or')).toBeTruthy();

  await triggerPolicyUpdate(['anotherOptionalPolicy']);
  expect(element('#requires-or')).toBeTruthy();

  await triggerPolicyUpdate(['aOptionalPolicy', 'anotherOptionalPolicy']);
  expect(element('#requires-or')).toBeTruthy();
});

it('should NOT display elements for  empty optional policies', async () => {
  await triggerPolicyUpdate([]);

  expect(element('#requires-or')).toBeNull();
});

it('should display elements for negated empty optional policies', async () => {
  await triggerPolicyUpdate(['aNegatedOptionalPolicy']);
  expect(element('#requires-or-negated')).toBeNull();

  await triggerPolicyUpdate([]);
  expect(element('#requires-or-negated')).toBeTruthy();

  await triggerPolicyUpdate(['aNonNegatedOptionalPolicy']);
  expect(element('#requires-or-negated')).toBeTruthy();

  await triggerPolicyUpdate([
    'aNegatedOptionalPolicy',
    'aNonNegatedOptionalPolicy',
  ]);
  expect(element('#requires-or-negated')).toBeTruthy();
});

async function triggerPolicyUpdate(policiesForTest: string[]): Promise<void> {
  policyTestingController.setPoliciesForTest(policiesForTest);

  // TODO issue-464. Is there a different way to trigger the rendering in the test?
  fixture.detectChanges();
  await fixture.whenRenderingDone();
}

function element(querySelector: string): HTMLElement {
  return TestUtils.querySelector(fixture, querySelector);
}
