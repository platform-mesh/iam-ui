# Analytics Tracker service (currently no tracker is used)

> Note: This package currently does not deliver any analytics capabilities!
> Originally [Pendo](https://support.pendo.io/) was used as an analytics tracker service in the background but it was decided to not use Pendo anymore.
> Until there is a replacement and final decision on what other tracker(s) to offer, this package will remain empty / without injection of any tracker.
> The package is kept in the repository to avoid breaking changes in the micro frontends that use it.

This package contains a service to enable arbitrary Analytics Tracker for DXP micro frontends by default.

## Usage in Micro Frontend

In the micro-frontends import the `AnalyticsTrackerService` which provides a `injectScript()` method.
It is suggested to use this service as early as possible in the micro frontends lifecycle.
So the following example shows how to add the script of any analytics tracker immediately after the bootstrap of the (Angular) micro frontend:

```ts
import { AnalyticsTrackerService } from '@dxp/ngx-core/analytics-tracker';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((ref) => {
    const analyticsTrackerService = ref.injector.get(AnalyticsTrackerService);
    analyticsTrackerService.injectScript().catch((err) => console.error(err));
  })
  .catch((err) => console.error(err));
```
