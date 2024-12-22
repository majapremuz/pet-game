import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private injector: Injector,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.userService.initializeUserData();
  }

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
  }

  async onLogin() {
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();
  
    if (!trimmedUsername || !trimmedPassword) {
      this.showToast('Please enter both username and password.', 'warning');
      return;
    }
  
    const loading = await this.loadingController.create({
      message: 'Logging in...',
      spinner: 'crescent',
      duration: 5000
    });
    await loading.present();
  
    // Check if the username and password match any saved values in localStorage
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password'); // Assuming you're saving the password too
  
    if (savedUsername === trimmedUsername && savedPassword === trimmedPassword) {
      await loading.dismiss();
      this.userService.setUsername(trimmedUsername); // Save username
      this.router.navigateByUrl('/game');
      this.showToast(`Welcome!`, 'success');
    } else {
      await loading.dismiss();
      this.showToast('Invalid username or password.', 'danger');
    }
  }
  

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}
