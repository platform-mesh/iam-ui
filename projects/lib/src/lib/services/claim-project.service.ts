import { DxpLuigiContextService } from '../dxp-ngx-core/services/luigi';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClaimProjectService {
  constructor(private luigiContextService: DxpLuigiContextService) {}

  public claimProject(): void {
    const projectId = this.luigiContextService.getContext().projectId;
    const frameBaseUrl = this.luigiContextService.getContext()[
      'frameBaseUrl'
    ] as string;
    const projectUrl = `${frameBaseUrl}/projects/${projectId}`;

    const url = new JiraTicketRequest()
      .withDxpProject(projectId ?? '')
      .withDxpProjectUrl(projectUrl)
      .create();
    window.open(url.href, '_blank');
  }
}

class JiraTicketRequest {
  private readonly createIssueUrl =
    'https://jira.tools.sap/secure/CreateIssueDetails!init.jspa?';
  private readonly dxpFrameProjectId = '106042';
  private readonly dxpFeatureRequestIssueType = '10100';
  private readonly dxpFrameClaimProjectComponentId = '300068';
  private summaryText!: string;
  private descriptionText!: string;

  public withDxpProject(projectId: string): JiraTicketRequest {
    this.summaryText = `Claim Project Request for Project ${projectId}`;
    return this;
  }

  public withDxpProjectUrl(url: string): JiraTicketRequest {
    this.descriptionText = `h3. Description
Describe why you want to claim this project:

Who should be added as an owner of the project?

h3. Link to Project
${url}
`;
    return this;
  }

  public create(): URL {
    const url = new URL(this.createIssueUrl);
    url.searchParams.set('pid', this.dxpFrameProjectId);
    url.searchParams.set('issuetype', this.dxpFeatureRequestIssueType);
    url.searchParams.set('components', this.dxpFrameClaimProjectComponentId);
    url.searchParams.set('summary', this.summaryText);
    url.searchParams.set('description', this.descriptionText);
    return url;
  }
}
