import { IamApolloClientService } from './iam-apollo-client.service';
import { IamLuigiContextService } from '../luigi';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { MockProvider } from 'ng-mocks';
import { mock } from 'vitest-mock-extended';
import { ApolloBase } from 'apollo-angular';

describe('IamApolloClientService', () => {
  let injector: Injector;
  let luigiContextService: IamLuigiContextService;
  const setLink = vi.fn();
  const apolloClient = mock<ApolloBase>({ client: { setLink } });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(IamLuigiContextService),
        MockProvider(Apollo, {
          createNamed: vi.fn(),
          use: vi.fn().mockReturnValue(apolloClient),
        }),
        MockProvider(HttpLink, {
          create: vi.fn().mockReturnValue({}),
        }),
      ],
    });
    luigiContextService = TestBed.inject(IamLuigiContextService);
    injector = TestBed.inject(Injector);
  });

  it('should resolve the IAM API url from luigiContext', async () => {
    const iamServiceApiUrl = 'https://iam.api/graphql';
    luigiContextService.getContextAsync = vi.fn().mockResolvedValue({
      token: 'abc',
      portalContext: { iamServiceApiUrl },
    });

    const service = new IamApolloClientService(injector);
    await Promise.resolve();

    expect(TestBed.inject(Apollo).createNamed).toHaveBeenCalledWith(
      'iam',
      expect.any(Object),
    );
  });

  it('should not create apollo client when token is missing', async () => {
    luigiContextService.getContextAsync = vi.fn().mockResolvedValue({});

    const service = new IamApolloClientService(injector);
    await Promise.resolve();

    let emitted = false;
    service.apollo().subscribe(() => { emitted = true; });
    expect(emitted).toBe(false);
  });
});
