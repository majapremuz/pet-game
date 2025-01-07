import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreatePetPagePageRoutingModule } from './create-pet-routing.module';

import { CreatePetPage } from './create-pet.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreatePetPagePageRoutingModule,
    CreatePetPage,
  ],
  declarations: []
})
export class CreatePetPageModule {}
