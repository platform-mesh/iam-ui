# Angular Reuse Library Luigi WebComponent Support

This package provides a function to register Angular Components as WebComponents with Luigi:

```ts
import {registerLuigiWebComponent} from '@dxp/ngx-core/luigi-webcomponent';
import {DoBootstrap, Injector, NgModule} from '@angular/core';

@NgModule({
    declarations: [MembersCardComponent],
    imports: [
        ...your normal imports...
    ],
    providers: [],
})
export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
    }

    ngDoBootstrap(): void {
        registerLuigiWebComponent(MembersCardComponent, this.injector);
    }
}
```

It is also possible to register multiple web components from one Angular project:

```ts
import {registerLuigiWebComponents} from '@dxp/ngx-core/luigi-webcomponent';
import {DoBootstrap, Injector, NgModule} from '@angular/core';

@NgModule({
    declarations: [MembersCardComponent, MembersCardComponent2],
    imports: [
        ...your normal imports...
    ],
    providers: [],
})
export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
    }

    ngDoBootstrap(): void {
        registerLuigiWebComponents(
            {
                'members-card': MembersCardComponent,
                'members-card-component': MembersCardComponent2,
            },
            this.injector
        );
    }
}
```

To define which web component is shown where, you can set the hash of the `urlSuffix` in the cdm.json:

```json
{
  "nodes": [
    {
      "entityType": "project.overview::compound",
      "pathSegment": "members-card",
      "urlSuffix": "/main.js#members-card",
      "layoutConfig": {
        "slot": "content",
        "column": "1 / span 2"
      },
      "webcomponent": {
        "selfRegistered": true
      }
    },
    {
      "entityType": "component.overview::compound",
      "pathSegment": "members-card",
      "urlSuffix": "/main.js#members-card-component",
      "layoutConfig": {
        "slot": "content",
        "column": "1 / span 2"
      },
      "webcomponent": {
        "selfRegistered": true
      }
    }
  ]
}
```

## Dependencies

- `@angular/elements`
