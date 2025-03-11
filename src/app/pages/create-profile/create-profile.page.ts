import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Platform, ToastController } from '@ionic/angular';

@Component({
    selector: 'app-create-profile',
    templateUrl: './create-profile.page.html',
    styleUrls: ['./create-profile.page.scss'],
    imports: [IonicModule, CommonModule, FormsModule]
})
export class CreateProfilePage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private platform: Platform,
    private toastController: ToastController
  ) {
  }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(9999, () => {
      if (!this.userService.getUsername()) {
        this.showToast("You must create a profile before going back!");
      }
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }

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
