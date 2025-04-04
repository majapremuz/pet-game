import { Component, OnInit, AfterViewInit, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute  } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import * as SHA1 from 'crypto-js/sha1';
import { ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit, AfterViewInit {

  username: string = '';
  level: number = 0;
  petName: string = '';
  petImage: string = '';
  petSmart: any;
  petSpeed: any;
  petStrength: any;
  sleepTime: string = '';
  wakeTime: string = '';
  isPasswordFieldVisible: boolean = false;
  isSleepFieldVisible: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  //isModalVisible = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private injector: Injector,
    private cdRef: ChangeDetectorRef,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.userService.initializeUserData();
  }

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

    ngOnInit() {
      /*const username = localStorage.getItem('username');
      const currentPassword = localStorage.getItem('password');
      console.log("Username:", username, currentPassword);
      if (!username) {
        this.router.navigate(['/login']);
        return;
      }
    
      this.username = username;
      this.currentPassword = currentPassword || '';
      console.log("Username:", this.username);*/
    
      // Fetch pet stats based on the username
      this.userService.getPetStatsByUsername(this.username).subscribe((petStats) => {
        if (petStats) {
          this.petImage = petStats.image;
          this.petName = petStats.name;
          this.petSmart = petStats.smart;
          this.petSpeed = petStats.speed;
          this.petStrength = petStats.strength;
    
          console.log('Pet stats fetched:', {
            name: this.petName,
            smart: this.petSmart,
            speed: this.petSpeed,
            strength: this.petStrength,
          });
    
        }  
      });
    
      this.sleepTime = this.userService.getSleepTime() || '';
      this.level = this.userService.getGameState().level;
      //this.loadLevel();
    }
    
                
    ngAfterViewInit() {
      /*const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state?.['levelUp']) {
        //this.isModalVisible = true;
        //this.openModal();
      }*/
    }
      
    async saveSleepSchedule() {
      this.userService.setSleepTime(this.sleepTime);
      console.log(`Sleep schedule saved: Sleep - ${this.sleepTime}`);
    
      // Show a toast message
      const toast = await this.toastController.create({
        message: `Sleep time set to ${this.sleepTime}.`,
        duration: 3000,
        position: 'middle',
        color: 'success'
      });
    
      await toast.present();
    }
  

  /*openModal() {
    if (!this.levelUpModal) {
      console.error('Modal is not initialized yet!');
      return;
    }
    this.isModalVisible = true;
    this.levelUpModal.present().catch((error) =>
      console.error('Error presenting modal:', error)
    );
  }
  
  closeModal() {
    if (this.levelUpModal) {
      this.levelUpModal.dismiss().catch((error) =>
        console.error('Error dismissing modal:', error)
      );
    }
    this.isModalVisible = false;
  }

  onModalDismiss() {
    this.isModalVisible = false;
  }*/
    
  togglePasswordField() {
    this.isPasswordFieldVisible = !this.isPasswordFieldVisible;
    console.log('Toggling password field visibility');
    this.cdRef.detectChanges();
  }

  toggleSleepField() {
    this.isSleepFieldVisible = !this.isSleepFieldVisible;
    console.log('Toggling sleep field visibility');
    this.cdRef.detectChanges();
  }

  /*changePassword() {
    if (!this.currentPassword || !this.newPassword) {
      console.warn('Both fields are required.');
      return;
    }
  
    // Check if the current password entered by the user matches the stored password
    const storedPassword = this.userService.getUserPassword();
    if (this.currentPassword !== storedPassword) {
      console.warn('Current password is incorrect.');
      return;
    }
  
    // If passwords match, save the new password
    this.userService.setUserPassword(this.newPassword);  // Save the new password
    
    // After attempting to change the password, reset fields and hide the form
    this.currentPassword = '';
    this.newPassword = '';
    console.log("PASSWORD: ", this.currentPassword);
    console.log("NEW PASSWORD: ", this.newPassword);
  
    this.isPasswordFieldVisible = false;
  }*/
  
  
    
  
  async logOut() {
    const alert = await this.alertController.create({
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            // Call the logout method to clear session data and navigate
            this.userService.logOut();
            console.log('User has been logged out.');
          },
        },
      ],
    });
  
    await alert.present();
  }
  
   
    /*onLogInSuccess() {
      this.userService.initializeUserData();
      this.userService.initializePetData();
      console.log("pet service:", this.userService.initializePetData())
    
      const selectedDog = this.userService.getSelectedDog();
      if (!selectedDog) {
        console.log('No selected dog found. Redirecting to pet selection page.');
        this.router.navigate(['/create-pet']);
      } else {
        console.log('Selected dog found:', selectedDog);
        this.router.navigate(['/game']);
      }
    }*/
    

    loadPetStats(userId: string) {
      // Fetch pet stats based on the user ID
      this.userService.getPetStatsByUsername(userId).subscribe((petStats) => {
        this.userService.setSelectedDog(petStats);
        console.log(petStats)
      });
    }

  returnToGame() {
    this.router.navigate(['/game']);
  }

  quitApp() {
    App.exitApp();
  }

  async confirmDeleteProfile() {
    const alert = await this.alertController.create({
      message: 'Are you sure you want to delete your profile? This action cannot be undone.',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
        },
        {
          text: 'YES',
          handler: () => {
            this.userService.deleteProfile(this.username);
          },
        },
      ],
    });
  
    await alert.present();
  }
  
}
