import { imageLoadable } from './image-loadable';

describe('isValidImgUrl', () => {
  it('should return true on good image url', async () => {
    const url = 'valid';
    const image = mockImage();

    const promise = imageLoadable(url);

    expect(image.src).toEqual(url);

    image.onload();

    expect(await promise).toEqual(true);
  });

  it('should return false on bad image url', async () => {
    const url = 'invalid';
    const image = mockImage();

    const promise = imageLoadable(url);

    expect(image.src).toEqual(url);

    image.onerror();

    expect(await promise).toEqual(false);
  });
});

function mockImage() {
  const image = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onload: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onerror: () => {},
    src: '',
  };
  global.Image = jest.fn().mockReturnValue(image);
  return image;
}
