# Angular Reuse Library Luigi Support

Offers multiple services to interact with the Luigi Client.

## DXP Luigi Context Service

Provides the usual Luigi Context methods (get context synchronously or via a Promise or Observable), but with the
support for overriding using the ENV Context. For more information [see here](../common/README.md).
Note that the values will be merged unless they overlap.

To use the context overwrite feature, you have to use `DxpLuigiContextService` instead of `LuigiContextService`.

An example of the Luigi context being overwritten in the dependent project using the `ENV` `InjectionToken`
can be seen here:

```ts
// app.module.ts
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

//environment.ts
export const environment = {
   production: false,
   luigiContextOverwrite: {
       portalContext: {
         githubServiceApiUrl: 'http://localhost:9000/query',
      },
   },
};
```

## Luigi Client Service

Provides a proper Angular Injectable to get to the functionalities of
the [Luigi Client](https://github.com/SAP/luigi/blob/master/client/src/luigi-client.js).

## Luigi Dialog Util

Provides an easy way to manage Luigi Backdrops in association with Dialogs.

## Dependencies

- `@luigi-project/client`
- `@luigi-project/client-support-angular`
- `deepmerge`
