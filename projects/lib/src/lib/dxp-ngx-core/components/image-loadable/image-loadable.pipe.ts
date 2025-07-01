import { imageLoadable } from './image-loadable';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageLoadable',
  pure: true,
  standalone: true,
})
export class ImageLoadablePipe implements PipeTransform {
  async transform(url?: string): Promise<boolean> {
    return imageLoadable(url);
  }
}
