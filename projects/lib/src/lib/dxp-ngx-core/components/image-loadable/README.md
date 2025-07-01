# Image Loadable Helpers

This module helps with checking if an image URL is valid before showing an image.

Examples:

From TypeScript code:

```ts
import { imageLoadable } from '@dxp/ngx-core/image-loadable';

if (await imageLoadable(url)) {
  return url;
} else {
  return undefined;
}
```

From HTML templates:

```ts
import { ImageLoadableModule } from '@dxp/ngx-core/image-loadable';

@NgModule({
  imports: [ImageLoadableModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

```html
<fd-facet type="image" *ngIf="url | imageLoadable | async">
  <fd-avatar [transparent]="true" [image]="url" size="l"></fd-avatar>
</fd-facet>
```

## Dependencies

None
