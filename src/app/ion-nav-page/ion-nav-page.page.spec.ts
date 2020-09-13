import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IonNavPagePage } from './ion-nav-page.page';

describe('IonNavPagePage', () => {
  let component: IonNavPagePage;
  let fixture: ComponentFixture<IonNavPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IonNavPagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IonNavPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
