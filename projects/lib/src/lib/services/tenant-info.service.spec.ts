import { GET_TENANT_INFO } from '../queries/iam-queries';
import {
  IContextMessage,
  IamApolloClientService,
  IamLuigiContextService,
} from '../services';
import { TestUtils } from '../test';
import { TenantInfoService } from './tenant-info.service';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('TenantInfoService', () => {
  let service: TenantInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(IamLuigiContextService, {
          contextObservable: () =>
            of({ context: { tenantId: 'tenantId' } } as IContextMessage),
        }),
        MockProvider(IamApolloClientService),
      ],
    });
    service = TestBed.inject(TenantInfoService);
  });

  it('should get tenant info', fakeAsync(() => {
    const emailDomains = ['sap.com', 'global.corp.sap'];

    const query = jest
      .fn()
      .mockReturnValue(of({ data: { tenantInfo: { emailDomains } } }));
    TestBed.inject(IamApolloClientService).apollo = jest
      .fn()
      .mockReturnValue(of({ query }));

    const result = TestUtils.getLastValue(service.tenantInfo());

    expect(result).toEqual({ emailDomains });
    expect(query).toHaveBeenCalledWith({
      query: GET_TENANT_INFO,
      variables: {
        tenantId: 'tenantId',
      },
    });
  }));
});
