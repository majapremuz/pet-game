import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import SHA1 from 'crypto-js/sha1';
import { PushNotifications, Token, PermissionStatus } from '@capacitor/push-notifications';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-create-pet',
    templateUrl: './create-pet.page.html',
    styleUrls: ['./create-pet.page.scss'],
    imports: [IonicModule, CommonModule, FormsModule]
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
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) {}

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
   /* const profileExists = !!this.userService.getUsername();
    if (!profileExists) {
      console.warn('No profile found. Redirecting to create profile.');
      this.router.navigate(['/create-profile']);
      return;
    }*/
    this.showSlide(this.currentSlideIndex);
    //this.promptPlayMode();
  }
  

  async getPushToken(): Promise<string | null> {
    try {
      const permissionStatus: PermissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        await PushNotifications.register();
      } else {
        console.warn('Push Notifications permission denied.');
      }
    } catch (error) {
      console.error('Error during push token retrieval:', error);
    }
    return null;
  }
  
  

  /*async promptPlayMode() {
    if (this.playMode !== null) return; 
  
    const alert = await this.alertController.create({
      message: 'Would you like to play online or offline?',
      cssClass: 'playMode',
      buttons: [
        {
          text: 'Online',
          handler: async () => {
            this.playMode = 'online';
            await this.getPushToken();
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
  }*/
  

  plusSlides(n: number) {
    this.currentSlideIndex += n;
    if (this.currentSlideIndex >= 3) {
      this.currentSlideIndex = 0;
    } else if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = 2;
    }
  }
  
    showSlide(index: number) {
      this.currentSlideIndex = index;
    }
    

    async game() {
      /*if (!this.playMode) {
        await this.promptPlayMode();
        return;
      }*/
    
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
    
              const dogStats = this.getDogStats(this.currentSlideIndex, petName);
    
              if (this.playMode === 'online') {
                this.saveOnline(dogStats);
              } else {
                this.saveOffline(dogStats);
              }
              this.router.navigate(['/game']);
            },
          },
        ],
      });
    
      await alert.present();
    }
    
    getDogStats(index: number, petName: string) {
      const stats = [
        { image: 'assets/dog 1.png', smart: 10, speed: 5, strength: 5 },
        { image: 'assets/dog 2.png', smart: 5, speed: 10, strength: 5 },
        { image: 'assets/dog 3.png', smart: 5, speed: 5, strength: 10 },
      ];
    
      return { ...stats[index], name: petName };
    }
    
    saveOnline(dogStats: any) {
      const selectedDogData = this.prepareDogData(dogStats);
      localStorage.setItem('userData', JSON.stringify(selectedDogData));
      this.userService.setSelectedDog(dogStats);
      this.userService.initializeUserData();
      this.cdr.markForCheck();
    }
    
    saveOffline(dogStats: any) {
      const selectedDogData = this.prepareDogData(dogStats);
      localStorage.setItem('userData', JSON.stringify(selectedDogData));
      this.userService.setSelectedDog(dogStats);
      this.userService.initializeUserData();
    }
    
    prepareDogData(dogStats: any) {
      return {
        id: new Date().getTime(),
        username: SHA1(this.userService.getUsername()).toString(),
        //password: SHA1(this.userService.getUserPassword()).toString(),
        petStats: dogStats,
      };
    }
    
}  
  
