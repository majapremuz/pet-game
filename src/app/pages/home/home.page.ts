import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit {
  constructor(
    private router: Router, 
    private userService: UserService
  ) {}

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
      this.router.navigateByUrl('/game');
    }
  }

  createPet() {
    this.router.navigateByUrl('/create-pet');
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  quitApp() {
    App.exitApp();
  }
}
