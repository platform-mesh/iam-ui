import { URIComponentCodec } from './codecs';

describe('URIComponentCodec', () => {
  const codec = new URIComponentCodec();

  describe('When key', () => {
    const decoded = '$query';
    const encoded = '%24query';

    it('should encode special chars', () => {
      const actual: string = codec.encodeKey(decoded);
      expect(actual).toEqual(encoded);
    });

    it('should decode special chars', () => {
      const actual: string = codec.decodeKey(encoded);
      expect(actual).toEqual(decoded);
    });
  });

  describe('When value', () => {
    const decoded = '+key:val && "text=$$"';
    const encoded = '%2Bkey%3Aval%20%26%26%20%22text%3D%24%24%22';

    it('should encode special chars', () => {
      const actual: string = codec.encodeKey(decoded);
      expect(actual).toEqual(encoded);
    });

    it('should decode special chars', () => {
      const actual: string = codec.decodeKey(encoded);
      expect(actual).toEqual(decoded);
    });
  });
});
