import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
//import { FirebaseX } from '@ionic-native/firebase-x/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  /*private initializeSession() {
    this.userService.initializeUserData();
    if (!this.userService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
  }

  canActivate(): boolean {
    if (this.userService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }*/
  
  //private firebase: FirebaseX) {}

  /*ngOnInit() {
    this.firebase.getToken().then(token => {
      console.log('Push Token:', token);
    }).catch((error: any) => {
      console.log('Error getting push token:', error);
    });

    // Listen for incoming push notifications
    this.firebase.onMessageReceived().subscribe(data => {
      console.log('Notification received:', data);
    });
  }*/

}
