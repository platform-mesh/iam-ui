import { User } from '../models';
import { imageLoadable } from '../utils';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AvatarProviderService {
  public async getAvatarImageUrl(
    user: User,
    avatarImageUrl?: string,
  ): Promise<string | undefined> {
    if (!user?.userId || !avatarImageUrl) {
      return undefined;
    }

    const url = avatarImageUrl.replace('${userId}', user.userId);
    if (await imageLoadable(url)) {
      return url;
    } else {
      return undefined;
    }
  }
}
