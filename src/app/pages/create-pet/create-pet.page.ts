import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import * as SHA1 from 'crypto-js/sha1';
import { PushNotifications, Token, PermissionStatus } from '@capacitor/push-notifications';

@Component({
  selector: 'app-create-pet',
  templateUrl: './create-pet.page.html',
  styleUrls: ['./create-pet.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreatePetPage implements OnInit {
  playMode: string | null = null;
  currentSlideIndex: number = 0;
  slides: HTMLElement[] = [];
  selectedDogImage: string = '';
  showInput: boolean = false;
  petName: string = '';
  dogStats: any = {};

  constructor(
    private router: Router,
    private alertController: AlertController,
    private injector: Injector
  ) {}

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
    this.showSlide(this.currentSlideIndex);
    this.promptPlayMode();
  }

  async getPushToken(): Promise<string | null> {
    try {
      // Request push notification permissions
      const permissionStatus: PermissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        console.log('Push Notifications permission granted.');

        // Register for push notifications
        await PushNotifications.register();

        // Retrieve the token
        return new Promise((resolve) => {
          PushNotifications.addListener('registration', (token: Token) => {
            console.log('Push registration success:', token.value);
            resolve(token.value);
          });

          PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error:', error);
            resolve(null);
          });
        });
      } else {
        console.warn('Push Notifications permission denied.');
        return null;
      }
    } catch (error) {
      console.error('Error during push token retrieval:', error);
      return null;
    }
  }

  async promptPlayMode() {
    const alert = await this.alertController.create({
      message: 'Želite li igrati online ili offline?',
      cssClass: 'playMode',
      buttons: [
        {
          text: 'Online',
          handler: async () => {
            this.playMode = 'online';
            const token = await this.getPushToken();
            if (!token) {
              console.warn('Push token not received.');
            }
          },
        },
        {
          text: 'Offline',
          handler: () => {
            this.playMode = 'offline';
          },
        },
      ],
    });

    await alert.present();
  }

  plusSlides(n: number) {
    this.currentSlideIndex += n;
    if (this.currentSlideIndex >= this.slides.length) {
      this.currentSlideIndex = 0;
    } else if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    }
    this.showSlide(this.currentSlideIndex);
  }

  showSlide(index: number) {
    this.slides = Array.from(document.getElementsByClassName('slide') as HTMLCollectionOf<HTMLElement>);
    this.slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
    });
  }

  async game() {
    if (!this.playMode) {
      await this.promptPlayMode();
      return;
    }
  
    const profileExists = !!this.userService.getUsername();
    if (!profileExists) {
      this.router.navigate(['/create-profile']);
      return;
    }
  
    const alert = await this.alertController.create({
      message: 'Are you sure you want to pick this dog?',
      cssClass: 'alert',
      inputs: [
        {
          name: 'petName',
          type: 'text',
          placeholder: 'Enter pet name',
        },
      ],
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: async (data) => {
            const petName = data.petName?.trim();
            if (!petName) {
              console.warn('Pet name is empty.');
              return;
            }
  
            const dogStats: any = { name: petName, smart: 0, speed: 0, strength: 0, image: '' };
            switch (this.currentSlideIndex) {
              case 0:
                dogStats.image = 'assets/dog 1.png';
                dogStats.smart = 10;
                dogStats.speed = 5;
                dogStats.strength = 5;
                break;
              case 1:
                dogStats.image = 'assets/dog 2.png';
                dogStats.smart = 5;
                dogStats.speed = 10;
                dogStats.strength = 5;
                break;
              case 2:
                dogStats.image = 'assets/dog 3.png';
                dogStats.smart = 5;
                dogStats.speed = 5;
                dogStats.strength = 10;
                break;
            }
  
            const hashedUsername = SHA1(this.userService.getUsername()).toString();
            const hashedPassword = SHA1(this.userService.getUserPassword()).toString();
  
            const selectedDogData = {
              id: new Date().getTime(),
              username: hashedUsername,
              password: hashedPassword,
              petStats: dogStats,
            };
  
            if (this.playMode === 'online') {
              // Store online data in local storage for offline use
              localStorage.setItem('userData', JSON.stringify(selectedDogData));
              this.userService.setSelectedDog(dogStats);
              this.router.navigate(['/game']);
            } else {
              // Save offline data directly in local storage
              localStorage.setItem('userData', JSON.stringify(selectedDogData));
              this.userService.setSelectedDog(dogStats);
              this.router.navigate(['/game']);
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
}
