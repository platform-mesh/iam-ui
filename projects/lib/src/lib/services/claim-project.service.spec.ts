import { IamLuigiContextService } from '../services';
import { ClaimEntityService } from './claim-entity.service';
import { ClaimProjectService } from './claim-project.service';
import { MemberService } from './member.service';
import { TestBed } from '@angular/core/testing';
import { Context } from '@luigi-project/client';
import { LuigiContextService } from '@luigi-project/client-support-angular';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('ClaimProjectService', () => {
  let service: ClaimProjectService;
  const entityId = 'abc';
  const portalBaseUrl = 'https://example.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClaimEntityService,
        MockProvider(IamLuigiContextService, {
          getContext: jest.fn().mockReturnValue({
            portalBaseUrl,
            entityContext: {
              project: {
                id: entityId,
              },
            },
            portalContext: {
              iamClaimEntityUrl:
                'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?pid=106042&issuetype=10100&components=300068&summary=Claim+Project+Request+for+Project+${entityId}&description=h3.+Description%0ADescribe+why+you+want+to+claim+this+project%3A%0A%0AWho+should+be+added+as+an+owner+of+the+project%3F%0A%0Ah3.+Link+to+Project%0A${portalBaseUrl}%2Fprojects%2F${entityId}d%0A',
            },
          }),
        }),
        MockProvider(MemberService, {
          currentEntity: () => of('project'),
        }),
      ],
    });
    service = TestBed.inject(ClaimProjectService);
  });

  it('should open Jira URL to create a claim project ticket', async () => {
    window.open = jest.fn();

    await service.claimProject();

    expect(window.open).toHaveBeenCalledWith(
      'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?pid=106042&issuetype=10100&components=300068&summary=Claim+Project+Request+for+Project+abc&description=h3.+Description%0ADescribe+why+you+want+to+claim+this+project%3A%0A%0AWho+should+be+added+as+an+owner+of+the+project%3F%0A%0Ah3.+Link+to+Project%0Ahttps://example.com%2Fprojects%2Fabcd%0A',
      '_blank',
    );
  });

  it('should handle undefined projectId in JiraTicketRequest', () => {
    const mockLuigiContextService = TestBed.inject(LuigiContextService);
    const ctx = {
      projectId: undefined,
      frameBaseUrl: 'https://sap.dev.dxp.k8s.ondemand.com',
    } as unknown as Context;
    jest.spyOn(mockLuigiContextService, 'getContext').mockReturnValue(ctx);

    window.open = jest.fn();

    service.claimProject();

    expect(window.open).toHaveBeenCalledWith(
      'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?pid=106042&issuetype=10100&components=300068&summary=Claim+Project+Request+for+Project+&description=h3.+Description%0ADescribe+why+you+want+to+claim+this+project%3A%0A%0AWho+should+be+added+as+an+owner+of+the+project%3F%0A%0Ah3.+Link+to+Project%0Ahttps%3A%2F%2Fsap.dev.dxp.k8s.ondemand.com%2Fprojects%2F%0A',
      '_blank',
    );
  });
});
