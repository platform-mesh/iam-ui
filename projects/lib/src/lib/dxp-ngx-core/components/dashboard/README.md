# Angular Reuse Dashboard Component

## `DxpDashboardModule`

The Reusable dashboard component enables the creation of dashboards which allow you to provide overview pages
like the one available on a project or components overview screen.

These overview pages provide the flexibility of showing live bite-size pieces of data organized in a grid
with an optional header and sidebar.

### Quick Start

In a nutshell:

- define a dashboard container
- provide an optional header (with title and needed buttons) and its contents
- define optional sections for the dashboard grid elements
- define an optional sidebar for dashboard sidebar elements

For dashboard grid elements:

- define Web Components with a `layoutConfig` `slot` property of `content`
  - if a Web Component should appear in a section, define the `slot` property with the `id` of the section

For dashboard sidebar elements:

- define Web Components with a `layoutconfig` `slot` property of `sidebar`

### In-depth

#### Dashboard container

Since the dashboards rely on [Luigi compound Web Component](https://docs.luigi-project.io/docs/web-component?section=compound-web-components),
they have to be created as Web Components which use the provided [Angular dashboard component](./components/dashboard/dashboard.component.ts).

To create a dashboard page, create an Angular Elements Web Component which will be the dashboard container and use this reusable dashboard component to register it as a Luigi Node.

Dashboard page:

```html
<dxp-dashboard></dxp-dashboard>
```

Luigi Node:

```json
{
  "entityType": "dashboard-parent",
  "defineEntity": {
    "id": "my-dashboard"
  },
  "label": "My Dashboard",
  "pathSegment": "my-dashboard",
  "urlSuffix": "/main.js#my-dashboard",
  "compound": {},
  "webcomponent": {
    "selfRegistered": true
  }
}
```

The dashboard will be represented as a grid of elements where it is possible to define the order at which the card should appear, but also it's size relatively to the grid as would be defined by CSS grid. Both of these can be defined in the `layoutConfig` property.

Here is how you would define a provided Web Component as an element of the dashboard grid by defining an entityType of `dashboard-parent.my-dashboard::compound`.

```json
{
  "entityType": "dashboard-parent.my-dashboard::compound",
  "pathSegment": "my-grid-element",
  "urlSuffix": "/main.js#my-grid-element",
  "layoutConfig": {
    "slot": "content",
    "order": 1
  },
  "webcomponent": {
    "selfRegistered": true
  }
}
```

We recommend providing [Fundamental Cards](https://sap.github.io/fundamental-ngx/#/core/card) as Web Components for the dashboard. For specialized cases, we provide wrappers [Action Card](../action-card/README.md) and [Bookmark Card](../bookmark-card/README.md).

#### Dashboard header and subheader

Since the dashboard is based on [Fundamental Dynamic Page](https://sap.github.io/fundamental-ngx/#/core/dynamic-page), it is easily possible to have a header with a subheader.

##### Header

If you want to have a header in the dashboard view, a [header](./components/dashboard/models/header.ts) Input property has to be provided to DashboardComponent. The header will automatically have the 2 standard controls: collapsing and pinning. Additionally, if a sidebar is defined, the header will get a button to open the sidebar if it should be closed.

This [header](./components/dashboard/models/header.ts) Input property contains the `title` and `subtitle` property of the header. It also allows for the definition of a key information to be shown next to the title.

Additionally, it is possible to have a plethora of buttons in the header by using the following Input properties:

- `manageRequiredPolicies` - define which user permissions are allowed to see and use the following buttons
- `showEditButton` (boolean) and `editClicked` (EventEmitter) - show a button titled Edit which will emit on `editClicked`
  - `secondaryButtonText` (boolean) and `secondaryButtonClicked` (EventEmitter) - change the Edit Button to a [Menu Button](https://sap.github.io/fundamental-ngx/#/core/button#menu) where the new dropdown button will react on `secondaryButtonClicked`
- `showAutomateButton` (boolean) and `automateClicked` (EventEmitter) - show a button titled Automate which will emit on `automateClicked`
- `showDeleteButton` (boolean) and `deleteClicked` (EventEmitter) - show a button titled Delete which will emit on `deleteClicked`
- `customButtons` (array of [Custom Buttons](./components/dashboard/models/custom-button.ts)) - allows you to define as many additional custom buttons you need where each button's appearance and showing can be controlled with the ability to also define Event Emitters for each button individually

##### Subheader

**Important:** The Luigi Client has to be provided as Input property.

The subheader represents the Fundamental Dynamic Page subheader and we recommend providing a separate Angular Component with data represented as [Facets](https://sap.github.io/fundamental-ngx/#/core/dynamic-page#facets) as the content of this DashboardComponent.

```html
<dxp-dashboard>
  <my-subheader [LuigiClient]="LuigiClient" />
</dxp-dashboard>
```

#### Dashboard sections

The dashboard container allows to group cards in titled sections with separate ordering inside these sections.

To define a section, add it to the `context` property of the dashboard container definition under the "dashboard" property:

```json
{
  "entityType": "dashboard-parent",
  "defineEntity": {
    "id": "my-dashboard"
  },
  ...
  "context": {
    "dashboard": {
      "sections": [
        { "id": "my-section", "displayName": "My section" }
      ]
    }
  }
}
```

To put a card into the section, choose a different `slot` in `layoutConfig` when defining a card for the dashboard:

```json
{
  "entityType": "dashboard-parent.my-dashboard::compound",
  "pathSegment": "my-grid-element",
  "urlSuffix": "/main.js#my-grid-element",
  "layoutConfig": {
    "slot": "my-section",
    "order": 1
  },
  "webcomponent": {
    "selfRegistered": true
  }
}
```

The card will appear inside the section and the `order` property will order the cards inside the section.

Please note: if you define a section and there are no cards registered for that section, the section will not
be displayed.

#### Dashboard sidebar

It is not only possible to define elements inside of a grid (grouped by sections of a dashboard). Elements can also be defined in
a dashboard to the right of the grid. We recommend adding content which does not change too often to the sidebar as opposed to the
grid.

**Important**: Always use the [Dashboard Sidebar Item](./components/dashboard-sidebar-item/dashboard-sidebar-item.component.ts)
wrapper Component for sidebar elements because it will allow the functionality of collapsing, titling and adding of an edit button
to the sidebar element.

To enable the sidebar, it is enough to give it a title in the definition of the dashboard container:

```json
{
  "entityType": "dashboard-parent",
  "defineEntity": {
    "id": "my-dashboard"
  },
  ...
  "context": {
    "dashboard": {
      "sidebar": {
        "title": "My sidebar"
      }
    }
  }
}
```

This will add a collapsible sidebar to the right of the grid.

To add elements to the sidebar, you only have to define the `slot` property as `sidebar`:

```json
{
  "entityType": "dashboard-parent.my-dashboard::compound",
  "pathSegment": "my-sidebar-element",
  "urlSuffix": "/main.js#my-sidebar-element",
  "layoutConfig": {
    "slot": "sidebar",
    "order": 1
  },
  "webcomponent": {
    "selfRegistered": true
  }
}
```

The order of elements can be defined with the `order` property.

##### Dashboard sidebar element wrapper

The provided [dashboard sidebar element wrapper](./components/dashboard-sidebar-item/dashboard-sidebar-item.component.ts) should be used for all elements which will appear in the sidebar.

The wrapper provides automatic collapsing capabilities and allows you to provide the following Input properties:

- `title` (string) - the text which will appear in the title of the sidebar element
- `loading` (boolean) - if the loading animation or content should be shown
- `editDisabled` (boolean) - if the edit action should be disabled
- `editCallback` (EventEmitter) - if defined, an edit icon will appear in the upper right corner which will trigger this callback - use this to define any in-place editing capabilities
- `rolesAllowedForCallback` (array of strings) - define which policies are allowed to see and use the edit icon

## Dependencies

See the [`imports` property of the Module](./dashboard.module.ts).
