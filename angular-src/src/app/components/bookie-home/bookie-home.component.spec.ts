import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookieHomeComponent } from './bookie-home.component';

describe('BookieHomeComponent', () => {
  let component: BookieHomeComponent;
  let fixture: ComponentFixture<BookieHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookieHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookieHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
