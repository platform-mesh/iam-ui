# Angular Reuse Action Card Component

## `DxpActionCardModule`

### How to use:

1. Action Card component provides a reusable card consisting of header, image, heading, description and action button.

```html
<dxp-action-card
  imageUrl="assets/images/tnt-Scene-Compass.svg"
  imageId="tnt-Scene-Compass"
  heading="Experiment"
  width="320px"
  height="500px"
  content="Card description"
></dxp-action-card>
```

- @Input() title: string - optional, defines the card header.
- @Input() width: string - optional, defines the width of the card, default is 356px.
- @Input() height: string - optional, defines the width of the card, default is 430px.
- @Input() imageUrl: string - optional, defines the url to an image.
- @Input() imageId: string - optional, defines the id of an image. Needed for SVGs.
- @Input() imageType: ImageType - optional, takes one of the options ImageType.FULLSIZE or ImageType.CENTERED. Defines how is the image displayed. Default if full-size.
- @Input() heading: string - optional, defines the heading under the image.
- @Input() content: string - optional, defines description of the card.
- @Input() helpLink: HelpLink - optional, defines the link, leading to the help page and the text for a tooltip. The help icon is displayed in the top right corner.
- @Input() footer: string - optional, defines the text to display at the end of the card.
- @Input() actions: CardAction[] - optional, gives necessary information for the action button.

```
 interface CardAction {
  text: string;
  fdType: ButtonType
  clickCallback?: () => void;
  testId?: string
  tooltip?: string;
  disabled?: boolean;
}
```

```
interface HelpLink {
  link: string;
  tooltip?: string;
}
```

To use , you need to import the `DxpActionCardModule`.

## Dependencies

- `@fundamental-ngx/core`
- `@fundamental-ngx/platform`
