import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatePetPage } from './create-pet.page';

describe('CreatePetPage', () => {
  let component: CreatePetPage;
  let fixture: ComponentFixture<CreatePetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
