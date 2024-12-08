import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  username: string = '';

  constructor(
    private router: Router,
    private injector: Injector
  ) { }

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
  }

  profil() {
    this.userService.setUsername(this.username);
    this.router.navigateByUrl('/profile');
  }

}
