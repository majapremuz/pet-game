import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePetPage } from './create-pet.page';

const routes: Routes = [
  {
    path: '',
    component: CreatePetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatePetPagePageRoutingModule {}
