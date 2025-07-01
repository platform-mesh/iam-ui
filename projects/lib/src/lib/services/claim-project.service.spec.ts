import { DxpLuigiContextService } from '../dxp-ngx-core/services';
import { ClaimProjectService } from './claim-project.service';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

const projectId = 'abc';
const frameBaseUrl = 'https://sap.dev.dxp.k8s.ondemand.com';

describe('ClaimProjectService', () => {
  let service: ClaimProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClaimProjectService,
        MockProvider(DxpLuigiContextService, {
          getContext: jest.fn().mockReturnValue({ projectId, frameBaseUrl }),
        }),
      ],
    });
    service = TestBed.inject(ClaimProjectService);
  });

  it('should open Jira URL to create a claim project ticket', () => {
    window.open = jest.fn();

    service.claimProject();

    expect(window.open).toHaveBeenCalledWith(
      'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?pid=106042&issuetype=10100&components=300068&summary=Claim+Project+Request+for+Project+abc&description=h3.+Description%0ADescribe+why+you+want+to+claim+this+project%3A%0A%0AWho+should+be+added+as+an+owner+of+the+project%3F%0A%0Ah3.+Link+to+Project%0Ahttps%3A%2F%2Fsap.dev.dxp.k8s.ondemand.com%2Fprojects%2Fabc%0A',
      '_blank',
    );
  });
});
