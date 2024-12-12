import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PetService } from 'src/app/services/pet.servise';

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
    private injector: Injector
  ) { }

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  private get petService(): PetService {
    return this.injector.get(PetService);
  }

  ngOnInit() {
  }

  onLogin() {
    if (!this.username || !this.password) {
      alert('Please enter both username and password.');
      return;
    }
  
    console.log('Logging in with:', this.username, this.password);
  
    this.userService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.length > 0) {
          const user = response[0];
          console.log("Login successful. Welcome, ", user.username);
          this.userService.setUsername(user.username);
          this.userService.setUserId(user.id);
          this.router.navigateByUrl('/profile');
        } else {
          alert('Invalid username or password.');
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        alert('Server error. Please try again later.');
      }
    });
  }
  
  
  }
