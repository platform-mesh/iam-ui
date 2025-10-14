import { imageLoadable } from '../components/image-loadable/image-loadable';
import { User } from '../models';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AvatarProviderService {
  public async getAvatarImageUrl(user: User): Promise<string | undefined> {
    if (!user?.userId) {
      return undefined;
    }

    const url = `stab`; //TODO Replace with new image provider
    if (await imageLoadable(url)) {
      return url;
    } else {
      return undefined;
    }
  }
}
