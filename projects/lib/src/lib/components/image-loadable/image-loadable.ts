/**
 * This function check if the provided image can be loaded.
 *
 * @param url Either a URL pointing to an image or the image directly in the data format, e.g. "data:image/png;base64,..."
 */
export async function imageLoadable(url?: string): Promise<boolean> {
  if (!url) {
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(true);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = url;
  });
}
