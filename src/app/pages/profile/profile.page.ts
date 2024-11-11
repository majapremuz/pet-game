import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal } from '@ionic/angular';
import { UserService } from '../../services/user.service';
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

  constructor(
    private router: Router,
    private userService: UserService,
    private petService: PetService
  ) {}

  ngOnInit() {
    this.username = this.userService.getUsername();
    const selectedDog = this.petService.getSelectedDog();
    console.log('Selected Dog from localStorage:', selectedDog); 
    if (selectedDog) {
      this.petName = selectedDog.name;
      this.dogStats = selectedDog.stats;
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
    }
  }
  

  openModal() {
    this.levelUpModal?.present().catch(error => console.error('Error presenting modal:', error));
  }

  closeModal() {
    this.levelUpModal?.dismiss().catch(error => console.error('Error dismissing modal:', error));
  }

  upgradeStat(stat: string) {
    if (this.dogStats && this.dogStats.hasOwnProperty(stat)) {
      this.dogStats[stat] = (this.dogStats[stat] || 0) + 1;
      this.petService.updateDogStats(this.dogStats);  // Assuming the updateDogStats method exists in PetService
      console.log(`${stat} upgraded to:`, this.dogStats[stat]);
    } else {
      console.warn('Stat not found:', stat);
    }
    this.closeModal();
  }

  returnToGame() {
    this.router.navigateByUrl('/game');
  }
}
