# Angular Reuse Library Common

## Helpers

Methods that can be reused in multiple micro frontends.

```ts
import { checkIfInVPN } from '@dxp/ngx-core/common';

function testBrowserIsInaVPNofSAP() {
  checkIfInVPN().then((inVpn) => {
    console.log(`The user is in ${inVpn}`);
  });
}
```

## ENV InjectionToken

Provides an `InjectionToken` for the environment that can be set by a dependent project, other parts can use
this `InjectionToken` to alter behavior e.g. for local development.
It is optional for the dependent project to provide this `InjectionToken`.

## Usage in dependent projects:

```ts
import { environment } from '../environments/environment';
import { ENV } from '@dxp/ngx-core/common';

@NgModule({
   ...
   providers: [
      ...
      { provide: ENV, useValue: environment },
   ],
})
export class AppModule {}
```

## Dependencies

- [ngx-dxp Luigi](../luigi/README.md)
