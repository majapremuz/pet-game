import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
//import { UserService } from 'src/app/services/user.service';
import { UserService } from '../../services/user.service';
import { NavController } from '@ionic/angular';
import { ScheduleOptions } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit {
  @ViewChild('createPetButton') createPetButton!: ElementRef;
  @ViewChild('loginButton') loginButton!: ElementRef;
  @ViewChild('quitAppButton') quitAppButton!: ElementRef;
  


  constructor(
    private navController: NavController, 
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.isLoggedIn().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigateByUrl('/game');
      }
    });
  }
  
  

  ngAfterViewInit() {
    // Ensure buttons are accessible
    if (this.createPetButton) {
      this.createPetButton.nativeElement.removeAttribute('aria-hidden');
    }
    if (this.loginButton) {
      this.loginButton.nativeElement.removeAttribute('aria-hidden');
    }
    if (this.quitAppButton) {
      this.quitAppButton.nativeElement.removeAttribute('aria-hidden');
    }
  }

  createPet() {
    this.blurButtons();
    this.router.navigateByUrl('/create-pet'); 
  }
  
  login() {
    this.blurButtons();
    this.router.navigateByUrl('/login'); 
  }
  

  quitApp() {
    this.blurButtons();
    App.exitApp();
  }

  private blurButtons() {
    if (this.createPetButton) {
      this.createPetButton.nativeElement.blur();
    }
    if (this.loginButton) {
      this.loginButton.nativeElement.blur();
    }
    if (this.quitAppButton) {
      this.quitAppButton.nativeElement.blur();
    }
  }

}
