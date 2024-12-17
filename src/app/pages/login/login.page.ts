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
  ) {}

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
    this.userService.initializeUserData();
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

    this.userService.login(trimmedUsername, trimmedPassword).subscribe({
      next: async (response) => {
        await loading.dismiss();

        if (response) {
          const user = response;
          this.userService.setUsername(user.username);
          this.userService.setUserId(user.id);
          this.router.navigateByUrl('/game');
          this.showToast(`Welcome!`, 'success');
        } else {
          this.showToast('Invalid username or password.', 'danger');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Login error:', error);
        this.showToast('Server error. Please try again later.', 'danger');
      }
    });
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
