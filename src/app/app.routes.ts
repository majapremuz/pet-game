import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'game',
    loadComponent: () => import('./pages/game/game.page').then( m => m.GamePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'create-pet',
    loadComponent: () => import('./pages/create-pet/create-pet.page').then( m => m.CreatePetPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'create-profile',
    loadComponent: () => import('./pages/create-profile/create-profile.page').then( m => m.CreateProfilePage)
  },
  {
    path: 'game-over',
    loadComponent: () => import('./game-over/game-over.page').then( m => m.GameOverPage)
  },
];
