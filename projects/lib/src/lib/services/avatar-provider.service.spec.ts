import { User } from '../models';
import { imageLoadable } from '../utils/image-loadable';
import { AvatarProviderService } from './avatar-provider.service';
import { TestBed } from '@angular/core/testing';

describe('AvatarProviderService', () => {
  let service: AvatarProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvatarProviderService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAvatarImageUrl', () => {
    it('should return undefined when user is falsy', async () => {
      const result = await service.getAvatarImageUrl(null as unknown as User);
      expect(result).toBeUndefined();
    });

    it('should return undefined when userId is missing', async () => {
      const result = await service.getAvatarImageUrl({} as User, 'https://avatar.url/${userId}');
      expect(result).toBeUndefined();
    });

    it('should return undefined when avatarImageUrl is not provided', async () => {
      const result = await service.getAvatarImageUrl({ userId: 'u1' } as User);
      expect(result).toBeUndefined();
    });

    it('should return resolved url when image loads', async () => {
      let storedImage: { src: string; onload: () => void; onerror: () => void } | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Image = function () {
        storedImage = this as any;
        return storedImage;
      };

      const promise = service.getAvatarImageUrl(
        { userId: 'u1' } as User,
        'https://avatar.url/${userId}',
      );
      storedImage!.onload();
      const result = await promise;
      expect(result).toBe('https://avatar.url/u1');
    });

    it('should return undefined when image fails to load', async () => {
      let storedImage: { src: string; onload: () => void; onerror: () => void } | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Image = function () {
        storedImage = this as any;
        return storedImage;
      };

      const promise = service.getAvatarImageUrl(
        { userId: 'u1' } as User,
        'https://avatar.url/${userId}',
      );
      storedImage!.onerror();
      const result = await promise;
      expect(result).toBeUndefined();
    });
  });
});
