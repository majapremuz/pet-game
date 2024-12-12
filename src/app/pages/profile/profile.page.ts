import { Component, OnInit, ViewChild, AfterViewInit, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PetService } from 'src/app/services/pet.servise';
//import { AuthService } from 'src/app/services/auth.service';

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
  currentPassword: string = '';
  newPassword: string = '';
  isModalVisible = false;


  constructor(
    private router: Router,
    private injector: Injector,
    private cdRef: ChangeDetectorRef,
    private alertController: AlertController,
    //private authService: AuthService
  ) {}

  private get petService(): PetService {
    return this.injector.get(PetService);
  }
  
  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  /*ngOnInit() {
    this.username = this.userService.getUsername();
    
    // Check if dog data exists in localStorage and restore
    const selectedDog = this.petService.getSelectedDog();
    if (selectedDog) {
      this.petName = selectedDog.name;
      console.log(this.petName)
      this.dogStats = selectedDog.stats;  // Restore dog stats from localStorage
    } else {
      console.warn("No dog found in localStorage.");
    }
  
    this.sleepTime = this.userService.getSleepTime() || '';
    this.wakeTime = this.userService.getWakeTime() || '';
  }*/

    ngOnInit() {
      const username = this.userService.getUsername();
      if (!username) {
        this.router.navigateByUrl('/login');
        return;
      }
    
      this.username = username;
      this.userId = this.userService.getUserId();
      console.log("User ID:", this.userId);
    
      this.petService.getPetStatsByUserId(this.userId).subscribe((petStats) => {
        if (petStats) {
          this.petName = petStats.name;
          this.petSmart = petStats.smart;
          this.petSpeed = petStats.speed;
          this.petStrength = petStats.strength; 
        } else {
          console.warn('No pet stats found for this user.');
        }
      });
      this.sleepTime = this.userService.getSleepTime() || '';
      this.wakeTime = this.userService.getWakeTime() || '';
    }
    
              
  ngAfterViewInit() {
    console.log('LevelUpModal:', this.levelUpModal);
    if (this.levelUpModal) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state?.['levelUp'] && this.petSmart && this.petSpeed && this.petStrength) {
        this.openModal();
      } else {
        console.warn('Modal is not initialized or levelUp flag not set.');
      }
    } else {
      console.error('Modal reference not found!');
    }
  }
  
  saveSleepSchedule() {
    this.userService.setSleepTime(this.sleepTime);
    this.userService.setWakeTime(this.wakeTime);
    console.log(`Sleep schedule saved: Sleep - ${this.sleepTime}, Wake - ${this.wakeTime}`);
  }
  
  

  openModal() {
    this.isModalVisible = true;
    this.levelUpModal?.present().catch(error => console.error('Error presenting modal:', error));
  }

  closeModal() {
    this.isModalVisible = false;
    this.levelUpModal?.dismiss().catch(error => console.error('Error dismissing modal:', error));
  }

  /*upgradeStat(stat: string) {
    if (this.dogStats && this.dogStats.hasOwnProperty(stat)) {
      this.dogStats[stat] = (this.dogStats[stat] || 0) + 1;
      this.petService.updateDogStats(this.dogStats); 
      console.log(`${stat} upgraded to:`, this.dogStats[stat]);
    } else {
      console.warn('Stat not found:', stat);
    }
    this.closeModal();
  }*/

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
      this.petService.updatePetStats({
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

    logOut() {
      this.userService.clearUserData();
      this.petService.clearPetData();
      this.router.navigateByUrl('/home');
    }
    
    onLogInSuccess() {
      this.userService.initializeUserData();
      this.petService.initializePetData();
      console.log("pet service:", this.petService.initializePetData())
    
      const selectedDog = this.petService.getSelectedDog();
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
      this.petService.getPetStatsByUserId(userId).subscribe((petStats) => {
        this.petService.setSelectedDog(petStats);
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
        this.petService.clearPetData();
        this.router.navigateByUrl('/home');
      },
      error: (err) => console.error('Error deleting profile:', err),
    });
  }

}
