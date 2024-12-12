import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { PetService } from 'src/app/services/pet.servise';
import { UserService } from 'src/app/services/user.service';
import * as SHA1 from 'crypto-js/sha1';

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
  ) { }

  private get petService(): PetService {
    return this.injector.get(PetService);
  }
  
  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
    this.showSlide(this.currentSlideIndex);
    this.promptPlayMode();
  }

  async promptPlayMode() {
    const alert = await this.alertController.create({
      message: 'Želite li igrati online ili offline?',
      cssClass: 'playMode',
      buttons: [
        {
          text: 'Online',
          handler: () => {
            this.playMode = 'online';
          }
        },
        {
          text: 'Offline',
          handler: () => {
            this.playMode = 'offline';
          }
        }
      ]
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
  
    const profileExists = this.userService.profileExists();
    if (!profileExists) {
      this.router.navigate(['/create-profile']);
      return;
    }
  
    const alert = await this.alertController.create({
      message: 'Are you sure you want to pick this dog?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: async () => {
            this.showInput = true;
  
            // Default dog stats and image
            const dogStats: any = { name: this.petName, smart: 0, speed: 0, strength: 0, image: '' };
  
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
  
            if (this.petName.trim()) {
              dogStats.name = this.petName;
  
              const username = this.userService.getUsername();
              const password = this.userService.getUserPassword();
  
              // Hash the username and password
              const hashedUsername = SHA1(username).toString();
              const hashedPassword = SHA1(password).toString();
  
              if (this.playMode === 'online') {
                const pushToken = 'pushToken123'; // Replace with actual push token
  
                const onlineData = {
                  username: hashedUsername,
                  password: hashedPassword,
                  pushToken: pushToken,
                  petStats: dogStats,
                };
  
                this.userService
                  .saveOnlineData(onlineData)
                  .subscribe(
                    (response) => {
                      console.log('Online data saved:', response);
                      this.petService.setSelectedDog(dogStats);
                      this.router.navigate(['/game']);
                    },
                    (error) => console.error('Error saving online data:', error)
                  );
              } else if (this.playMode === 'offline') {
                this.userService.saveOfflineData(hashedUsername);
  
                this.petService.setSelectedDog(dogStats); 
                this.router.navigate(['/game']);
              }
            } else {
              console.warn('Pet name is empty or not set.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

}
