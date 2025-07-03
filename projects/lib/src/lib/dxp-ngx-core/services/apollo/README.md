# Angular Reuse Library Apollo Client

This package provides an Apollo Client for each GraphQL Service in DXP. Each client offers a
method `apollo(): Observable<ApolloBase>`, the returned observable fires only once, the returned `ApolloBase` can be
used the start queries or mutations, the authorization header and the API url are already set.

## Using the services

Import the correct ApolloClientService for your use case from `@dxp/ngx-core/apollo`, e.g.:

```ts
import { Injectable } from '@angular/core';
import { GithubApolloClientService } from '@dxp/ngx-core/apollo';

@Injectable({
  providedIn: 'root',
})
export class SomeService {
  constructor(private githubApolloClient: GithubApolloClientService) {}

  someMethod() {
    this.githubApolloClient.apollo().subscribe((apolloClient) => {
      apolloClient.query();
      // ...
    });
  }
}
```

It is also possible to build Apollo clients for other services, for this the `BaseApolloClientService` has to be
extended, e.g.:

```ts
import { BaseApolloClientService } from './base-apollo-client.service';
import { Injectable, Injector } from '@angular/core';
import { FrameContext } from '@dxp/ngx-core/luigi';

@Injectable({
  providedIn: 'root',
})
export class WaasApolloClientService extends BaseApolloClientService {
  constructor(injector: Injector) {
    super(injector, 'waas');
  }

  protected getApiUrl(
    portalContext: FrameContext,
    serviceProviderConfig: Record<string, string>,
  ): string {
    return serviceProviderConfig.waasApiUrl;
  }
}
```

## Dependencies

- `@apollo/client`
- `@luigi-project/client-support-angular`
- `apollo-angular`
- `rxjs`
- [ngx-dxp Luigi](../luigi/README.md)
- [ngx-dxp Common](../common/README.md)
