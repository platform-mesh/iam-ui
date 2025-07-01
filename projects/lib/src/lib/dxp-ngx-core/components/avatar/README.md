# Angular Reuse Avatar Component

### This `DxpAvatarModule` Works as:

1. VPN: Show Avatar

2. Non-VPN:

- Fallback 1: When first / last name is available: Show Initials
- Fallback 2: When no first / last name is available: Show user account image - Show Glyphicon

### How to use:

Avatar component that follows design guidelines, use as

```html
<dxp-avatar size="xs" [user]="userObject" disablePopover="false" />
```

1. Input() `size`: "xs" | "s" | "m" | "l" | "xl" of type Size in @fundamental-ngx/core

2. Input() `user` is of type User in @dxp/ngx-core/common

3. Input() `disablePopover` is used if `dxp-avatar` is used in a scenario where a popover is already provided

To use , you need to import the`DxpAvatarModule`.

## Dependencies

- `@fundamental-ngx/core`
