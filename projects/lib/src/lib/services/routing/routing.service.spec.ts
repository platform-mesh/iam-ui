import { RoutingService } from './routing.service';
import { TestBed } from '@angular/core/testing';
import { LuigiClient } from '@platform-mesh/iam-lib';
import { MockProvider } from 'ng-mocks';

describe('RoutingService', () => {
  let routingService: RoutingService;
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    mockNavigate = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        MockProvider(LuigiClient, {
          linkManager: jest.fn().mockReturnValue({ navigate: mockNavigate }),
        }),
      ],
    });
    routingService = TestBed.inject(RoutingService);
  });

  describe('openLink', () => {
    it('should open in new tab', () => {
      window.open = jest.fn();

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
