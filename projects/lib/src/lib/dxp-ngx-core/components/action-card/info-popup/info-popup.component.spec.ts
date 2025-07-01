import { InfoPopupComponent } from './info-popup.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('InfoPopupComponent', () => {
  let component: InfoPopupComponent;
  let fixture: ComponentFixture<InfoPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoPopupComponent],
    });
    fixture = TestBed.createComponent(InfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
