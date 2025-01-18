import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ReadyPageGuard } from './guards/ready-page.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'game',
    loadChildren: () => import('./pages/game/game.module').then((m) => m.GamePageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginPageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: 'create-pet',
    loadChildren: () => import('./pages/create-pet/create-pet.module').then((m) => m.CreatePetPageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then((m) => m.ProfilePageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: 'create-profile',
    loadChildren: () =>
      import('./pages/create-profile/create-profile.module').then((m) => m.CreateProfilePageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: 'game-over',
    loadChildren: () => import('./pages/game-over/game-over.module').then((m) => m.GameOverPageModule),
    canLoad: [ReadyPageGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
