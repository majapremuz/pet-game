import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.page.html',
  styleUrls: ['./create-profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreateProfilePage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit() {}

  createProfile() {
    if (this.username && this.password) {
      this.userService.setUsername(this.username);
      this.userService.setUserPassword(this.password);
      this.router.navigate(['/create-pet']);
    } else {
      alert('Please enter a username and password');
    }
  }

}
