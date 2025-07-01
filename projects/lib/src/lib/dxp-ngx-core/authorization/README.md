# Angular Reuse Library Authorization

To use this directive you need to import the `AuthorizationModule`.
Afterwards you can use the `*dxpRequiredPolicies` directive to show UI elements only to users with the correct policies.

## Basic example

To show a UI element based on one policy, you can use the following snippet.

```html
<button *dxpRequiredPolicies="'projectAdmin'">Delete</button>
```

## Examples for AND

To show a UI element requiring the user to have two (or more) policies, you can use the following snippet.

```html
<button *dxpRequiredPolicies="['projectAdmin', 'projectMember']">Delete</button>
```

Internally there is an `operator` property that defaults to "and".
But you also can specify the operation if you want to.

```html
<button
  *dxpRequiredPolicies="['projectAdmin', 'projectMember']; operator='and'"
>
  Delete
</button>
```

## Examples for OR

Tho show a UI element require a user to have at least one of two (ore more) policies, you can use the following snippet.
Note that you **must** use the `operator='or'` keyword here because the `operator` defaults to AND.

```html
<button *dxpRequiredPolicies="['projectAdmin', 'projectMember']; operator='or'">
  Delete
</button>
```

## Examples for Negation

To show a UI element based on a user **not** having a policy, you can use the `!` in front of the policy names.

```html
<button *dxpRequiredPolicies="'!projectAdmin'">Delete</button>
```

This works for single values, as well as for multiple values.

```html
<button *dxpRequiredPolicies="['!projectAdmin', 'projectMember']">
  Delete
</button>
```

## Dependencies

- `@luigi-project/client-support-angular`
- `rxjs`
