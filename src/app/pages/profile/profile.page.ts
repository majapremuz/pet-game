import { Component, OnInit, ViewChild, AfterViewInit, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute  } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit, AfterViewInit {
  @ViewChild('levelUpModal', { static: false }) levelUpModal!: IonModal;

  userId: string = '';
  username: string = '';
  petName: string = '';
  petSmart: any;
  petSpeed: any;
  petStrength: any;
  sleepTime: string = '';
  wakeTime: string = '';
  isPasswordFieldVisible: boolean = false;
  isSleepFieldVisible: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  isModalVisible = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private injector: Injector,
    private cdRef: ChangeDetectorRef,
    private alertController: AlertController
  ) {}

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

    ngOnInit() {
      const username = this.userService.getUsername();
      if (!username) {
        this.router.navigateByUrl('/login');
        return;
      }
  
      this.username = username;
      this.userId = this.userService.getUserId();
      console.log("User ID:", this.userId);
  
      // Fetch pet stats based on the user ID
      this.userService.getPetStatsByUserId(this.userId).subscribe((petStats) => {
        if (petStats) {
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

          if (this.router.getCurrentNavigation()?.extras.state?.['levelUp']) {
            this.openModal();
          }
        } else {
          console.warn('No pet stats found for this user.');
        }
      });
  
      this.sleepTime = this.userService.getSleepTime() || '';
    }
  
              
    ngAfterViewInit() {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state?.['levelUp']) {
        this.isModalVisible = true;
        this.openModal();
      }
    }
      
  saveSleepSchedule() {
    this.userService.setSleepTime(this.sleepTime);
    console.log(`Sleep schedule saved: Sleep - ${this.sleepTime}`);
  }
  
  
  openModal() {
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
  }

    upgradeStat(stat: string) {
      switch (stat) {
        case 'smart':
          this.petSmart = (this.petSmart || 0) + 1;
          break;
        case 'speed':
          this.petSpeed = (this.petSpeed || 0) + 1;
          break;
        case 'strength':
          this.petStrength = (this.petStrength || 0) + 1;
          break;
        default:
          console.warn('Stat not found:', stat);
          return;
      }
    
      // Save the updated stats
      this.userService.updatePetStats({
        name: this.petName,
        smart: this.petSmart,
        speed: this.petSpeed,
        strength: this.petStrength,
      }).subscribe(
        () => console.log(`${stat} upgraded successfully.`),
        (error) => console.error(`Failed to upgrade ${stat}:`, error)
      );
    
      this.closeModal();
    }
    
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
    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe(
      response => {
        console.log('Password changed successfully:', response);
      
        this.currentPassword = '';
        this.newPassword = '';
        this.isPasswordFieldVisible = false;
      },
      error => {
        console.error('Failed to change password:', error);
      }
    );
  }*/

    async logOut() {
      const alert = await this.alertController.create({
        header: 'Confirm Logout',
        message: 'Are you sure you want to log out?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Yes',
            handler: () => {
              this.userService.clearUserData();
              this.userService.clearPetData();
              console.log('Logging out, navigating to home');
              this.router.navigateByUrl('/home').then(() => {
                console.log('Navigated to home');
              });
              console.log('User has been logged out.');
            },
          },
        ],
      });
    
      await alert.present();
    }
    
    
        
    onLogInSuccess() {
      this.userService.initializeUserData();
      this.userService.initializePetData();
      console.log("pet service:", this.userService.initializePetData())
    
      const selectedDog = this.userService.getSelectedDog();
      if (!selectedDog) {
        console.log('No selected dog found. Redirecting to pet selection page.');
        this.router.navigateByUrl('/pet-selection');
      } else {
        console.log('Selected dog found:', selectedDog);
        this.router.navigateByUrl('/game');
      }
    }
    

    loadPetStats(userId: string) {
      // Fetch pet stats based on the user ID
      this.userService.getPetStatsByUserId(userId).subscribe((petStats) => {
        this.userService.setSelectedDog(petStats);
        console.log(petStats)
      });
    }
    
  returnToGame() {
    this.router.navigateByUrl('/game');
  }

  async confirmDeleteProfile() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete your profile? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteProfile();
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  deleteProfile() {
    const userId = this.userService.getUserId();
    if (!userId) return;
  
    this.userService.deleteProfile(userId).subscribe({
      next: () => {
        this.userService.logOut();
        this.userService.clearPetData();
        this.router.navigateByUrl('/home');
      },
      error: (err) => console.error('Error deleting profile:', err),
    });
  }

}
