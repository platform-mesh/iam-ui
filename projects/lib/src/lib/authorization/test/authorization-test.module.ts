import { PolicyAdapter } from '../policy-adapter.service';
import { PolicyDirective } from '../policy.directive';
import { DEFAULT_POLICIES } from './authorization-di-tokens';
import { PolicyAdapterStub } from './policy-adapter.service.stub';
import { PolicyTestingController } from './policy-testing-controller.service';
import { ModuleWithProviders, NgModule } from '@angular/core';

const moduleMetadata = {
  providers: [
    PolicyAdapterStub,
    { provide: DEFAULT_POLICIES, useValue: [] },
    { provide: PolicyTestingController, useExisting: PolicyAdapterStub },
    { provide: PolicyAdapter, useExisting: PolicyAdapterStub },
  ],
  imports: [PolicyDirective],
  exports: [PolicyDirective],
};

/**
 * This module allows to specify the policies given to a user during test execution.
 * It provides a static `withDefaultPolicies(...)` function to pre-define policies for each test.
 * It also provides the `PolicyTestingController` that can be used to change policies during the test.
 * <br/><br/>
 * Use this module when testing components that make use of the `*requiredPolicies` directive (see `PolicyDirective`)
 */
/**
 * @deprecated Use standalone components directly
 * */
@NgModule({
  providers: [
    PolicyAdapterStub,
    { provide: DEFAULT_POLICIES, useValue: [] },
    { provide: PolicyTestingController, useExisting: PolicyAdapterStub },
    { provide: PolicyAdapter, useExisting: PolicyAdapterStub },
  ],
  imports: [PolicyDirective],
  exports: [PolicyDirective],
})
export class AuthorizationTestingModule {
  /**
   * Specify the policies given to a user during test execution.
   */
  static withDefaultPolicies(
    policies: string[],
  ): ModuleWithProviders<AuthorizationTestingModule> {
    const metadataWithDefaultPolicies = {
      ...moduleMetadata,
      providers: [
        ...moduleMetadata.providers,
        { provide: DEFAULT_POLICIES, useValue: policies },
      ],
    };
    return {
      ngModule: AuthorizationTestingModule,
      ...metadataWithDefaultPolicies,
    };
  }
}
