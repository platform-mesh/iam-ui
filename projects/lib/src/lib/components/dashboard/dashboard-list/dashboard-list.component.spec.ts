import { DashboardListComponent } from './dashboard-list.component';
import { ListItem } from './models/list-item';
import { SvgConfigType } from './models/svg-config-type';
import { sapIllusDotAvatarAlternate } from './svg/dot-avatar-alternate';
import { sapIllusDotNoApplicationsAlternate } from './svg/dot-no-applications-alternate';
import { ComponentRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

describe('DashboardListComponent', () => {
  let component: DashboardListComponent;
  let fixture: ComponentFixture<DashboardListComponent>;
  let componentRef: ComponentRef<DashboardListComponent>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined as any);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardListComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardListComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('list', []);
    componentRef.setInput('noItemTitle', 'there are no foo items');
    componentRef.setInput('showByline', false);
    componentRef.setInput('svgConfigType', SvgConfigType.AvatarAlternate);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list correctly', () => {
    const list: ListItem[] = [
      {
        link: 'http://localhost/1',
        title: 'title-1',
        image: 'image',
        byline: 'byline-1',
        type: 'ListItemWithImage',
      },
      {
        link: 'http://localhost/2',
        title: 'title-2',
        image: 'image',
        byline: 'byline-2',
        type: 'ListItemWithImage',
      },
    ];
    componentRef.setInput('list', list);
    fixture.detectChanges();
    const lis = fixture.debugElement.queryAll(By.css('li'));
    expect(lis.length).toBe(2);
    expect(lis[1].nativeElement.textContent).toContain('title-2');
    expect(lis[1].query(By.css('a')).nativeElement.href).toContain(
      'http://localhost/2',
    );
  });

  it('should render the no list correctly', () => {
    expect(fixture.debugElement.nativeElement.textContent).toContain(
      'there are no foo items',
    );
  });

  it('should render byline if enabled', () => {
    const list: ListItem[] = [
      {
        link: 'http://localhost/1',
        title: 'title-1',
        image: 'image',
        byline: 'byline-1',
        type: 'ListItemWithImage',
      },
    ];
    componentRef.setInput('list', list);
    componentRef.setInput('showByline', true);
    fixture.detectChanges();
    const lis = fixture.debugElement.queryAll(By.css('li'));
    expect(lis[0].nativeElement.textContent).toContain('byline-1');
  });

  it.each([
    [
      SvgConfigType.AvatarAlternate,
      {
        dot: {
          file: sapIllusDotAvatarAlternate,
          id: 'tnt-Dot-Avatar-alternate',
        },
      },
    ],
    [
      SvgConfigType.NoApplicationsAlternate,
      {
        dot: {
          file: sapIllusDotNoApplicationsAlternate,
          id: 'tnt-Dot-NoApplications-alternate',
        },
      },
    ],
  ])(
    'should transform svgConfigType: %s to the expected svgConfig',
    (svgConfigType, expectedConfig) => {
      componentRef.setInput('svgConfigType', svgConfigType);
      fixture.detectChanges();

      expect(component.svgConfig).toEqual(expectedConfig);
    },
  );
});
