import { imageLoadable } from './image-loadable';

describe('imageLoadable', () => {
  let image: { src: string; onload: () => void; onerror: () => void };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalImage = (global as any).Image;

  beforeEach(() => {
    image = { src: '', onload: () => {}, onerror: () => {} };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Image = function () { return image; };
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Image = originalImage;
  });

  it('should return false when url is undefined', async () => {
    expect(await imageLoadable(undefined)).toBe(false);
  });

  it('should return true when image loads successfully', async () => {
    const promise = imageLoadable('valid');
    image.onload();
    expect(await promise).toBe(true);
  });

  it('should return false when image fails to load', async () => {
    const promise = imageLoadable('invalid');
    image.onerror();
    expect(await promise).toBe(false);
  });
});
