# ~~Angular Reuse Page Header Module~~

### **Deprecated**

There is a new style of dashboard, please use the [Dashboard Module](../dashboard/README.md).

### `DxpPageHeaderModule`

### How to use:

1. Page Header component allows to display overview information

```html
<dxp-page-header
  [header]="header"
  (editClicked)="edit()"
  (deleteClicked)="delete()"
>
  <div>
    <label fd-form-label [colon]="true">Description</label>
    <fd-text text="New project for managing internal resource"></fd-text>
  </div>
  <div>
    <label fd-form-label [colon]="true">Namespace</label>
    <fd-text text="SAP 1.0.22"></fd-text>
  </div>
</dxp-page-header>
```

1. Input() header is of type Header

2. Output() editClicked is an event fired when the edit button has been clicked

3. Output() deleteClicked is an event fired when the delete button has been clicked

To use , you need to import the `DxpPageHeaderModule`.

## Dependencies

- `@fundamental-ngx/core`
- `@fundamental-ngx/platform`
