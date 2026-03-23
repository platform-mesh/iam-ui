import { LuigiClient } from './luigi-client.service';

describe('LuigiClient', () => {
  let service: LuigiClient;

  beforeEach(() => {
    service = new LuigiClient();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearFrameCache', () => {
    it('should send the frame-entity-changed custom message', () => {
      service.sendCustomMessage = vi.fn();
      service.clearFrameCache();
      expect(service.sendCustomMessage).toHaveBeenCalledWith({
        id: 'general.frame-entity-changed',
      });
    });
  });
});
