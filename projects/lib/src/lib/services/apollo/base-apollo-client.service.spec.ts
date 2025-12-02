import { TestUtils } from '../../test';
import { IamLuigiContextService } from '../luigi';
import { BaseApolloClientService } from './base-apollo-client.service';
import { HttpHeaders } from '@angular/common/http';
import { Injector } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InMemoryCache } from '@apollo/client/core';
import { LuigiContextService } from '@luigi-project/client-support-angular';
import { Apollo, ApolloBase } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';

class TestingApolloClientService extends BaseApolloClientService {
  constructor(injector: Injector) {
    super(injector, apolloClientName);
  }

  protected getApiUrl(luigiContext: any): string {
    return url;
  }
}

const apolloClientName = 'test';
const url = 'http://apiurl.sap/';
const link = { request: 'LINK' };

expect.extend({
  httpHeadersMatcher(
    given: HttpHeaders | undefined,
    expected: Record<string, string>,
  ) {
    if (!given) {
      return {
        pass: false,
        message: () => `Expected HttpHeaders but received undefined`,
      };
    }

    for (const key in expected) {
      if (given.get(key) !== expected[key]) {
        return {
          pass: false,
          message: () =>
            `mismatch in key "${key}": got "${given.get(key)}", expected "${
              expected[key]
            }"`,
        };
      }
    }

    return { pass: true, message: () => '' };
  },
});

describe('BaseApolloClientService', () => {
  let luigiContextService: LuigiContextService;
  let apollo: Apollo;
  let httpLink: HttpLink;
  let injector: Injector;

  let setLink: jest.Mock;
  let apolloClient: ApolloBase;

  beforeEach(() => {
    setLink = jest.fn();

    apolloClient = mock<ApolloBase>({
      client: {
        setLink: setLink,
      },
    });

    TestBed.configureTestingModule({
      providers: [
        MockProvider(IamLuigiContextService),
        MockProvider(Apollo, {
          createNamed: jest.fn(),
          use: jest.fn().mockReturnValue(apolloClient),
        }),
        MockProvider(HttpLink, {
          create: jest.fn().mockReturnValue(link),
        }),
      ],
    });
    luigiContextService = TestBed.inject(IamLuigiContextService);
    apollo = TestBed.inject(Apollo);
    httpLink = TestBed.inject(HttpLink);
    injector = TestBed.inject(Injector);
  });

  it('should return apollo client for correct context', fakeAsync(() => {
    const token = 'foo';

    luigiContextService.getContextAsync = jest.fn().mockResolvedValue({
      token: token,
      portalContext: {},
    });

    const service = new TestingApolloClientService(injector);
    tick();

    const result = TestUtils.getLastValue(service.apollo());

    expect(apollo.createNamed).toHaveBeenCalledWith(
      apolloClientName,
      expect.objectContaining({
        cache: expect.any(InMemoryCache),
      }),
    );

    expect(httpLink.create).toHaveBeenCalledWith({
      uri: url,
      // @ts-expect-error we are testing the headers
      headers: expect.httpHeadersMatcher({ authorization: `Bearer ${token}` }),
    });

    expect(apollo.use).toHaveBeenCalledWith(apolloClientName);
    expect(result).toEqual(apolloClient);
  }));

  it('should return no apollo client for incorrect context', fakeAsync(() => {
    luigiContextService.getContextAsync = jest.fn().mockResolvedValue({});

    const service = new TestingApolloClientService(injector);
    tick();

    const result = TestUtils.getLastValue(service.apollo());

    expect(result).toBeUndefined();
  }));
});
