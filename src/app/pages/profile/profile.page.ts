import { Component, OnInit, ViewChild, AfterViewInit, Injector, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { PetService } from 'src/app/services/pet.servise';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit, AfterViewInit {
  @ViewChild('levelUpModal', { static: false }) levelUpModal!: IonModal;

  username: string = '';
  petName: string = '';
  dogStats: any;
  sleepTime: string = '';
  wakeTime: string = '';
  isPasswordFieldVisible: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  isModalVisible = false;


  constructor(
    private router: Router,
    private injector: Injector,
    private cdRef: ChangeDetectorRef
  ) {}

  private get petService(): PetService {
    return this.injector.get(PetService);
  }
  
  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  ngOnInit() {
    this.username = this.userService.getUsername();
    const selectedDog = this.petService.getSelectedDog();
    console.log('Selected Dog from localStorage:', selectedDog); 
    if (selectedDog) {
      this.petName = selectedDog.name;
      this.dogStats = selectedDog.stats;
    }
    const storedSleepTime = this.userService.getSleepTime();
    const storedWakeTime = this.userService.getWakeTime();
    if (storedSleepTime && storedWakeTime) {
      this.sleepTime = storedSleepTime;
      this.wakeTime = storedWakeTime;
    }
  }
  
  ngAfterViewInit() {
    console.log('LevelUpModal:', this.levelUpModal);
    if (this.levelUpModal) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras.state?.['levelUp'] && this.dogStats) {
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

  upgradeStat(stat: string) {
    if (this.dogStats && this.dogStats.hasOwnProperty(stat)) {
      this.dogStats[stat] = (this.dogStats[stat] || 0) + 1;
      this.petService.updateDogStats(this.dogStats); 
      console.log(`${stat} upgraded to:`, this.dogStats[stat]);
    } else {
      console.warn('Stat not found:', stat);
    }
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

  returnToGame() {
    this.router.navigateByUrl('/game');
  }
}
