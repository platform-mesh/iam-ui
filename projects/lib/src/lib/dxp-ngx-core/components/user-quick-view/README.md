# Angular Reuse User Quick View Component

### `DxpUserQuickViewModule`

### How to use:

1. User Quick View component allows to display in a popup card an information about a user

```html
<dxp-user-quick-view [user]="userObject">
  <div>John Doe</div>
</dxp-user-quick-view>

1. Input() user is of type User in @dxp/ngx-core/common 2. As a component
content provide a html element below which the user quick view component will be
displayed
```

2. To open a popup one need to click on the html element provided to the user quick view component
3. To close a popup press 'esc' key, again click on the html component or leave the popup area with the mouse

To use , you need to import the `DxpUserQuickViewModule`.

## Dependencies

- `@fundamental-ngx/core`
