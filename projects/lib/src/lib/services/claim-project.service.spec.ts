import { IamLuigiContextService } from '../services';
import { ClaimEntityService } from './claim-entity.service';
import { MemberService } from './member.service';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

describe('ClaimProjectService', () => {
  let service: ClaimEntityService;
  const entityId = 'abc';
  const frameBaseUrl = 'https://example.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClaimEntityService,
        MockProvider(IamLuigiContextService, {
          getContext: jest.fn().mockReturnValue({
            frameBaseUrl,
            entityContext: {
              project: {
                id: entityId,
              },
            },
            portalContext: {
              iamClaimEntityUrl:
                'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?pid=106042&issuetype=10100&components=300068&summary=Claim+Project+Request+for+Project+${entityId}&description=h3.+Description%0ADescribe+why+you+want+to+claim+this+project%3A%0A%0AWho+should+be+added+as+an+owner+of+the+project%3F%0A%0Ah3.+Link+to+Project%0A${frameBaseUrl}%2Fprojects%2F${entityId}d%0A',
            },
          }),
        }),
        MockProvider(MemberService, {
          currentEntity: () => of('project'),
        }),
      ],
    });
    service = TestBed.inject(ClaimEntityService);
  });

  it('should open Jira URL to create a claim project ticket', async () => {
    window.open = jest.fn();

    await service.claim();

    expect(window.open).toHaveBeenCalledWith(
      'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?pid=106042&issuetype=10100&components=300068&summary=Claim+Project+Request+for+Project+abc&description=h3.+Description%0ADescribe+why+you+want+to+claim+this+project%3A%0A%0AWho+should+be+added+as+an+owner+of+the+project%3F%0A%0Ah3.+Link+to+Project%0Ahttps://example.com%2Fprojects%2Fabcd%0A',
      '_blank',
    );
  });
});
