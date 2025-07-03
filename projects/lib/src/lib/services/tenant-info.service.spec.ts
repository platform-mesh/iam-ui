import {
  DxpIContextMessage,
  DxpLuigiContextService,
  IamApolloClientService,
} from '../dxp-ngx-core/services';
import { TestUtils } from '../dxp-ngx-core/test';
import { GET_TENANT_INFO } from '../queries/iam-queries';
import { TenantInfoService } from './tenant-info.service';
import { TestBed, fakeAsync } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('TenantInfoService', () => {
  let service: TenantInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(DxpLuigiContextService, {
          contextObservable: () =>
            of({ context: { tenantid: 'tenantid' } } as DxpIContextMessage),
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
        tenantId: 'tenantid',
      },
    });
  }));
});
