import { DxpContext } from '../../models';
import { DxpIContextMessage, DxpLuigiContextService } from '../luigi';
import { AnalyticsTrackerService } from './analytics-tracker.service';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { mock } from 'jest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { BehaviorSubject, Observable } from 'rxjs';

describe('AnalyticsTrackerService', () => {
  let analyticsTrackingService: AnalyticsTrackerService;
  let ctxSrv: DxpLuigiContextService;

  const testLuigiContext = new BehaviorSubject<DxpIContextMessage>({
    contextType: 0,
    context: mock<DxpContext>({}),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      teardown: {
        destroyAfterEach: true,
        rethrowErrors: true,
      },
      providers: [
        AnalyticsTrackerService,
        MockProvider(DxpLuigiContextService, {
          contextObservable(): Observable<DxpIContextMessage> {
            return testLuigiContext;
          },
        }),
      ],
      imports: [BrowserDynamicTestingModule],
    }).compileComponents();
    analyticsTrackingService = TestBed.inject(AnalyticsTrackerService);
    ctxSrv = TestBed.inject(DxpLuigiContextService);
  });

  afterEach(() => {
    tearDown();
  });

  it('test component should not have a script by default', () => {
    const script = getScript();
    expect(script).toBeNull();
  });

  it.each([
    {
      analyticsTrackerConfig: {},
    },
    {
      analyticsTrackerConfig: undefined,
    },
  ])(
    'test component should  not have script if luigi context does not have correct analytics tracker config',
    (context) => {
      const testLuigiContext = new BehaviorSubject<DxpIContextMessage>({
        contextType: 0,
        context: mock<DxpContext>({ context }),
      });
      ctxSrv.contextObservable = () => testLuigiContext;

      analyticsTrackingService.injectScript().catch((e) => {
        throw new Error(e);
      });

      expect(getScript()).toBeNull();
    },
  );

  it('test component should have script after analytics tracker injection', async () => {
    const testLuigiContext = new BehaviorSubject<DxpIContextMessage>({
      contextType: 0,
      context: mock<DxpContext>({
        tenantid: 'tenantid',
        analyticsTrackerConfig: {
          siteUrl: 'site-url',
          tenantIds: ['tenantid'],
        },
        serviceProviderConfig: { matomoContainerId: 'matomo-container-id' },
        userid: 'user-id',
      }),
    });
    ctxSrv.contextObservable = () => testLuigiContext;
    await analyticsTrackingService.injectScript();

    const script = getScript();

    expect(script).not.toBeNull();
  });
});

function getScript(): HTMLScriptElement {
  return document.querySelector('script')!;
}

function tearDown(): void {
  const script = getScript();
  if (script) {
    script.remove();
  }
}
