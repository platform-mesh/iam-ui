import { sapIllusAddPeople } from './svg';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonType } from '@fundamental-ngx/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';
import {
  ActionCardComponent,
  CardAction,
  ExtensionService,
  IamLuigiContextService,
  ImageType,
  NodeContext,
  ScopeType,
  UpdateExtensionInput,
} from '@platform-mesh/iam-lib';
import { catchError, first, of } from 'rxjs';

@Component({
  selector: 'app-add-your-team-card',
  imports: [ActionCardComponent],
  templateUrl: './add-your-team-card.component.html',
  styleUrl: './add-your-team-card.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddYourTeamCardComponent implements OnInit {
  imageConfig = {
    spot: {
      file: sapIllusAddPeople,
      id: 'sapIllus-Spot-AddPeople',
    },
  };
  cardButtons: CardAction[] = [
    {
      fdType: 'emphasized' as ButtonType,
      text: 'Connect',
    },
  ];

  /**
   * Set by Luigi itself.
   */
  @Input()
  set context(context: NodeContext) {
    this.luigiContextService.setContext(context);
  }

  /**
   * Set by Luigi itself.
   */
  @Input()
  LuigiClient!: LuigiClient;

  protected readonly helpLink = {
    link: 'https://portal.hyperspace.tools.sap/projects/dxp/documentation/User-Guide/Manage-Members',
  } as const;
  protected readonly ImageType = ImageType;

  constructor(
    private luigiContextService: IamLuigiContextService,
    private extensionService: ExtensionService,
  ) {}

  ngOnInit(): void {
    this.luigiContextService
      .contextObservable()
      .pipe(first())
      .subscribe((ctx) => {
        this.cardButtons = [
          {
            fdType: 'emphasized' as ButtonType,
            clickCallback: this.addNewTeam,
            text: 'Connect',
          },
        ];
        if (
          ctx.context.entityContext['project']?.policies.includes(
            'projectAdmin',
          )
        ) {
          this.cardButtons.push({
            fdType: 'transparent' as ButtonType,
            clickCallback: this.skipCard,
            text: 'Skip',
          });
        }
      });
  }

  addNewTeam = () => {
    this.LuigiClient.linkManager()
      .fromClosestContext()
      .openAsModal('add-members', {
        width: '60rem',
        height: '40rem',
      });
  };
  skipCard = () => {
    this.extensionService
      .updateExtensionInstanceInProject({
        installationData: {
          skipOnboardingCard: 'true',
        },
        instanceId: 'app-iam-ui',
        extensionClass: {
          id: 'app-iam-ui',
          scope: ScopeType.PROJECT,
        },
      } as UpdateExtensionInput)
      .pipe(
        first(),
        catchError(async (error: Error) => {
          await this.LuigiClient.uxManager().showAlert({
            text: error.message,
            type: 'error',
          });
          return of(null);
        }),
      )
      .subscribe(() => {
        window.postMessage({
          msg: 'custom',
          data: { id: 'general.frame-entity-changed' },
        });
      });
  };
}
