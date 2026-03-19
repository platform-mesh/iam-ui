import { LuigiClient } from '../luigi';
import { Mock } from 'vitest';
import { RoutingService } from './routing.service';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

describe('RoutingService', () => {
  let routingService: RoutingService;
  let mockNavigate: Mock;

  beforeEach(() => {
    mockNavigate = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        MockProvider(LuigiClient, {
          linkManager: vi.fn().mockReturnValue({ navigate: mockNavigate }),
        }),
      ],
    });
    routingService = TestBed.inject(RoutingService);
  });

  describe('openLink', () => {
    it('should open in new tab', () => {
      window.open = vi.fn();

      routingService.openLink({
        displayName: 'foo',
        link: { url: 'abc', external: true },
      });

      expect(window.open).toHaveBeenCalledWith('abc', '_blank');
    });

    it('should open in luigi', () => {
      routingService.openLink({
        displayName: 'foo',
        link: { url: 'abc', external: false },
      });

      expect(mockNavigate).toHaveBeenCalledWith('abc');
    });
  });
});
